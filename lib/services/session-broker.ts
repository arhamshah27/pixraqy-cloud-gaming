/**
 * Session Broker Service
 * Orchestrates the gaming session lifecycle:
 * - Authentication & ownership verification
 * - Credit reservation & payment
 * - Host allocation (warm pool or launch new EC2)
 * - Wait for host-agent registration
 * - Generate GameStream pairing info
 */

import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { createClient } from "@/utils/supabase/server";
import {
  launchGamingInstance,
  getInstanceInfo,
  waitForInstanceState,
  type InstanceInfo,
} from "@/lib/aws/ec2";
import {
  mockLaunchGamingInstance,
  mockWaitForInstanceState,
  mockGetInstanceInfo,
  isMockMode,
  logMockModeStatus,
} from "@/lib/aws/mock-ec2";
import {
  recordSessionStarted,
  logSessionEvent,
  recordSessionFailed,
} from "@/lib/aws/cloudwatch";

export interface CreateSessionRequest {
  gameId: string;
  userId: string;
  preferredClient?: "moonlight" | "web";
  instanceType?: string;
  enforceSteamOwnership?: boolean;
}

export interface GameStreamInfo {
  pairingQR: string; // Data URI or URL
  pairingCode: string;
  port: number;
  recommendedClient: string;
  instructions: string;
}

export interface SessionResponse {
  sessionId: string;
  instanceId: string;
  publicIp: string;
  gameStream: GameStreamInfo;
  logsEndpoint: string;
  metricsEndpoint: string;
  status: string;
}

export interface Session {
  id: string;
  user_id: string;
  game_id: string;
  instance_id?: string;
  public_ip?: string;
  private_ip?: string;
  instance_type: string;
  status: string;
  sunshine_port: number;
  pairing_code?: string;
  pairing_qr_data?: string;
  preferred_client: string;
  credits_reserved: number;
  credits_consumed: number;
  hourly_rate: number;
  created_at: string;
  launched_at?: string;
  updated_at: string;
}

/**
 * Main session creation flow
 */
export async function createSession(
  request: CreateSessionRequest
): Promise<SessionResponse> {
  const supabase = await createClient();
  const sessionId = uuidv4();

  try {
    console.log(`[SessionBroker] Creating session ${sessionId} for user ${request.userId}`);

    // Step 1: Validate user authentication (assumed done by API route)
    // Step 2: Verify game ownership (optional)
    const ownershipValid = await verifyGameOwnership(
      request.userId,
      request.gameId,
      request.enforceSteamOwnership
    );

    if (!ownershipValid) {
      throw new Error("Game ownership verification failed");
    }

    // Step 3: Check user credits and reserve
    const creditsReserved = await reserveCredits(request.userId, sessionId);
    if (creditsReserved === 0) {
      throw new Error("Insufficient credits. Please purchase more credits.");
    }

    // Step 4: Create session record
    const session = await createSessionRecord(sessionId, request, creditsReserved);

    // Step 5: Allocate host (warm pool or launch new)
    const instanceInfo = await allocateHost(session);

    // Step 6: Update session with instance info
    await updateSessionWithInstance(sessionId, instanceInfo);

    // Step 7: Wait for host-agent to register (with timeout)
    const agentReady = await waitForHostAgent(
      sessionId,
      instanceInfo.instanceId,
      120000 // 2 minutes
    );

    if (!agentReady) {
      await updateSessionStatus(sessionId, "failed", "Host agent did not register in time");
      throw new Error("Host agent registration timeout");
    }

    // Step 8: Generate pairing code and QR
    const gameStreamInfo = await generateGameStreamInfo(
      sessionId,
      instanceInfo.publicIp!,
      request.preferredClient || "moonlight"
    );

    // Step 9: Update session with pairing info
    await updateSessionWithPairingInfo(sessionId, gameStreamInfo);

    // Step 10: Record metrics
    await recordSessionStarted(sessionId, request.userId);
    await logSessionEvent(sessionId, "session_created", "Session created successfully", {
      gameId: request.gameId,
      instanceId: instanceInfo.instanceId,
    });

    // Step 11: Return session info to client
    return {
      sessionId,
      instanceId: instanceInfo.instanceId,
      publicIp: instanceInfo.publicIp!,
      gameStream: gameStreamInfo,
      logsEndpoint: `/api/v1/sessions/${sessionId}/logs`,
      metricsEndpoint: `/api/v1/sessions/${sessionId}/metrics`,
      status: "pairing",
    };
  } catch (error: any) {
    console.error(`[SessionBroker] Error creating session ${sessionId}:`, error.message);

    // Update session status to failed
    await updateSessionStatus(sessionId, "failed", error.message);

    // Record failure metric
    await recordSessionFailed(sessionId, request.userId, error.message);

    throw error;
  }
}

/**
 * Verifies game ownership via Steam or database
 */
async function verifyGameOwnership(
  userId: string,
  gameId: string,
  enforce: boolean = false
): Promise<boolean> {
  const supabase = await createClient();

  // Check if enforcement is enabled globally
  const enforcementEnabled = process.env.ENFORCE_GAME_OWNERSHIP === "true" || enforce;

  if (!enforcementEnabled) {
    console.log("[SessionBroker] Game ownership enforcement disabled");
    return true;
  }

  try {
    // Check database for verified ownership
    const { data, error } = await supabase
      .from("game_ownership")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .eq("verified", true)
      .single();

    if (error || !data) {
      console.warn(`[SessionBroker] No verified ownership for user ${userId}, game ${gameId}`);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("[SessionBroker] Error verifying game ownership:", error.message);
    return false;
  }
}

/**
 * Reserves credits for the session
 */
async function reserveCredits(userId: string, sessionId: string): Promise<number> {
  const supabase = await createClient();

  const hourlyRate = parseFloat(process.env.HOURLY_CREDIT_RATE || "10");
  const reservationAmount = hourlyRate; // Reserve 1 hour worth

  try {
    // Get current user credits
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error("User not found");
    }

    if (user.credits < reservationAmount) {
      console.warn(`[SessionBroker] Insufficient credits for user ${userId}`);
      return 0;
    }

    // Deduct credits (reserve them)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        credits: user.credits - reservationAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      throw new Error("Failed to reserve credits");
    }

    console.log(`[SessionBroker] Reserved ${reservationAmount} credits for session ${sessionId}`);
    return reservationAmount;
  } catch (error: any) {
    console.error("[SessionBroker] Error reserving credits:", error.message);
    return 0;
  }
}

/**
 * Creates a session record in the database
 */
async function createSessionRecord(
  sessionId: string,
  request: CreateSessionRequest,
  creditsReserved: number
): Promise<Session> {
  const supabase = await createClient();

  const sessionData = {
    id: sessionId,
    user_id: request.userId,
    game_id: request.gameId,
    instance_type: request.instanceType || process.env.EC2_INSTANCE_TYPE || "g4dn.xlarge",
    status: "pending",
    sunshine_port: 47984,
    preferred_client: request.preferredClient || "moonlight",
    credits_reserved: creditsReserved,
    credits_consumed: 0,
    hourly_rate: parseFloat(process.env.HOURLY_CREDIT_RATE || "10"),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("gaming_sessions")
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session record: ${error.message}`);
  }

  console.log(`[SessionBroker] Created session record ${sessionId}`);
  return data as Session;
}

/**
 * Allocates a host from warm pool or launches new instance
 */
async function allocateHost(session: Session): Promise<InstanceInfo> {
  const supabase = await createClient();
  const useWarmPool = process.env.USE_WARM_POOL === "true";
  const useMockMode = isMockMode();

  // Log mock mode status
  if (useMockMode) {
    logMockModeStatus();
  }

  // Try to allocate from warm pool first
  if (useWarmPool && !useMockMode) {
    const warmHost = await allocateFromWarmPool(session.id);
    if (warmHost) {
      console.log(`[SessionBroker] Allocated warm host ${warmHost.instanceId} for session ${session.id}`);
      return warmHost;
    }
  }

  // Launch new instance (or mock instance in dev mode)
  console.log(`[SessionBroker] Launching ${useMockMode ? "MOCK" : "EC2"} instance for session ${session.id}`);

  await updateSessionStatus(session.id, "launching", `Launching ${useMockMode ? "mock" : "EC2"} instance`);

  let instanceInfo: InstanceInfo;

  if (useMockMode) {
    // Use mock EC2 for development (no AWS costs)
    instanceInfo = await mockLaunchGamingInstance(session.id, session.user_id);
  } else {
    // Real AWS EC2 launch
    instanceInfo = await launchGamingInstance(session.id, session.user_id, {
      instanceType: session.instance_type,
    });
  }

  // Wait for instance to be running
  const running = useMockMode
    ? await mockWaitForInstanceState(instanceInfo.instanceId, "running")
    : await waitForInstanceState(instanceInfo.instanceId, "running", 300000);

  if (!running) {
    throw new Error("Instance failed to reach running state");
  }

  // Get updated instance info (with public IP)
  const updatedInfo = useMockMode
    ? await mockGetInstanceInfo(instanceInfo.instanceId)
    : await getInstanceInfo(instanceInfo.instanceId);

  if (!updatedInfo || !updatedInfo.publicIp) {
    throw new Error("Instance launched but no public IP assigned");
  }

  console.log(`[SessionBroker] Instance ${updatedInfo.instanceId} is running at ${updatedInfo.publicIp}`);

  return updatedInfo;
}

/**
 * Attempts to allocate a host from the warm pool
 */
async function allocateFromWarmPool(sessionId: string): Promise<InstanceInfo | null> {
  const supabase = await createClient();

  try {
    // Find an available host
    const { data: hosts, error } = await supabase
      .from("host_pool")
      .select("*")
      .eq("status", "available")
      .eq("health_status", "healthy")
      .eq("sunshine_healthy", true)
      .limit(1);

    if (error || !hosts || hosts.length === 0) {
      return null;
    }

    const host = hosts[0];

    // Allocate the host
    const { error: updateError } = await supabase
      .from("host_pool")
      .update({
        status: "allocated",
        allocated_to_session: sessionId,
        allocated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", host.id)
      .eq("status", "available"); // Prevent race condition

    if (updateError) {
      return null;
    }

    return {
      instanceId: host.instance_id,
      state: "running",
      publicIp: host.public_ip,
      privateIp: host.private_ip,
    };
  } catch (error: any) {
    console.error("[SessionBroker] Error allocating from warm pool:", error.message);
    return null;
  }
}

/**
 * Updates session with instance information
 */
async function updateSessionWithInstance(
  sessionId: string,
  instanceInfo: InstanceInfo
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("gaming_sessions")
    .update({
      instance_id: instanceInfo.instanceId,
      public_ip: instanceInfo.publicIp,
      private_ip: instanceInfo.privateIp,
      status: "running",
      launched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  console.log(`[SessionBroker] Updated session ${sessionId} with instance ${instanceInfo.instanceId}`);
}

/**
 * Waits for host-agent to register and report healthy
 */
async function waitForHostAgent(
  sessionId: string,
  instanceId: string,
  timeoutMs: number = 120000
): Promise<boolean> {
  const supabase = await createClient();
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds

  console.log(`[SessionBroker] Waiting for host-agent on instance ${instanceId}`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const { data: host, error } = await supabase
        .from("host_pool")
        .select("*")
        .eq("instance_id", instanceId)
        .eq("sunshine_healthy", true)
        .single();

      if (host && !error) {
        console.log(`[SessionBroker] Host-agent registered for instance ${instanceId}`);
        return true;
      }
    } catch (error: any) {
      // Continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  console.error(`[SessionBroker] Timeout waiting for host-agent on instance ${instanceId}`);
  return false;
}

/**
 * Generates GameStream pairing information
 */
async function generateGameStreamInfo(
  sessionId: string,
  publicIp: string,
  preferredClient: string
): Promise<GameStreamInfo> {
  // Generate a simple pairing code
  const pairingCode = generatePairingCode();

  // Generate pairing URL for Moonlight
  const moonlightUrl = `moonlight://${publicIp}:47984?code=${pairingCode}`;

  // Generate QR code as data URI
  const qrDataUri = await QRCode.toDataURL(moonlightUrl, {
    errorCorrectionLevel: "M",
    width: 300,
    margin: 2,
  });

  const instructions = `
To connect with Moonlight:
1. Install Moonlight on your device (Windows/Mac/Linux/iOS/Android)
2. Scan the QR code or manually enter:
   - Host: ${publicIp}
   - Port: 47984
   - Pairing Code: ${pairingCode}
3. Launch your game from the Moonlight host list
  `.trim();

  return {
    pairingQR: qrDataUri,
    pairingCode,
    port: 47984,
    recommendedClient: preferredClient,
    instructions,
  };
}

/**
 * Generates a random pairing code (4 digits)
 */
function generatePairingCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Updates session with pairing information
 */
async function updateSessionWithPairingInfo(
  sessionId: string,
  gameStreamInfo: GameStreamInfo
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("gaming_sessions")
    .update({
      pairing_code: gameStreamInfo.pairingCode,
      pairing_qr_data: gameStreamInfo.pairingQR,
      status: "pairing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  console.log(`[SessionBroker] Updated session ${sessionId} with pairing info`);
}

/**
 * Updates session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  await supabase.from("gaming_sessions").update(updateData).eq("id", sessionId);

  console.log(`[SessionBroker] Updated session ${sessionId} status to ${status}`);
}

/**
 * Gets session details
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gaming_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Session;
}
