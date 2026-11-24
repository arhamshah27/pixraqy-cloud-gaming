"use client";

import React, { useState } from "react";
import { Crown, Zap, Trophy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PricingCardProps {
  title: string;
  price: string;
  duration: string;
  features: string[];
  link: string; 
  tier: "plus" | "pro";
}

const PricingCard = ({
  title,
  price,
  duration,
  features,
  link,
  tier,
}: PricingCardProps) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log("user from auth context:", user);

  const tierColors = {
    plus: "from-purple-600 via-pink-600 to-purple-600",
    pro: "from-cyan-500 via-blue-500 to-purple-500",
  };

  const glowColors = {
    plus: "shadow-purple-500/50",
    pro: "shadow-cyan-500/50",
  };

  const handleOnClick = (price: string) => async () => {
    console.log("Initiating checkout for price:", price);
    try {
      setLoading(true);

      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, price: Number(price) }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        setLoading(false);
      } else {
        console.log(`Credits updated: ${data.message}`);
        
        window.location.href = link;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred while processing your purchase.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative w-80 rounded-2xl bg-gradient-to-b from-gray-900 to-black border-2 transition-all duration-500 ${
        isHovered
          ? `border-transparent ${glowColors[tier]} shadow-2xl scale-105 -translate-y-2`
          : "border-gray-800 shadow-xl"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {tier === "pro" && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
          <Crown className="w-4 h-4" />
        </div>
      )}

      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
          tierColors[tier]
        } opacity-0 blur-xl transition-opacity duration-500 ${
          isHovered ? "opacity-30" : ""
        }`}
      ></div>

      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          {tier === "plus" ? (
            <Zap className="w-8 h-8 text-purple-400" />
          ) : (
            <Trophy className="w-8 h-8 text-cyan-400" />
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ${price}
            </span>
            <span className="text-gray-400 text-sm font-medium uppercase">
              {duration}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <div
                className={`mt-0.5 p-1 rounded-full bg-gradient-to-r ${tierColors[tier]} transition-transform duration-300 group-hover:scale-110`}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-300 text-sm leading-relaxed">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleOnClick(price)}
          disabled={loading}
          className={`block w-full py-4 rounded-xl font-bold text-center transition-all duration-300 ${
            tier === "plus"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30"
              : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/30"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading
            ? "Processing..."
            : tier === "plus"
            ? "UNLOCK PLUS"
            : "GO LEGENDARY"}
        </button>
      </div>
    </div>
  );
};

export default PricingCard;