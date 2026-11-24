"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Loader2, Mail, Sparkles, Gift, Zap } from "lucide-react"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        setEmail("")
      } else {
        setError(result.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-12 text-center shadow-2xl">
          {/* Success animation background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-purple-500/10 animate-gradient-shift" />
          
          {/* Success icon */}
          <div className="relative z-10 w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          {/* Success content */}
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to the Future! 🚀
            </h3>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              You're now part of an <span className="font-semibold text-cyan-400">exclusive community</span> of early adopters. 
              We'll send you behind-the-scenes updates and priority access when we launch.
            </p>
            
            {/* Benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Mail, text: "Confirmation sent", color: "text-green-400" },
                { icon: Gift, text: "Early access guaranteed", color: "text-cyan-400" },
                { icon: Sparkles, text: "Exclusive updates", color: "text-purple-400" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                  <span className="text-sm font-medium text-gray-300">{benefit.text}</span>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-400">
              Check your email for a special welcome message from the PixRay team!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 p-12 shadow-2xl">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-shift" />
        
        {/* Form header */}
        <div className="relative z-10 text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center animate-glow shadow-lg">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">
            Be an <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Early Adopter</span>
          </h3>
          <p className="text-lg text-gray-300 leading-relaxed">
            Join <span className="font-semibold text-cyan-400">10,000+</span> gamers waiting for the future of cloud gaming. 
            Get exclusive access and <span className="font-semibold text-purple-400">special launch pricing</span>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 px-6 text-lg bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 rounded-xl shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Waitlist
                  <Zap className="w-5 h-5 ml-3" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
              {error}
            </div>
          )}
        </form>

        {/* Benefits */}
        <div className="relative z-10 mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Sparkles, text: "Early Access", desc: "Be first to play" },
            { icon: Gift, text: "Exclusive Updates", desc: "Behind-the-scenes content" },
            { icon: Zap, text: "Launch Pricing", desc: "Up to 50% off" }
          ].map((benefit, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <benefit.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-white">{benefit.text}</div>
                <div className="text-xs text-gray-400">{benefit.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}