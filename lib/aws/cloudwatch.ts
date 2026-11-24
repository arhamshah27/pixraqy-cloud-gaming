/**
 * AWS CloudWatch Integration
 * Handles metrics and logging for gaming sessions and host monitoring
 */

import {
  PutMetricDataCommand,
  MetricDatum,
  StandardUnit,
} from "@aws-sdk/client-cloudwatch";
import {
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
  ResourceAlreadyExistsException,
} from "@aws-sdk/client-cloudwatch-logs";
import { getCloudWatchClient, getCloudWatchLogsClient } from "./config";

const CLOUDWATCH_NAMESPACE = "Pixray/Gaming";
const LOG_GROUP_NAME = "/pixray/gaming-sessions";

export interface SessionMetric {
  sessionId: string;
  userId: string;
  metricName: string;
  value: number;
  unit?: StandardUnit;
  dimensions?: Record<string, string>;
}

export interface HostMetric {
  hostId: string;
  instanceId: string;
  cpuUsage?: number;
  memoryUsage?: number;
  gpuUsage?: number;
  gpuTemperature?: number;
  networkRxMbps?: number;
  networkTxMbps?: number;
  activeStreams?: number;
}

/**
 * Publishes a custom metric to CloudWatch
 */
export async function publishMetric(
  metricName: string,
  value: number,
  unit: StandardUnit = StandardUnit.None,
  dimensions: Record<string, string> = {}
): Promise<boolean> {
  const client = getCloudWatchClient();

  try {
    const metricDatum: MetricDatum = {
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date(),
      Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({
        Name,
        Value,
      })),
    };

    const command = new PutMetricDataCommand({
      Namespace: CLOUDWATCH_NAMESPACE,
      MetricData: [metricDatum],
    });

    await client.send(command);
    return true;
  } catch (error: any) {
    console.error(`[CloudWatch] Error publishing metric ${metricName}:`, error.message);
    return false;
  }
}

/**
 * Publishes multiple metrics in a batch
 */
export async function publishMetrics(metrics: SessionMetric[]): Promise<boolean> {
  const client = getCloudWatchClient();

  try {
    const metricData: MetricDatum[] = metrics.map((metric) => ({
      MetricName: metric.metricName,
      Value: metric.value,
      Unit: metric.unit || StandardUnit.None,
      Timestamp: new Date(),
      Dimensions: [
        { Name: "SessionId", Value: metric.sessionId },
        { Name: "UserId", Value: metric.userId },
        ...Object.entries(metric.dimensions || {}).map(([Name, Value]) => ({
          Name,
          Value,
        })),
      ],
    }));

    const command = new PutMetricDataCommand({
      Namespace: CLOUDWATCH_NAMESPACE,
      MetricData: metricData,
    });

    await client.send(command);
    return true;
  } catch (error: any) {
    console.error("[CloudWatch] Error publishing batch metrics:", error.message);
    return false;
  }
}

/**
 * Publishes host metrics to CloudWatch
 */
export async function publishHostMetrics(hostMetric: HostMetric): Promise<boolean> {
  const client = getCloudWatchClient();

  const metricData: MetricDatum[] = [];

  const baseDimensions = [
    { Name: "HostId", Value: hostMetric.hostId },
    { Name: "InstanceId", Value: hostMetric.instanceId },
  ];

  if (hostMetric.cpuUsage !== undefined) {
    metricData.push({
      MetricName: "HostCPUUsage",
      Value: hostMetric.cpuUsage,
      Unit: StandardUnit.Percent,
      Timestamp: new Date(),
      Dimensions: baseDimensions,
    });
  }

  if (hostMetric.memoryUsage !== undefined) {
    metricData.push({
      MetricName: "HostMemoryUsage",
      Value: hostMetric.memoryUsage,
      Unit: StandardUnit.Percent,
      Timestamp: new Date(),
      Dimensions: baseDimensions,
    });
  }

  if (hostMetric.gpuUsage !== undefined) {
    metricData.push({
      MetricName: "HostGPUUsage",
      Value: hostMetric.gpuUsage,
      Unit: StandardUnit.Percent,
      Timestamp: new Date(),
      Dimensions: baseDimensions,
    });
  }

  if (hostMetric.gpuTemperature !== undefined) {
    metricData.push({
      MetricName: "HostGPUTemperature",
      Value: hostMetric.gpuTemperature,
      Unit: StandardUnit.None,
      Timestamp: new Date(),
      Dimensions: baseDimensions,
    });
  }

  if (hostMetric.networkRxMbps !== undefined) {
    metricData.push({
      MetricName: "HostNetworkRx",
      Value: hostMetric.networkRxMbps,
      Unit: StandardUnit.Megabits,
      Timestamp: new Date(),
      Dimensions: baseDimensions,
    });
  }

  if (hostMetric.networkTxMbps !== undefined) {
    metricData.push({
      MetricName: "HostNetworkTx",
      Value: hostMetric.networkTxMbps,
      Unit: StandardUnit.Megabits,
      Timestamp: new Date(),
      Dimensions: baseDimensions,
    });
  }

  if (hostMetric.activeStreams !== undefined) {
    metricData.push({
      MetricName: "HostActiveStreams",
      Value: hostMetric.activeStreams,
      Unit: StandardUnit.Count,
      Timestamp: new Date(),
      Dimensions: baseDimensions,
    });
  }

  if (metricData.length === 0) {
    return false;
  }

  try {
    const command = new PutMetricDataCommand({
      Namespace: CLOUDWATCH_NAMESPACE,
      MetricData: metricData,
    });

    await client.send(command);
    return true;
  } catch (error: any) {
    console.error("[CloudWatch] Error publishing host metrics:", error.message);
    return false;
  }
}

/**
 * Creates a CloudWatch log group if it doesn't exist
 */
export async function ensureLogGroup(logGroupName: string = LOG_GROUP_NAME): Promise<boolean> {
  const client = getCloudWatchLogsClient();

  try {
    const command = new CreateLogGroupCommand({
      logGroupName,
    });

    await client.send(command);
    console.log(`[CloudWatch] Created log group: ${logGroupName}`);
    return true;
  } catch (error: any) {
    if (error instanceof ResourceAlreadyExistsException) {
      // Log group already exists, which is fine
      return true;
    }
    console.error(`[CloudWatch] Error creating log group ${logGroupName}:`, error.message);
    return false;
  }
}

/**
 * Creates a CloudWatch log stream if it doesn't exist
 */
export async function ensureLogStream(
  logStreamName: string,
  logGroupName: string = LOG_GROUP_NAME
): Promise<boolean> {
  const client = getCloudWatchLogsClient();

  try {
    const command = new CreateLogStreamCommand({
      logGroupName,
      logStreamName,
    });

    await client.send(command);
    console.log(`[CloudWatch] Created log stream: ${logStreamName}`);
    return true;
  } catch (error: any) {
    if (error instanceof ResourceAlreadyExistsException) {
      // Log stream already exists, which is fine
      return true;
    }
    console.error(`[CloudWatch] Error creating log stream ${logStreamName}:`, error.message);
    return false;
  }
}

/**
 * Publishes log events to CloudWatch Logs
 */
export async function publishLogs(
  logStreamName: string,
  messages: string[],
  logGroupName: string = LOG_GROUP_NAME
): Promise<boolean> {
  const client = getCloudWatchLogsClient();

  if (messages.length === 0) {
    return true;
  }

  try {
    // Ensure log group and stream exist
    await ensureLogGroup(logGroupName);
    await ensureLogStream(logStreamName, logGroupName);

    const logEvents = messages.map((message) => ({
      message,
      timestamp: Date.now(),
    }));

    const command = new PutLogEventsCommand({
      logGroupName,
      logStreamName,
      logEvents,
    });

    await client.send(command);
    return true;
  } catch (error: any) {
    console.error("[CloudWatch] Error publishing logs:", error.message);
    return false;
  }
}

/**
 * Logs a session event to CloudWatch
 */
export async function logSessionEvent(
  sessionId: string,
  eventType: string,
  message: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const logStreamName = `session-${sessionId}`;

  const logMessage = JSON.stringify({
    timestamp: new Date().toISOString(),
    sessionId,
    eventType,
    message,
    metadata,
  });

  return await publishLogs(logStreamName, [logMessage]);
}

/**
 * Standard session lifecycle metrics
 */
export async function recordSessionStarted(sessionId: string, userId: string): Promise<boolean> {
  return await publishMetric("SessionStarted", 1, StandardUnit.Count, {
    SessionId: sessionId,
    UserId: userId,
  });
}

export async function recordSessionEnded(
  sessionId: string,
  userId: string,
  durationMinutes: number
): Promise<boolean> {
  const metrics: SessionMetric[] = [
    {
      sessionId,
      userId,
      metricName: "SessionEnded",
      value: 1,
      unit: StandardUnit.Count,
    },
    {
      sessionId,
      userId,
      metricName: "SessionDuration",
      value: durationMinutes,
      unit: StandardUnit.Minutes,
    },
  ];

  return await publishMetrics(metrics);
}

export async function recordSessionFailed(
  sessionId: string,
  userId: string,
  reason: string
): Promise<boolean> {
  await logSessionEvent(sessionId, "session_failed", reason);

  return await publishMetric("SessionFailed", 1, StandardUnit.Count, {
    SessionId: sessionId,
    UserId: userId,
    FailureReason: reason,
  });
}
