/**
 * Pixray Host Agent
 * Runs on Windows gaming instances, monitors health, and reports to control plane
 */

import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as si from "systeminformation";

interface HostAgentConfig {
  controlPlaneUrl: string;
  agentSecret: string;
  instanceId?: string;
  sessionId?: string;
  heartbeatInterval: number;
  sunshineConfigPath: string;
  logPath: string;
}

interface HeartbeatPayload {
  instanceId: string;
  agentVersion: string;
  agentSecret: string;
  gpuModel?: string;
  gpuDriverVersion?: string;
  gpuEncoder?: string;
  cpuCores?: number;
  memoryMb?: number;
  sunshineVersion?: string;
  sunshineHealthy?: boolean;
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

class HostAgent {
  private config: HostAgentConfig;
  private version = "1.0.0";
  private heartbeatTimer?: NodeJS.Timeout;
  private networkStats = { rx: 0, tx: 0, timestamp: Date.now() };

  constructor(config: HostAgentConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    this.log("Starting Pixray Host Agent v" + this.version);
    this.log(`Control Plane: ${this.config.controlPlaneUrl}`);
    this.log(`Instance ID: ${this.config.instanceId || "auto-detect"}`);

    // Ensure log directory exists
    const logDir = path.dirname(this.config.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Detect instance ID if not provided
    if (!this.config.instanceId) {
      this.config.instanceId = await this.detectInstanceId();
      this.log(`Detected Instance ID: ${this.config.instanceId}`);
    }

    // Send initial heartbeat
    await this.sendHeartbeat();

    // Start heartbeat timer
    this.heartbeatTimer = setInterval(
      () => this.sendHeartbeat(),
      this.config.heartbeatInterval
    );

    this.log("Host agent started successfully");
  }

  async stop(): Promise<void> {
    this.log("Stopping host agent");

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    this.log("Host agent stopped");
  }

  private async detectInstanceId(): Promise<string> {
    // On EC2, instance ID can be retrieved from metadata service
    try {
      const response = await axios.get(
        "http://169.254.169.254/latest/meta-data/instance-id",
        { timeout: 2000 }
      );
      return response.data;
    } catch (error) {
      // Fallback to hostname or environment variable
      return process.env.INSTANCE_ID || os.hostname();
    }
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      const payload = await this.buildHeartbeatPayload();

      const response = await axios.post(
        `${this.config.controlPlaneUrl}/api/v1/host-agent/heartbeat`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data?.command) {
        await this.handleCommand(response.data.command);
      }

      this.log("Heartbeat sent successfully");
    } catch (error: any) {
      this.log(`Error sending heartbeat: ${error.message}`, "ERROR");
    }
  }

  private async buildHeartbeatPayload(): Promise<HeartbeatPayload> {
    const [cpu, mem, graphics, networkStats] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.networkStats(),
    ]);

    const gpuInfo = graphics.controllers && graphics.controllers.length > 0
      ? graphics.controllers[0]
      : null;

    // Calculate network throughput
    const networkRx = networkStats[0]?.rx_sec || 0;
    const networkTx = networkStats[0]?.tx_sec || 0;

    // Check Sunshine status
    const sunshineHealthy = await this.checkSunshineHealth();
    const sunshineVersion = await this.getSunshineVersion();

    const payload: HeartbeatPayload = {
      instanceId: this.config.instanceId!,
      agentVersion: this.version,
      agentSecret: this.config.agentSecret,
      cpuCores: cpu.cores,
      memoryMb: Math.floor(mem.total / 1024 / 1024),
      sunshineVersion,
      sunshineHealthy,
    };

    // Add GPU info if available
    if (gpuInfo) {
      payload.gpuModel = gpuInfo.model || gpuInfo.name;
      payload.gpuDriverVersion = gpuInfo.driverVersion;

      // Check if NVENC is available
      if (gpuInfo.vendor?.toLowerCase().includes("nvidia")) {
        payload.gpuEncoder = "NVENC";
      }
    }

    // Add current metrics
    const currentLoad = await si.currentLoad();
    payload.cpuUsagePercent = parseFloat(currentLoad.currentLoad.toFixed(2));

    const memUsagePercent = ((mem.used / mem.total) * 100);
    payload.memoryUsagePercent = parseFloat(memUsagePercent.toFixed(2));

    // GPU usage (if available)
    if (gpuInfo && (gpuInfo as any).utilizationGpu !== undefined) {
      payload.gpuUsagePercent = (gpuInfo as any).utilizationGpu;
    }

    // GPU temperature (if available)
    if (gpuInfo && (gpuInfo as any).temperatureGpu !== undefined) {
      payload.gpuTempCelsius = (gpuInfo as any).temperatureGpu;
    }

    // Network throughput
    payload.networkRxMbps = parseFloat((networkRx / 1024 / 1024 * 8).toFixed(2));
    payload.networkTxMbps = parseFloat((networkTx / 1024 / 1024 * 8).toFixed(2));

    // Active streams (check Sunshine status)
    payload.activeStreams = await this.getActiveSunshineStreams();

    return payload;
  }

  private async checkSunshineHealth(): Promise<boolean> {
    try {
      // Check if Sunshine process is running
      const processes = await si.processes();
      const sunshineProcess = processes.list.find((p) =>
        p.name.toLowerCase().includes("sunshine")
      );

      if (!sunshineProcess) {
        return false;
      }

      // Try to reach Sunshine web UI
      try {
        await axios.get("https://localhost:47990/api/config", {
          timeout: 2000,
          httpsAgent: new (require("https").Agent)({
            rejectUnauthorized: false,
          }),
        });
        return true;
      } catch {
        // Process is running but API not responding
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  private async getSunshineVersion(): Promise<string | undefined> {
    try {
      const sunshineExePath = "C:\\Program Files\\Sunshine\\sunshine.exe";
      if (fs.existsSync(sunshineExePath)) {
        // Read version from file metadata or config
        return "1.0.0"; // Placeholder
      }
    } catch (error) {
      // Ignore
    }
    return undefined;
  }

  private async getActiveSunshineStreams(): Promise<number> {
    try {
      // Query Sunshine API for active sessions
      const response = await axios.get("https://localhost:47990/api/apps", {
        timeout: 2000,
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false,
        }),
      });

      // This is a simplified check; actual implementation depends on Sunshine API
      return 0;
    } catch (error) {
      return 0;
    }
  }

  private async handleCommand(command: any): Promise<void> {
    this.log(`Received command: ${JSON.stringify(command)}`);

    switch (command.type) {
      case "shutdown":
        this.log("Shutdown command received");
        await this.gracefulShutdown();
        break;

      case "restart_sunshine":
        this.log("Restart Sunshine command received");
        await this.restartSunshine();
        break;

      default:
        this.log(`Unknown command type: ${command.type}`, "WARN");
    }
  }

  private async gracefulShutdown(): Promise<void> {
    this.log("Performing graceful shutdown");

    // Stop Sunshine gracefully
    await this.stopSunshine();

    // Stop agent
    await this.stop();

    // Exit process
    process.exit(0);
  }

  private async restartSunshine(): Promise<void> {
    this.log("Restarting Sunshine service");

    await this.stopSunshine();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.startSunshine();
  }

  private async stopSunshine(): Promise<void> {
    try {
      const { exec } = require("child_process");
      await new Promise((resolve, reject) => {
        exec("net stop SunshineService", (error: any, stdout: any, stderr: any) => {
          if (error) {
            this.log(`Error stopping Sunshine: ${error.message}`, "ERROR");
            reject(error);
          } else {
            this.log("Sunshine stopped");
            resolve(stdout);
          }
        });
      });
    } catch (error: any) {
      this.log(`Failed to stop Sunshine: ${error.message}`, "ERROR");
    }
  }

  private async startSunshine(): Promise<void> {
    try {
      const { exec } = require("child_process");
      await new Promise((resolve, reject) => {
        exec("net start SunshineService", (error: any, stdout: any, stderr: any) => {
          if (error) {
            this.log(`Error starting Sunshine: ${error.message}`, "ERROR");
            reject(error);
          } else {
            this.log("Sunshine started");
            resolve(stdout);
          }
        });
      });
    } catch (error: any) {
      this.log(`Failed to start Sunshine: ${error.message}`, "ERROR");
    }
  }

  private log(message: string, level: string = "INFO"): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    console.log(logMessage);

    // Append to log file
    try {
      fs.appendFileSync(this.config.logPath, logMessage + "\n");
    } catch (error) {
      // Ignore file write errors
    }
  }
}

// Main entry point
async function main() {
  const config: HostAgentConfig = {
    controlPlaneUrl:
      process.env.PIXRAY_CONTROL_PLANE || "https://pixray.cloud",
    agentSecret: process.env.PIXRAY_AGENT_SECRET || "changeme",
    instanceId: process.env.PIXRAY_INSTANCE_ID,
    sessionId: process.env.PIXRAY_SESSION_ID,
    heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL || "30000"), // 30 seconds
    sunshineConfigPath:
      process.env.SUNSHINE_CONFIG_PATH ||
      "C:\\Program Files\\Sunshine\\config\\sunshine.conf",
    logPath: process.env.LOG_PATH || "C:\\pixray\\agent.log",
  };

  const agent = new HostAgent(config);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Received SIGINT, shutting down gracefully");
    await agent.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down gracefully");
    await agent.stop();
    process.exit(0);
  });

  await agent.start();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { HostAgent };
