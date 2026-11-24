/**
 * AWS EC2 Instance Lifecycle Manager
 * Handles launching, managing, and terminating EC2 instances for gaming sessions
 */

import {
  RunInstancesCommand,
  TerminateInstancesCommand,
  DescribeInstancesCommand,
  DescribeInstanceStatusCommand,
  CreateTagsCommand,
  Instance,
  InstanceStateName,
} from "@aws-sdk/client-ec2";
import { getEC2Client } from "./config";
import { getPixraySecrets } from "./secrets";

export interface LaunchInstanceOptions {
  amiId?: string;
  instanceType?: string;
  subnetId?: string;
  securityGroupIds?: string[];
  userData?: string;
  tags?: Record<string, string>;
  keyName?: string;
  iamInstanceProfile?: string;
}

export interface InstanceInfo {
  instanceId: string;
  state: string;
  publicIp?: string;
  privateIp?: string;
  launchTime?: Date;
  tags?: Record<string, string>;
}

/**
 * Launches a new EC2 instance for gaming
 */
export async function launchGamingInstance(
  sessionId: string,
  userId: string,
  options: LaunchInstanceOptions = {}
): Promise<InstanceInfo> {
  const ec2Client = getEC2Client();
  const secrets = await getPixraySecrets();

  // Get configuration from environment or options
  const amiId = options.amiId || secrets.WINDOWS_AMI_ID || process.env.WINDOWS_AMI_ID;
  const instanceType = options.instanceType || process.env.EC2_INSTANCE_TYPE || "g4dn.xlarge";
  const subnetId = options.subnetId || process.env.EC2_SUBNET_ID;
  const securityGroupIds = options.securityGroupIds || [process.env.EC2_SECURITY_GROUP_ID!];
  const keyName = options.keyName || process.env.EC2_KEY_NAME;
  const iamInstanceProfile = options.iamInstanceProfile || process.env.EC2_IAM_INSTANCE_PROFILE;

  if (!amiId) {
    throw new Error("AMI ID not configured. Set WINDOWS_AMI_ID in Secrets Manager or environment.");
  }

  if (!securityGroupIds || securityGroupIds.length === 0) {
    throw new Error("Security Group ID not configured. Set EC2_SECURITY_GROUP_ID in environment.");
  }

  // Build user data script
  const userData = options.userData || buildDefaultUserData(sessionId);
  const userDataBase64 = Buffer.from(userData).toString("base64");

  // Prepare tags
  const tags = {
    Name: `pixray-gaming-${sessionId}`,
    SessionId: sessionId,
    UserId: userId,
    Application: "Pixray-Cloud",
    ManagedBy: "pixray-control-plane",
    ...options.tags,
  };

  try {
    console.log(`[EC2] Launching instance for session ${sessionId}`);
    console.log(`[EC2] AMI: ${amiId}, InstanceType: ${instanceType}`);

    // Build command with network interfaces to ensure public IP assignment
    const commandParams: any = {
      ImageId: amiId,
      InstanceType: instanceType,
      MinCount: 1,
      MaxCount: 1,
      UserData: userDataBase64,
      ...(keyName && { KeyName: keyName }),
      ...(iamInstanceProfile && {
        IamInstanceProfile: { Name: iamInstanceProfile },
      }),
      TagSpecifications: [
        {
          ResourceType: "instance",
          Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
        },
      ],
      // Enable detailed monitoring for better observability
      Monitoring: { Enabled: true },
      // Disable termination protection (we want to be able to terminate)
      DisableApiTermination: false,
      // Instance metadata service v2 (IMDSv2) for better security
      MetadataOptions: {
        HttpTokens: "required",
        HttpPutResponseHopLimit: 1,
      },
    };

    // Use NetworkInterfaces to ensure public IP assignment
    if (subnetId) {
      commandParams.NetworkInterfaces = [
        {
          DeviceIndex: 0,
          AssociatePublicIpAddress: true,
          SubnetId: subnetId,
          Groups: securityGroupIds,
        },
      ];
    } else {
      // Fallback to legacy parameters if no subnet specified
      commandParams.SecurityGroupIds = securityGroupIds;
    }

    const command = new RunInstancesCommand(commandParams);

    const response = await ec2Client.send(command);

    if (!response.Instances || response.Instances.length === 0) {
      throw new Error("No instances launched");
    }

    const instance = response.Instances[0];
    const instanceId = instance.InstanceId!;

    console.log(`[EC2] Instance ${instanceId} launched successfully`);

    return {
      instanceId,
      state: instance.State?.Name || "pending",
      privateIp: instance.PrivateIpAddress,
      publicIp: instance.PublicIpAddress,
      launchTime: instance.LaunchTime,
      tags,
    };
  } catch (error: any) {
    console.error(`[EC2] Error launching instance for session ${sessionId}:`, error.message);
    throw new Error(`Failed to launch EC2 instance: ${error.message}`);
  }
}

/**
 * Terminates an EC2 instance
 */
export async function terminateInstance(instanceId: string): Promise<boolean> {
  const ec2Client = getEC2Client();

  try {
    console.log(`[EC2] Terminating instance ${instanceId}`);

    const command = new TerminateInstancesCommand({
      InstanceIds: [instanceId],
    });

    await ec2Client.send(command);

    console.log(`[EC2] Instance ${instanceId} termination initiated`);
    return true;
  } catch (error: any) {
    console.error(`[EC2] Error terminating instance ${instanceId}:`, error.message);
    return false;
  }
}

/**
 * Gets detailed information about an instance
 */
export async function getInstanceInfo(instanceId: string): Promise<InstanceInfo | null> {
  const ec2Client = getEC2Client();

  try {
    const command = new DescribeInstancesCommand({
      InstanceIds: [instanceId],
    });

    const response = await ec2Client.send(command);

    if (!response.Reservations || response.Reservations.length === 0) {
      return null;
    }

    const instance = response.Reservations[0].Instances?.[0];
    if (!instance) {
      return null;
    }

    const tags: Record<string, string> = {};
    if (instance.Tags) {
      instance.Tags.forEach((tag) => {
        if (tag.Key) {
          tags[tag.Key] = tag.Value || "";
        }
      });
    }

    return {
      instanceId: instance.InstanceId!,
      state: instance.State?.Name || "unknown",
      publicIp: instance.PublicIpAddress,
      privateIp: instance.PrivateIpAddress,
      launchTime: instance.LaunchTime,
      tags,
    };
  } catch (error: any) {
    console.error(`[EC2] Error getting instance info for ${instanceId}:`, error.message);
    return null;
  }
}

/**
 * Checks if an instance is running and ready
 */
export async function isInstanceReady(instanceId: string): Promise<boolean> {
  const ec2Client = getEC2Client();

  try {
    const command = new DescribeInstanceStatusCommand({
      InstanceIds: [instanceId],
      IncludeAllInstances: false, // Only running instances
    });

    const response = await ec2Client.send(command);

    if (!response.InstanceStatuses || response.InstanceStatuses.length === 0) {
      return false;
    }

    const status = response.InstanceStatuses[0];
    const instanceStatus = status.InstanceStatus?.Status;
    const systemStatus = status.SystemStatus?.Status;

    // Instance is ready when both checks are "ok"
    return instanceStatus === "ok" && systemStatus === "ok";
  } catch (error: any) {
    console.error(`[EC2] Error checking instance status for ${instanceId}:`, error.message);
    return false;
  }
}

/**
 * Waits for an instance to reach a specific state
 */
export async function waitForInstanceState(
  instanceId: string,
  targetState: InstanceStateName = "running",
  timeoutMs: number = 300000 // 5 minutes
): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds

  console.log(`[EC2] Waiting for instance ${instanceId} to reach state: ${targetState}`);

  while (Date.now() - startTime < timeoutMs) {
    const info = await getInstanceInfo(instanceId);

    if (info && info.state === targetState) {
      console.log(`[EC2] Instance ${instanceId} reached state: ${targetState}`);
      return true;
    }

    if (info && info.state === "terminated") {
      console.error(`[EC2] Instance ${instanceId} was terminated`);
      return false;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  console.error(`[EC2] Timeout waiting for instance ${instanceId} to reach state: ${targetState}`);
  return false;
}

/**
 * Builds default user data script for Windows instances
 */
function buildDefaultUserData(sessionId: string): string {
  const controlPlaneUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pixray.cloud";
  const hostAgentSecret = process.env.HOST_AGENT_SECRET || "changeme";

  return `<powershell>
# Pixray Gaming Instance Bootstrap Script
# Session ID: ${sessionId}
# Generated: ${new Date().toISOString()}

$ErrorActionPreference = "Stop"
$LogFile = "C:\\pixray\\bootstrap.log"

# Create log directory
New-Item -ItemType Directory -Force -Path "C:\\pixray" | Out-Null

function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

Write-Log "Starting Pixray bootstrap for session ${sessionId}"

# Set environment variables
[System.Environment]::SetEnvironmentVariable("PIXRAY_SESSION_ID", "${sessionId}", "Machine")
[System.Environment]::SetEnvironmentVariable("PIXRAY_CONTROL_PLANE", "${controlPlaneUrl}", "Machine")
[System.Environment]::SetEnvironmentVariable("PIXRAY_AGENT_SECRET", "${hostAgentSecret}", "Machine")

# Download and run full bootstrap script from S3 or control plane
try {
    $bootstrapUrl = "${controlPlaneUrl}/api/v1/host-agent/bootstrap.ps1"
    Write-Log "Downloading bootstrap script from $bootstrapUrl"

    # For now, create a marker file indicating bootstrap completed
    # In production, this would download and execute the full bootstrap
    New-Item -Path "C:\\pixray\\bootstrap_complete.txt" -ItemType File -Force | Out-Null

    Write-Log "Bootstrap script execution would happen here"
    Write-Log "In production: Install Sunshine, configure firewall, start host-agent"
} catch {
    Write-Log "ERROR: Bootstrap failed - $_"
    exit 1
}

Write-Log "Bootstrap completed successfully"
</powershell>
<persist>true</persist>
`;
}

/**
 * Tags an existing instance with additional tags
 */
export async function tagInstance(
  instanceId: string,
  tags: Record<string, string>
): Promise<boolean> {
  const ec2Client = getEC2Client();

  try {
    const command = new CreateTagsCommand({
      Resources: [instanceId],
      Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
    });

    await ec2Client.send(command);
    console.log(`[EC2] Tagged instance ${instanceId} with ${Object.keys(tags).length} tags`);
    return true;
  } catch (error: any) {
    console.error(`[EC2] Error tagging instance ${instanceId}:`, error.message);
    return false;
  }
}
