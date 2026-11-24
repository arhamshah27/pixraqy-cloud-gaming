/**
 * Mock EC2 Service for Local Development
 * Simulates AWS EC2 without making real API calls or incurring costs
 */

import type { InstanceInfo } from "./ec2";

// Simulated delay to mimic real AWS API latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock EC2 instance launch (no real AWS calls)
 */
export async function mockLaunchGamingInstance(
  sessionId: string,
  userId: string
): Promise<InstanceInfo> {
  console.log(`[MOCK EC2] Simulating instance launch for session ${sessionId}`);

  // Simulate AWS API delay
  await delay(2000);

  // Generate mock instance ID
  const mockInstanceId = `i-mock${Math.random().toString(36).substring(2, 15)}`;
  const mockPublicIp = `192.0.2.${Math.floor(Math.random() * 255)}`;

  console.log(`[MOCK EC2] Mock instance launched: ${mockInstanceId}`);

  return {
    instanceId: mockInstanceId,
    state: "running",
    publicIp: mockPublicIp,
    privateIp: `10.0.1.${Math.floor(Math.random() * 255)}`,
    launchTime: new Date(),
    tags: {
      SessionId: sessionId,
      UserId: userId,
      Environment: "mock-development",
    },
  };
}

/**
 * Mock instance termination
 */
export async function mockTerminateInstance(instanceId: string): Promise<boolean> {
  console.log(`[MOCK EC2] Simulating termination of instance ${instanceId}`);

  await delay(500);

  console.log(`[MOCK EC2] Mock instance ${instanceId} terminated`);
  return true;
}

/**
 * Mock instance info retrieval
 */
export async function mockGetInstanceInfo(instanceId: string): Promise<InstanceInfo | null> {
  console.log(`[MOCK EC2] Getting info for mock instance ${instanceId}`);

  await delay(200);

  return {
    instanceId,
    state: "running",
    publicIp: `192.0.2.${Math.floor(Math.random() * 255)}`,
    privateIp: `10.0.1.${Math.floor(Math.random() * 255)}`,
    tags: {
      Environment: "mock-development",
    },
  };
}

/**
 * Mock instance ready check (always returns true for dev)
 */
export async function mockIsInstanceReady(instanceId: string): Promise<boolean> {
  console.log(`[MOCK EC2] Checking if mock instance ${instanceId} is ready`);

  await delay(500);

  return true;
}

/**
 * Mock wait for instance state
 */
export async function mockWaitForInstanceState(
  instanceId: string,
  targetState: string = "running"
): Promise<boolean> {
  console.log(`[MOCK EC2] Waiting for instance ${instanceId} to reach state: ${targetState}`);

  // Simulate startup time (3 seconds)
  await delay(3000);

  console.log(`[MOCK EC2] Instance ${instanceId} reached state: ${targetState}`);
  return true;
}

/**
 * Check if mock mode is enabled
 */
export function isMockMode(): boolean {
  return process.env.ENABLE_MOCK_MODE === "true" || process.env.NODE_ENV === "development";
}

/**
 * Log mock mode status
 */
export function logMockModeStatus(): void {
  if (isMockMode()) {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 MOCK MODE ENABLED - No AWS costs will be incurred");
    console.log("=".repeat(60) + "\n");
  }
}
