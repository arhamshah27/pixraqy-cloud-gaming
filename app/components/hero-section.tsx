"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, ArrowRight, CheckCircle, Zap, Sparkles, Star, X } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const openVideoModal = () => {
    setShowVideoModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeVideoModal = () => {
    setShowVideoModal(false)
    document.body.style.overflow = 'unset'
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black pt-20">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          {/* Primary gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-purple-950/20 to-pink-950/30" />
          
          {/* Animated mesh gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-float" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }} />
          </div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div className="w-1 h-1 bg-cyan-400/40 rounded-full" />
            </div>
          ))}
        </div>

        {/* Interactive cursor glow */}
        <div
          className="absolute pointer-events-none transition-all duration-300 ease-out hidden md:block"
          style={{
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />

        {/* Main content with mobile-only navbar clearance */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10 py-16 sm:py-20 lg:py-32 mt-16 sm:mt-20 md:mt-0">
          <div className="text-center max-w-6xl mx-auto">
            {/* Status badge */}
            <div className={`mb-8 sm:mb-12 inline-block transition-all duration-1000 ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0'}`}>
              <Badge className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 animate-glow text-sm sm:text-base">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                Alpha Release • Revolutionary Gaming Platform
              </Badge>
            </div>

            {/* Main headline with better mobile spacing */}
            <div className="space-y-4 sm:space-y-8 mb-8 sm:mb-12">
              <h1 className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tight transition-all duration-1000 delay-200 ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0'}`}>
                <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent mb-2 sm:mb-4">
                  The Future of
                </span>
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-shift mb-2 sm:mb-4">
                  Cloud Gaming
                </span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Starts Now
                </span>
              </h1>
            </div>

            {/* Subtitle with enhanced mobile spacing */}
            <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 mb-12 sm:mb-16 max-w-5xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-400 ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0'}`}>
              Experience AAA gaming without limits. Stream instantly on any device with{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                PixRay's revolutionary platform
              </span>
              . No downloads, no hardware limits, just pure gaming performance.
            </p>

            {/* CTA buttons with enhanced mobile spacing */}
            <div className={`flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center mb-16 sm:mb-20 transition-all duration-1000 delay-600 ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0'}`}>
              <Link href="/login">
              <Button
                size="lg"
                className="group relative w-full sm:w-auto px-12 sm:px-16 py-6 sm:py-8 text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Join the Revolution
                  <ArrowRight className="ml-3 sm:ml-4 w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={openVideoModal}
                className="group w-full sm:w-auto px-12 sm:px-16 py-6 sm:py-8 text-lg sm:text-xl font-semibold border-2 border-gray-600 text-gray-300 hover:bg-white/5 hover:border-cyan-500 rounded-xl sm:rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                <Play className="mr-3 sm:mr-4 w-5 sm:w-6 h-5 sm:h-6 group-hover:text-cyan-400 transition-colors duration-300 text-black" />
                <p className="text-black group-hover:text-cyan-400 transition-colors duration-300">Watch Demo</p>
              </Button>
            </div>

            {/* Trust indicators with enhanced mobile spacing */}
            <div className={`flex flex-wrap justify-center items-center gap-6 sm:gap-12 mb-16 sm:mb-20 text-sm sm:text-base text-gray-400 transition-all duration-1000 delay-800 ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0'}`}>
              {[
                { icon: CheckCircle, text: "No Credit Card Required" },
                { icon: Zap, text: "Instant Access" },
                { icon: Star, text: "Early Bird Benefits" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer">
                  <item.icon className="w-5 sm:w-6 h-5 sm:h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-cyan-400 transition-colors duration-300 font-medium text-base sm:text-lg">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Game showcase with enhanced mobile spacing */}
            <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'animate-scale-in opacity-100' : 'opacity-0'}`}>
              <p className="text-gray-400 text-base sm:text-lg font-medium mb-8 sm:mb-12 uppercase tracking-wider">
                Play Your Favorite AAA Games
              </p>
              <div className="flex justify-center items-center space-x-4 sm:space-x-8 flex-wrap gap-4 sm:gap-6">
                {[
                  { name: "Red Dead Redemption 2", image: "https://static-cdn.dhairyashah.dev/pixray/hero/rdr2.jpg" },
                  { name: "GTA V", image: "https://static-cdn.dhairyashah.dev/pixray/hero/gtav.jpg" },
                  { name: "Cyberpunk 2077", image: "https://static-cdn.dhairyashah.dev/pixray/hero/cyberpunk2077.jpg" },
                  { name: "Call of Duty: Warzone", image: "https://static-cdn.dhairyashah.dev/pixray/hero/codwz.webp" },
                  { name: "Assassin's Creed Valhalla", image: "https://static-cdn.dhairyashah.dev/pixray/hero/assasincreedsvalhalla.png" },
                ].map((game, i) => (
                  <div
                    key={i}
                    className="group relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-gray-700 hover:border-cyan-400 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/20 glass-dark"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    <img 
                      src={game.image} 
                      alt={game.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2 sm:pb-3">
                      <span className="text-xs text-white font-semibold text-center px-1 sm:px-2 leading-tight">
                        {game.name}
                      </span>
                    </div>
                    <div className="absolute inset-0 ring-2 ring-cyan-400/0 group-hover:ring-cyan-400/50 rounded-2xl sm:rounded-3xl transition-all duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
      </section>

      {/* YouTube Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl mx-4 sm:mx-8 aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* YouTube iframe */}
            <iframe
              src="https://www.youtube.com/embed/P6IH1-hA-6Y?autoplay=1&rel=0&modestbranding=1"
              title="PixRay Demo Video"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}
