"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, Copy, Download } from "lucide-react";
import Image from "next/image";

interface GameStreamInfo {
  pairingQR: string;
  pairingCode: string;
  port: number;
  recommendedClient: string;
  instructions: string;
}

interface SessionResponse {
  sessionId: string;
  instanceId: string;
  publicIp: string;
  gameStream: GameStreamInfo;
  logsEndpoint: string;
  metricsEndpoint: string;
  status: string;
}

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameName: string;
}

export default function SessionModal({
  isOpen,
  onClose,
  gameId,
  gameName,
}: SessionModalProps) {
  const [status, setStatus] = useState<
    "creating" | "launching" | "ready" | "error"
  >("creating");
  const [progress, setProgress] = useState(0);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isLaunching = useRef(false);

  useEffect(() => {
    if (isOpen && !isLaunching.current) {
      isLaunching.current = true;
      startSession();
    }

    // Reset when modal closes
    if (!isOpen) {
      isLaunching.current = false;
      setStatus("creating");
      setProgress(0);
      setSession(null);
      setError(null);
    }
  }, [isOpen, gameId]);

  const startSession = async () => {
    try {
      setStatus("creating");
      setProgress(10);
      setError(null);

      // Call simplified session launch API
      setStatus("launching");
      setProgress(30);

      const response = await fetch("/api/sessions/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
        }),
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 400 && errorData.error?.includes("credits")) {
          // Insufficient credits
          setError(errorData.error);
          setStatus("error");
          return;
        }

        throw new Error(errorData.error || "Failed to launch instance");
      }

      const data = await response.json();

      // Format the response to match our expected structure
      setSession({
        sessionId: data.session.id,
        instanceId: data.instance.instanceId,
        publicIp: data.instance.publicIp || "Pending...",
        gameStream: {
          pairingQR: "",
          pairingCode: "N/A",
          port: 47984,
          recommendedClient: "Remote Desktop",
          instructions: "Use Remote Desktop to connect",
        },
        logsEndpoint: "",
        metricsEndpoint: "",
        status: data.session.status,
      });

      setProgress(100);
      setStatus("ready");
    } catch (err: any) {
      console.error("Error launching instance:", err);
      setError(err.message || "Failed to launch instance");
      setStatus("error");
    }
  };

  const copyPairingCode = () => {
    if (session?.gameStream.pairingCode) {
      navigator.clipboard.writeText(session.gameStream.pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadMoonlight = () => {
    window.open("https://moonlight-stream.org/", "_blank");
  };

  const terminateSession = async () => {
    if (!session) return;

    if (
      !confirm(
        "Are you sure you want to terminate this instance? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/sessions/terminate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to terminate instance");
      }

      onClose();
    } catch (err) {
      console.error("Error terminating session:", err);
      alert("Failed to terminate instance. Please try again.");
    }
  };

  const handleClose = () => {
    if (session && status === "ready") {
      // Ask for confirmation
      if (
        confirm(
          "Are you sure you want to close? Your EC2 instance is running. The instance will remain active and billing will continue."
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {status === "error"
              ? "Session Error"
              : status === "ready"
              ? "Instance Launched!"
              : "Starting Gaming Session"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {status === "error"
              ? "Something went wrong"
              : status === "ready"
              ? `Your EC2 instance for ${gameName} is ready`
              : `Launching ${gameName}...`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress indicator */}
          {(status === "creating" || status === "launching") && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {status === "creating"
                      ? "Allocating resources..."
                      : "Launching instance..."}
                  </span>
                  <span className="text-cyan-500">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <p className="text-center text-sm text-gray-400">
                This may take 2-3 minutes
              </p>
            </div>
          )}

          {/* Ready state */}
          {status === "ready" && session && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>

              {/* Instance details */}
              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    EC2 Instance Details
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your gaming instance has been launched
                  </p>
                </div>

                {/* Instance info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                    <span className="text-gray-400">Instance ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 text-sm">
                        {session.instanceId}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(session.instanceId);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-700"
                      >
                        {copied ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                    <span className="text-gray-400">Public IP:</span>
                    <span className="font-mono text-cyan-400">
                      {session.publicIp}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 font-semibold">
                      {session.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                    <span className="text-gray-400">Region:</span>
                    <span className="font-mono text-gray-300">
                      {process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm text-cyan-400">
                  Instance Launched Successfully
                </h4>
                <p className="text-sm text-gray-400">
                  Your EC2 instance is now running. It may take a few minutes to fully initialize.
                  You can connect to it using Remote Desktop or SSH once it's ready.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  Done
                </Button>

                <Button
                  onClick={terminateSession}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-500 hover:bg-red-600/10"
                >
                  Terminate Instance
                </Button>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-center">{error}</p>
              </div>

              {error?.includes("credits") && (
                <Button
                  onClick={() => {
                    onClose();
                    // Navigate to payment page
                    window.location.href = "/upgrade";
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  Purchase Credits
                </Button>
              )}

              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full border-gray-700"
              >
                <p className="text-black">Close</p>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
