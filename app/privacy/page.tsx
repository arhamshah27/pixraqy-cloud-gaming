import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, CreditCard, Users, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicy() {
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Effective Date: January 1, 2025
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Information We Collect */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Database className="w-6 h-6 mr-3 text-cyan-400" />
                  1. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">a. Account Information</h3>
                  <ul className="text-gray-300 space-y-2 ml-4">
                    <li>• We use Supabase Auth (self-hosted) to manage user authentication.</li>
                    <li>• We collect your email and basic metadata for identity verification.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">b. Usage Data</h3>
                  <ul className="text-gray-300 space-y-2 ml-4">
                    <li>• We collect anonymized analytics via self-hosted Plausible Analytics, including:</li>
                    <li className="ml-4">- IP address (anonymized)</li>
                    <li className="ml-4">- Browser and device information</li>
                    <li className="ml-4">- Page visits and referral sources</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">c. Payment Information</h3>
                  <ul className="text-gray-300 space-y-2 ml-4">
                    <li>• Payments are processed securely through Razorpay.</li>
                    <li>• We do not store your card or financial information. Razorpay handles all sensitive data in accordance with PCI DSS compliance.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Eye className="w-6 h-6 mr-3 text-purple-400" />
                  2. How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• To provide and secure access to our cloud gaming services.</li>
                  <li>• To authenticate user accounts and verify ownership of games.</li>
                  <li>• To process payments and subscriptions.</li>
                  <li>• To monitor platform usage and improve performance.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Game Ownership */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Users className="w-6 h-6 mr-3 text-green-400" />
                  3. Game Ownership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We do not sell or distribute games. Users are responsible for owning games purchased via platforms like Steam or Epic Games Store. Our system only allows launching of titles linked to verified accounts.
                </p>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Lock className="w-6 h-6 mr-3 text-yellow-400" />
                  4. Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">We employ industry-standard measures including:</p>
                <ul className="text-gray-300 space-y-2">
                  <li>• HTTPS/TLS encryption</li>
                  <li>• Role-based access controls</li>
                  <li>• Isolated compute environments on AWS</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Shield className="w-6 h-6 mr-3 text-blue-400" />
                  5. Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• You may access, update, or delete your account data by contacting us.</li>
                  <li>• You may opt out of analytics tracking via browser settings or privacy tools.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Third-Party Services */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <CreditCard className="w-6 h-6 mr-3 text-pink-400" />
                  6. Third-Party Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We do not share your data with advertisers or third-party marketing tools.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Mail className="w-6 h-6 mr-3 text-cyan-400" />
                  7. Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  📧 <a href="mailto:support@pixray.cloud" className="text-cyan-400 hover:text-cyan-300 transition-colors">support@pixray.cloud</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}