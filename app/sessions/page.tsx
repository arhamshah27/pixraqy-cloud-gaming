"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Server,
  Clock,
  MapPin,
  Trash2,
  RefreshCw,
  Circle,
} from "lucide-react";
import Image from "next/image";

interface Game {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface Session {
  id: string;
  instance_id: string;
  public_ip: string;
  private_ip: string;
  status: string;
  instance_type: string;
  created_at: string;
  launched_at: string;
  ended_at: string;
  credits_consumed: number;
  games: Game;
}

export default function SessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch("/api/sessions/list");

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    if (
      !confirm(
        "Are you sure you want to terminate this instance? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setTerminatingId(sessionId);
      const response = await fetch("/api/sessions/terminate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (error: any) {
      console.error("Error terminating session:", error);
      alert("Failed to terminate session: " + error.message);
    } finally {
      setTerminatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "launching":
        return "text-blue-500";
      case "stopped":
        return "text-red-500";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-green-500/10 border-green-500/30";
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/30";
      case "launching":
        return "bg-blue-500/10 border-blue-500/30";
      case "stopped":
        return "bg-red-500/10 border-red-500/30";
      case "failed":
        return "bg-red-600/10 border-red-600/30";
      default:
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (loading || loadingSessions) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Active Sessions
                </span>
              </h1>
              <p className="text-gray-400">
                Manage your running EC2 gaming instances
              </p>
            </div>

            <Button
              onClick={fetchSessions}
              variant="outline"
              className="border-gray-700 hover:bg-gray-300"
            >
              <RefreshCw className="w-4 h-4 mr-2 text-black" />
              <p className="text-black">Refresh</p>
            </Button>
          </div>

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    No Active Sessions
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You don't have any gaming sessions yet. Start a new session
                    from the dashboard.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {session.games?.image_url && (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={session.games.image_url}
                              alt={session.games.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-2xl mb-2">
                            {session.games?.name || "Unknown Game"}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Circle
                              className={`w-3 h-3 fill-current ${getStatusColor(
                                session.status
                              )}`}
                            />
                            <span
                              className={`text-sm font-semibold ${getStatusColor(
                                session.status
                              )}`}
                            >
                              {session.status.toUpperCase()}
                            </span>
                          </div>
                          <CardDescription className="text-gray-400">
                            Instance ID: {session.instance_id}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {session.status === "running" && (
                          <Button
                            onClick={() => terminateSession(session.id)}
                            disabled={terminatingId === session.id}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-500"
                          >
                            {terminatingId === session.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Terminating...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2 text-red-800" />
                                <p className="text-red-800">Terminate</p>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Public IP */}
                      <div
                        className={`p-4 rounded-lg border ${getStatusBgColor(
                          session.status
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Public IP
                          </span>
                        </div>
                        <p className="font-mono text-cyan-400">
                          {session.public_ip || "Pending..."}
                        </p>
                      </div>

                      {/* Instance Type */}
                      <div
                        className={`p-4 rounded-lg border ${getStatusBgColor(
                          session.status
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Instance Type
                          </span>
                        </div>
                        <p className="font-mono text-white">
                          {session.instance_type}
                        </p>
                      </div>

                      {/* Created At */}
                      <div
                        className={`p-4 rounded-lg border ${getStatusBgColor(
                          session.status
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Created At
                          </span>
                        </div>
                        <p className="text-sm text-white">
                          {formatDate(session.created_at)}
                        </p>
                      </div>

                      {/* Credits Consumed */}
                      <div
                        className={`p-4 rounded-lg border ${getStatusBgColor(
                          session.status
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-400">
                            Credits Used
                          </span>
                        </div>
                        <p className="text-xl font-bold text-purple-400">
                          {session.credits_consumed || 0}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {session.private_ip && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="text-sm text-gray-400">
                          <span className="font-semibold">Private IP:</span>{" "}
                          <span className="font-mono text-gray-300">
                            {session.private_ip}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
