import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, User, Shield, Gamepad2, AlertTriangle, Settings, Scale, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsAndConditions() {
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
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Terms & Conditions
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Welcome to PixRay Cloud. These Terms govern your use of our website and cloud gaming services.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Effective Date: January 1, 2025
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Eligibility */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <User className="w-6 h-6 mr-3 text-cyan-400" />
                  1. Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  You must be at least 13 years old to use our services.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Gamepad2 className="w-6 h-6 mr-3 text-purple-400" />
                  2. Service Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• PixRay Cloud provides a cloud-based gaming platform.</li>
                  <li>• We do not distribute games. Users must own the games via Steam or Epic Games Store.</li>
                  <li>• Users must link their accounts to verify ownership before launching games.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Account */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Shield className="w-6 h-6 mr-3 text-green-400" />
                  3. Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• Users are responsible for maintaining the confidentiality of their credentials.</li>
                  <li>• You agree to provide accurate and up-to-date information.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <FileText className="w-6 h-6 mr-3 text-yellow-400" />
                  4. Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• All platform content, trademarks, and software are the property of PixRay Cloud or its partners.</li>
                  <li>• We do not claim ownership over the games launched through our service. All rights belong to the original publishers and platforms.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <AlertTriangle className="w-6 h-6 mr-3 text-red-400" />
                  5. Acceptable Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">You agree not to:</p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Use the service for illegal or abusive purposes.</li>
                  <li>• Attempt to distribute, pirate, or sell games using our platform.</li>
                  <li>• Circumvent authentication or DRM mechanisms.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Service Availability */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Settings className="w-6 h-6 mr-3 text-blue-400" />
                  6. Service Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• While we aim for high uptime, we do not guarantee 100% availability.</li>
                  <li>• Maintenance or technical issues may interrupt services temporarily.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Modifications */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <FileText className="w-6 h-6 mr-3 text-pink-400" />
                  7. Modifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We may revise these Terms at any time. Continued use after changes indicates acceptance.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Scale className="w-6 h-6 mr-3 text-purple-400" />
                  8. Governing Law
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  These Terms are governed by the laws of India.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Mail className="w-6 h-6 mr-3 text-cyan-400" />
                  9. Contact
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
