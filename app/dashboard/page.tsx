"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Zap, Sparkles, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import SessionModal from "@/components/SessionModal";

export default function DashboardPage() {
  const { user, appUser, loading, signOut } = useAuth();
  const router = useRouter();
  const [userCredits, setUserCredits] = useState(0);
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<{id: string, name: string} | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserCredits = async () => {
      if (appUser?.id) {
        const { data, error } = await supabase
          .from("users")
          .select("credits")
          .eq("id", appUser.id)
          .single();
        if (data && !error) {
          setUserCredits(data.credits);
        }
      }
    };

    const fetchGames = async () => {
      if (appUser?.id) {
        const { data, error } = await supabase.from("games").select("*");

        if (data && !error) {
          setGames(data);
        }
      }
    };

    fetchUserCredits();
    fetchGames();
  }, [appUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !appUser) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "enterprise":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Crown className="w-4 h-4" />;
      case "enterprise":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {user.user_metadata?.name || appUser.email.split("@")[0]}
              </span>
            </h1>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="play-game" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700">
              <TabsTrigger
                value="play-game"
                className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Play Game
              </TabsTrigger>
              <TabsTrigger
                value="recent-games"
                className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Recent Games
              </TabsTrigger>
            </TabsList>

            <TabsContent value="play-game" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Available Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <Card
                    key={game.id}
                    className="bg-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-colors group"
                  >
                    <CardHeader className="p-0">
                      <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                        <Image
                          src={game.image_url}
                          alt={game.name}
                          layout="fill"
                          objectFit="cover"
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-xl text-white font-semibold mb-2">
                        {game.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mb-4">
                        {game.description}
                      </CardDescription>
                      <Button
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                        onClick={() => {
                          setSelectedGame({ id: game.id, name: game.name });
                          setIsSessionModalOpen(true);
                        }}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent-games" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Your Recent Activity</h2>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">
                      No games played yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start playing to see your recent game history here.
                    </p>
                    <TabsList className="grid w-fit mx-auto grid-cols-1 bg-gray-800/50 border border-gray-700">
                      <TabsTrigger
                        value="play-game"
                        className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Go to Play Game
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Session Modal */}
      {selectedGame && (
        <SessionModal
          isOpen={isSessionModalOpen}
          onClose={() => {
            setIsSessionModalOpen(false);
            setSelectedGame(null);
            // Refresh credits after closing modal
            if (appUser?.id) {
              supabase
                .from("users")
                .select("credits")
                .eq("id", appUser.id)
                .single()
                .then(({ data }) => {
                  if (data) setUserCredits(data.credits);
                });
            }
          }}
          gameId={selectedGame.id}
          gameName={selectedGame.name}
        />
      )}
    </div>
  );
}
