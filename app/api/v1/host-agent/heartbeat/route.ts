/**
 * POST /api/v1/host-agent/heartbeat
 * Receives heartbeat from host-agent running on Windows instances
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { publishHostMetrics } from "@/lib/aws/cloudwatch";

interface HeartbeatPayload {
  instanceId: string;
  agentVersion: string;
  agentSecret: string; // For authentication
  gpuModel?: string;
  gpuDriverVersion?: string;
  gpuEncoder?: string;
  cpuCores?: number;
  memoryMb?: number;
  sunshineVersion?: string;
  sunshineHealthy?: boolean;
  // Metrics
  cpuUsagePercent?: number;
  memoryUsagePercent?: number;
  gpuUsagePercent?: number;
  gpuTempCelsius?: number;
  networkRxMbps?: number;
  networkTxMbps?: number;
  activeStreams?: number;
  streamBitrateMbps?: number;
  streamFps?: number;
  streamLatencyMs?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const payload: HeartbeatPayload = await request.json();

    // Validate agent secret
    const expectedSecret = process.env.HOST_AGENT_SECRET || "changeme";
    if (payload.agentSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Invalid agent secret" },
        { status: 401 }
      );
    }

    const { instanceId } = payload;

    if (!instanceId) {
      return NextResponse.json(
        { error: "instanceId is required" },
        { status: 400 }
      );
    }

    // Check if host exists in pool
    const { data: existingHost, error: findError } = await supabase
      .from("host_pool")
      .select("*")
      .eq("instance_id", instanceId)
      .single();

    const now = new Date().toISOString();

    if (findError || !existingHost) {
      // Register new host
      const { error: insertError } = await supabase.from("host_pool").insert([
        {
          instance_id: instanceId,
          status: "warming",
          health_status: "healthy",
          gpu_model: payload.gpuModel,
          gpu_driver_version: payload.gpuDriverVersion,
          gpu_encoder: payload.gpuEncoder,
          cpu_cores: payload.cpuCores,
          memory_mb: payload.memoryMb,
          sunshine_version: payload.sunshineVersion,
          sunshine_healthy: payload.sunshineHealthy || false,
          last_heartbeat: now,
          agent_version: payload.agentVersion,
          created_at: now,
          updated_at: now,
        },
      ]);

      if (insertError) {
        console.error("[HostAgent] Error registering host:", insertError.message);
        return NextResponse.json(
          { error: "Failed to register host" },
          { status: 500 }
        );
      }

      console.log(`[HostAgent] Registered new host: ${instanceId}`);
    } else {
      // Update existing host
      const { error: updateError } = await supabase
        .from("host_pool")
        .update({
          health_status: "healthy",
          gpu_model: payload.gpuModel || existingHost.gpu_model,
          gpu_driver_version:
            payload.gpuDriverVersion || existingHost.gpu_driver_version,
          gpu_encoder: payload.gpuEncoder || existingHost.gpu_encoder,
          sunshine_version: payload.sunshineVersion || existingHost.sunshine_version,
          sunshine_healthy: payload.sunshineHealthy ?? existingHost.sunshine_healthy,
          last_heartbeat: now,
          agent_version: payload.agentVersion,
          updated_at: now,
        })
        .eq("instance_id", instanceId);

      if (updateError) {
        console.error("[HostAgent] Error updating host:", updateError.message);
        return NextResponse.json(
          { error: "Failed to update host" },
          { status: 500 }
        );
      }
    }

    // Get host ID for metrics
    const { data: host } = await supabase
      .from("host_pool")
      .select("id, allocated_to_session")
      .eq("instance_id", instanceId)
      .single();

    // Store metrics if provided
    if (host && hasMetrics(payload)) {
      await storeMetrics(host.id, host.allocated_to_session, payload);

      // Publish to CloudWatch
      await publishHostMetrics({
        hostId: host.id,
        instanceId,
        cpuUsage: payload.cpuUsagePercent,
        memoryUsage: payload.memoryUsagePercent,
        gpuUsage: payload.gpuUsagePercent,
        gpuTemperature: payload.gpuTempCelsius,
        networkRxMbps: payload.networkRxMbps,
        networkTxMbps: payload.networkTxMbps,
        activeStreams: payload.activeStreams,
      });
    }

    // Check if host should transition to available
    let responseCommand = null;
    if (existingHost?.status === "warming" && payload.sunshineHealthy) {
      await supabase
        .from("host_pool")
        .update({ status: "available", updated_at: now })
        .eq("instance_id", instanceId);

      console.log(`[HostAgent] Host ${instanceId} is now available`);
    }

    return NextResponse.json({
      success: true,
      message: "Heartbeat received",
      command: responseCommand,
    });
  } catch (error: any) {
    console.error("[HostAgent] Error processing heartbeat:", error.message);
    return NextResponse.json(
      { error: "Failed to process heartbeat", details: error.message },
      { status: 500 }
    );
  }
}

function hasMetrics(payload: HeartbeatPayload): boolean {
  return !!(
    payload.cpuUsagePercent ||
    payload.memoryUsagePercent ||
    payload.gpuUsagePercent ||
    payload.networkRxMbps
  );
}

async function storeMetrics(
  hostId: string,
  sessionId: string | null,
  payload: HeartbeatPayload
): Promise<void> {
  const supabase = await createClient();

  const metricsData = {
    host_id: hostId,
    session_id: sessionId,
    cpu_usage_percent: payload.cpuUsagePercent,
    memory_usage_percent: payload.memoryUsagePercent,
    gpu_usage_percent: payload.gpuUsagePercent,
    gpu_temp_celsius: payload.gpuTempCelsius,
    network_rx_mbps: payload.networkRxMbps,
    network_tx_mbps: payload.networkTxMbps,
    active_streams: payload.activeStreams,
    stream_bitrate_mbps: payload.streamBitrateMbps,
    stream_fps: payload.streamFps,
    stream_latency_ms: payload.streamLatencyMs,
    recorded_at: new Date().toISOString(),
  };

  await supabase.from("host_metrics").insert([metricsData]);
}
