import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Zap, Globe, Heart, Rocket, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="container mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 6v12l10-6z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              PixRay
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/5 hover:border-cyan-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                About PixRay
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing gaming by making high-end gaming accessible to everyone, everywhere, on any device.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Our Mission */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Target className="w-6 h-6 mr-3 text-cyan-400" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  At PixRay, we believe that everyone should have access to premium gaming experiences, regardless of their hardware limitations. 
                  Our mission is to democratize gaming by delivering console-quality performance through the cloud, making AAA games accessible 
                  on any device with an internet connection.
                </p>
              </CardContent>
            </Card>

            {/* What We Do */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Zap className="w-6 h-6 mr-3 text-purple-400" />
                  What We Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  PixRay is a cutting-edge cloud gaming platform that streams your favorite games directly to your device. 
                  We don't sell games - instead, we provide the infrastructure to play the games you already own on platforms 
                  like Steam and Epic Games Store.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">🎮 Game Streaming</h3>
                    <p className="text-gray-300">Ultra-HD streaming with sub-10ms latency for competitive gaming</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">📱 Universal Access</h3>
                    <p className="text-gray-300">Play on phones, tablets, laptops, and smart TVs seamlessly</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">⚡ Instant Gaming</h3>
                    <p className="text-gray-300">No downloads, no installations - just click and play</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">🔒 Secure Platform</h3>
                    <p className="text-gray-300">Your games, your accounts, your data - all protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Vision */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Rocket className="w-6 h-6 mr-3 text-green-400" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  We envision a future where gaming hardware limitations are a thing of the past. A world where a student 
                  with a basic laptop can enjoy the same gaming experience as someone with a $3000 gaming rig. Where geographic 
                  location doesn't determine your access to the latest games. That's the future we're building at PixRay.
                </p>
              </CardContent>
            </Card>

            {/* Why Choose PixRay */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Globe className="w-6 h-6 mr-3 text-blue-400" />
                  Why Choose PixRay?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">🚀 Cutting-Edge Technology</h3>
                    <p className="text-gray-300 mb-4">
                      Built on AWS infrastructure with global edge networks for optimal performance worldwide.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">💰 Cost-Effective</h3>
                    <p className="text-gray-300 mb-4">
                      No need for expensive hardware upgrades. Pay for what you use and save thousands on gaming equipment.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">🔄 Always Updated</h3>
                    <p className="text-gray-300 mb-4">
                      Our servers run the latest hardware and software, ensuring you always have access to peak performance.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">🌍 Global Reach</h3>
                    <p className="text-gray-300 mb-4">
                      With servers worldwide, enjoy low-latency gaming no matter where you are on the planet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Commitment */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Users className="w-6 h-6 mr-3 text-cyan-400" />
                  Our Commitment to You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300"><strong className="text-cyan-400">Privacy First:</strong> We don't sell your data or show ads. Your gaming is private and secure.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300"><strong className="text-purple-400">Fair Pricing:</strong> Transparent pricing with no hidden fees. Pay for gaming time, not for hardware you don't own.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300"><strong className="text-green-400">Continuous Innovation:</strong> We're constantly improving our platform based on user feedback and technological advances.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300"><strong className="text-yellow-400">Community Focused:</strong> Our users are at the heart of everything we do. Your feedback shapes our roadmap.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm text-center">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Join the Revolution?</h3>
                <p className="text-gray-300 mb-6">
                  Have questions about PixRay or want to learn more about our technology? We'd love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 px-8 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300">
                    <Link href="mailto:support@pixray.cloud" className="flex items-center">
                      📧 Contact Support
                    </Link>
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/5 hover:border-cyan-500 px-8 py-3 rounded-xl font-semibold">
                    <Link href="/" className="flex items-center">
                      🚀 Try PixRay Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}