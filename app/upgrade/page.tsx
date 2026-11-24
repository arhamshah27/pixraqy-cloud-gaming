"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Gamepad2,
} from "lucide-react";
import PricingCard from "../components/PricingCard";

function UpgradePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          </a>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="w-10 h-10 text-cyan-400" />
              <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                POWER UP
              </h1>
              <Sparkles className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-xl text-gray-400 font-medium">
              Choose your tier and dominate the game
            </p>
          </div>

          <div className="flex justify-center gap-10 flex-wrap pb-20">
            <PricingCard
              title="Warrior"
              price="20"
              duration="/ month"
              features={[
                "Get 20 Credits",
                "5 Battle Simulations per month",
                "7 Character Profile Scans",
                "Basic Combat Analytics",
                "Priority Guild Support",
                "AI Companion Bot",
              ]}
              link="https://buy.stripe.com/test_cN27uk5h950fdyg288"
              tier="plus"
            />
            <PricingCard
              title="Legendary"
              price="50"
              duration="/ month"
              features={[
                "Get 80 Credits",
                "Unlimited Battle Simulations",
                "Unlimited Profile Scans",
                "Custom Quest Database",
                "Advanced Strategy Console",
                "Elite Guild Support",
              ]}
              link="https://buy.stripe.com/test_28o2a07phfET51K289"
              tier="pro"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradePage;