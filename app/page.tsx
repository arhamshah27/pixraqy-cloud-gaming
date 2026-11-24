import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Gamepad2,
  Smartphone,
  Download,
  Zap,
  Monitor,
  Building2,
  Star,
  CheckCircle,
  Shield,
  Globe,
  Cpu,
  Wifi,
  Users,
  Trophy,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { HeroSection } from "./components/hero-section";
import { WaitlistForm } from "./components/waitlist-form";

export default function CloudGamingLanding() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Enhanced Header */}
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
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section
        id="features"
        className="py-32 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Generation Technology
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Revolutionary Gaming
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience gaming like never before with our cutting-edge cloud
              technology that delivers console-quality performance to any device
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Gamepad2,
                title: "Ultra-HD Streaming",
                description:
                  "Stream games in 4K at 120fps with our advanced compression technology and zero latency",
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                icon: Smartphone,
                title: "Universal Compatibility",
                description:
                  "Play on any device - phone, tablet, laptop, or smart TV. Your games follow you everywhere",
                gradient: "from-purple-500 to-pink-600",
              },
              {
                icon: Download,
                title: "Instant Gaming",
                description:
                  "No installations, no updates, no waiting. Click and play instantly from your browser",
                gradient: "from-green-500 to-cyan-600",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Sub-10ms latency with our global edge network optimized for competitive gaming",
                gradient: "from-yellow-500 to-orange-600",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group bg-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-all duration-500 backdrop-blur-sm hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Solutions Section */}
      <section
        id="solutions"
        className="py-32 bg-gradient-to-b from-gray-900 to-gray-950 relative"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              Built for Everyone
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Perfect Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Whether you're a passionate gamer or a forward-thinking business,
              we have the perfect cloud gaming solution tailored for you
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Enhanced B2C Solution */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 p-10 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-8 relative z-10">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Monitor className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-3xl text-white mb-4 font-bold">
                  For Gamers
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Transform any device into a high-end gaming machine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="space-y-6">
                  {[
                    {
                      icon: Trophy,
                      text: "Access 1000+ premium AAA games instantly",
                    },
                    {
                      icon: Globe,
                      text: "Play on phones, tablets, laptops, and smart TVs",
                    },
                    {
                      icon: Shield,
                      text: "Cloud saves with cross-device synchronization",
                    },
                    {
                      icon: Zap,
                      text: "No expensive hardware or upgrades required",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 group/item"
                    >
                      <feature.icon className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <span className="text-gray-300 font-medium">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300">
                  Start Gaming Now
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced B2B Solution */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700 p-10 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-8 relative z-10">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-3xl text-white mb-4 font-bold">
                  For Businesses
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Integrate cutting-edge cloud gaming into your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="space-y-6">
                  {[
                    {
                      icon: Cpu,
                      text: "White-label cloud gaming solution with full customization",
                    },
                    {
                      icon: Wifi,
                      text: "Scalable infrastructure with global CDN and APIs",
                    },
                    {
                      icon: Users,
                      text: "Custom branding, integration, and user management",
                    },
                    {
                      icon: Clock,
                      text: "24/7 enterprise support with dedicated account manager",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 group/item"
                    >
                      <feature.icon className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <span className="text-gray-300 font-medium">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300">
                  Contact Sales Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Community Feedback
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Loved by Gamers
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our alpha testers and early adopters are saying about the
              PixRay experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "Finally I can play Cyberpunk 2077 on my phone during lunch breaks. The quality is absolutely incredible and the latency is virtually non-existent!",
                author: "Alex Chen",
                role: "Mobile Gaming Enthusiast",
                avatar: "A",
                gradient: "from-cyan-400 to-blue-500",
              },
              {
                rating: 5,
                text: "As a developer, integrating PixRay's API was seamless and well-documented. Our users love the instant gaming experience without any downloads.",
                author: "Sarah Johnson",
                role: "CTO, GameHub Technologies",
                avatar: "S",
                gradient: "from-purple-400 to-pink-500",
              },
              {
                rating: 5,
                text: "The latency is so low, I completely forgot I was streaming. Perfect for competitive gaming - I've been dominating in Warzone!",
                author: "Mike Rodriguez",
                role: "Professional Esports Player",
                avatar: "M",
                gradient: "from-green-400 to-cyan-500",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="group bg-gray-900/50 border-gray-800 hover:border-cyan-500/30 transition-all duration-500 backdrop-blur-sm hover:transform hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-8 leading-relaxed text-lg italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        {testimonial.author}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Waitlist Section */}
      <section
        id="pricing"
        className="py-32 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-purple-900/10 to-transparent" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Join the Revolution
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Be Among the First
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join our exclusive waitlist to be the first to experience the
              future of cloud gaming when PixRay launches
            </p>
          </div>

          <WaitlistForm />
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:60px_60px] animate-gradient-shift" />

        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Ready to Game?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Be among the first to experience PixRay when we launch. Join our
            waitlist today and secure your spot in the future of gaming.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  PixRay
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The future of gaming is here. Play anywhere, anytime, on any
                device with revolutionary cloud gaming technology.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  "Features",
                  "Pricing",
                  "Games Library",
                  "System Requirements",
                ],
              },
              {
                title: "Company",
                links: [
                  { name: "About Us", href: "/about" },
                  { name: "Contact Us", href: "/contact" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms & Conditions", href: "/terms" },
                  { name: "Refund Policy", href: "/refund" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold mb-6 text-lg">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {typeof link === "string" ? (
                        <span className="text-gray-400 font-medium cursor-not-allowed">
                          {link}
                        </span>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-medium"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} PixRay Cloud. All rights reserved.
              <span className="ml-2 text-cyan-400">
                Built with ❤️ for gamers worldwide.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
