"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Coins, LogOut, Crown, Sparkles, Zap, Server } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, appUser, signOut } = useAuth();
  const [userCredits, setUserCredits] = useState(0);

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

    fetchUserCredits();
  }, [appUser]);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="container mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            PixRay
          </span>
        </div>

        {user && appUser ? (
          // Authenticated user header
          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-yellow-400">
                {userCredits}
              </span>
            </div>

            {/* Subscription Tier */}
            {/* <Badge className={`${getTierColor(appUser.subscription_tier)} text-white border-0`}>
              {getTierIcon(appUser.subscription_tier)}
              <span className="ml-1 capitalize">{appUser.subscription_tier}</span>
            </Badge> */}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-sm font-semibold">
                    {appUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700 text-white">
                <DropdownMenuLabel className="text-gray-300">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="flex items-center justify-between text-gray-300">
                  <span>Email</span>
                  <span className="font-medium text-cyan-400">
                    {appUser.email}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between text-gray-300">
                  <span>Credits</span>
                  <span className="font-medium text-yellow-400">
                    {userCredits}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <Link href={"/dashboard"}>
                  <DropdownMenuItem className="cursor-pointer text-gray-300">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href={"/sessions"}>
                  <DropdownMenuItem className="cursor-pointer text-gray-300">
                    <Server className="w-4 h-4 mr-2" />
                    Active Sessions
                  </DropdownMenuItem>
                </Link>
                <Link href={"/upgrade"}>
                  <DropdownMenuItem className="cursor-pointer text-gray-300">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // Unauthenticated user header
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
            >
              Features
            </Link>
            <Link
              href="#solutions"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
            >
              Solutions
            </Link>
            <Link
              href="#pricing"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
            >
              Pricing
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 px-6 py-2 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
