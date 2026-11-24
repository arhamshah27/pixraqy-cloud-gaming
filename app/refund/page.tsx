import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, RefreshCw, XCircle, Mail, Clock, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RefundPolicy() {
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
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <RefreshCw className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
                Cancellation & Refund Policy
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We offer simple and fair policies to ensure transparency for all our users.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Effective Date: January 1, 2025
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Subscriptions */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <CreditCard className="w-6 h-6 mr-3 text-cyan-400" />
                  1. Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• Subscriptions are billed through Razorpay and may be monthly or yearly, based on your plan.</li>
                  <li>• You may cancel your subscription any time via your dashboard. Service remains active until the end of the current billing cycle.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Refunds */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <RefreshCw className="w-6 h-6 mr-3 text-green-400" />
                  2. Refunds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">Refunds are available under the following conditions:</p>
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">First-time users:</h3>
                    <p className="text-gray-300">Eligible for a full refund within 7 days of subscription, provided less than 1 hour of cloud gaming time was used.</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Technical issues:</h3>
                    <p className="text-gray-300">If you experience service disruption or are unable to use the platform due to errors on our side, contact us within 48 hours for assistance or eligibility for a pro-rated refund.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Non-Refundable Situations */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <XCircle className="w-6 h-6 mr-3 text-red-400" />
                  3. Non-Refundable Situations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-gray-300 mb-4">Refunds will not be issued for:</p>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Usage over 1 hour</li>
                    <li>• Failure to verify game ownership</li>
                    <li>• Internet or hardware limitations on your side</li>
                    <li>• Subscription misuse or violations of our terms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Requesting a Refund */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Mail className="w-6 h-6 mr-3 text-purple-400" />
                  4. Requesting a Refund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">To request a refund, email us at:</p>
                  <p className="text-xl font-semibold text-purple-400 mb-4">
                    📧 <a href="mailto:billing@pixray.cloud" className="hover:text-purple-300 transition-colors">billing@pixray.cloud</a>
                  </p>
                  <p className="text-gray-300">Include your account email and payment reference.</p>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <AlertCircle className="w-6 h-6 mr-3 text-yellow-400" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 leading-relaxed">
                      Processing time for refunds may take 5-10 business days depending on your payment method and bank. 
                      We'll keep you updated throughout the process via email.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}