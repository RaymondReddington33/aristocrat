"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Smartphone, 
  Monitor, 
  FileText, 
  Search, 
  ArrowRight,
  Settings,
  Sparkles,
  Info
} from "lucide-react"

export default function Home() {
  const [showTestInfoDialog, setShowTestInfoDialog] = useState(false)
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Presentation Info */}
            <div className="text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
                <Sparkles className="h-4 w-4 text-slate-700" />
                <span className="text-sm font-medium text-slate-700">
                  Technical Test Delivery
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 leading-tight">
                  ASO/ASA Manager
                  <span className="block text-3xl sm:text-4xl lg:text-5xl text-slate-600 mt-2">
                    Technical Test
                  </span>
                </h1>
                <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
                  Presentation by <span className="font-semibold text-slate-900">Oriol Claramunt Pascual</span>
                </p>
                <p className="text-base text-slate-500 mt-2">
                  For Aristocrat - Product Madness
                </p>
              </div>

              {/* Description */}
              <p className="text-base text-slate-700 leading-relaxed max-w-xl mx-auto lg:mx-0 pt-2">
                Complete ASO/ASA deliverables including keyword research, metadata optimization, creative brief, and platform previews for iOS and Android.
              </p>

              {/* Test Info Link */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTestInfoDialog(true)}
                className="gap-2 mt-4"
              >
                <Info className="h-4 w-4" />
                View Test Assignment Details
              </Button>
            </div>

            {/* Right: Deliverables Grid */}
            <div className="space-y-4">
              {/* Task 1 & 2 Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Card className="border-2 hover:border-blue-300 hover:shadow-md transition-all group">
                  <Link href="/preview/keywords" className="block p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <Search className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Task 1</div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Keyword Research</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          US Market optimization with semantic keyword core
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                </Card>

                <Card className="border-2 hover:border-purple-300 hover:shadow-md transition-all group">
                  <Link href="/preview/brief" className="block p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Task 2</div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Creative Brief</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          CPP, CSL strategy with ASO/ASA guidelines
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                </Card>
              </div>

              {/* Platform Previews */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Card className="border-2 hover:border-slate-300 hover:shadow-md transition-all group">
                  <Link href="/preview/ios" className="block p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-sm">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">iOS</div>
                    <div className="text-xs text-slate-500">Preview</div>
                  </Link>
                </Card>

                <Card className="border-2 hover:border-slate-300 hover:shadow-md transition-all group">
                  <Link href="/preview/android" className="block p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-sm">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Android</div>
                    <div className="text-xs text-slate-500">Preview</div>
                  </Link>
                </Card>

                <Card className="border-2 hover:border-slate-300 hover:shadow-md transition-all group">
                  <Link href="/admin" className="block p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-sm">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Admin</div>
                    <div className="text-xs text-slate-500">Panel</div>
                  </Link>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/preview" className="flex items-center justify-center gap-2">
                    View All Previews
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info - Minimal */}
      <div className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-3 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              Technical Test for <span className="font-semibold text-slate-700">Aristocrat - Product Madness</span>
            </div>
            <div>
              Delivered by <span className="font-semibold text-slate-700">Oriol Claramunt Pascual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Information Dialog */}
      <Dialog open={showTestInfoDialog} onOpenChange={setShowTestInfoDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">ASO/ASA Manager Role – Test Assignment</DialogTitle>
            <DialogDescription>
              Technical test assignment for Product Madness
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Dear Candidate,
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Thank you for your interest in the ASO/ASA Manager position at Product Madness!
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                To better understand your approach and skills, we kindly ask you to complete the following test assignment, which consists of two parts.
              </p>
            </div>

            {/* Task 1 */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Task 1: Keyword Research & Optimization (US Market)</h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <p className="font-semibold mb-1">Objective:</p>
                    <p>Collect a semantic core of relevant keywords for the hypothetical Social Casino genre application, for both iOS (App Store) and Android (Google Play) platforms.</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Identify high-potential keywords based on relevance, volume, difficulty/competition.</li>
                      <li>Include a mix of branded, generic, and competitor terms.</li>
                      <li>Highlight keywords that should be prioritized for title, subtitle, short description, and keyword field (iOS).</li>
                      <li>Present the keyword list in a clear format (Google Sheet or Excel preferred).</li>
                      <li>Title, subtitle, iOS Keywords set(s) for better indexation in US and Android title / short description and long description for better indexation in US (Google Sheet or Excel preferred).</li>
                      <li>Tools such as AppTweak, SensorTower, MobileAction, or similar can be referenced if applicable.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 2 */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Task 2: Creative Brief – CPP or CSL (or a Default Page)</h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div>
                    <p className="font-semibold mb-1">Objective:</p>
                    <p>Create a creative brief for either a CPP, CSL or a Default Store Page for a fictional or real Social Casino app.</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Define the goal: e.g., seasonal event promotion, feature callout, brand theme, user segment, etc.</li>
                      <li>Include suggestions for:</li>
                      <ul className="list-circle list-inside space-y-1 ml-4 mt-1">
                        <li>Messaging / taglines for screenshots</li>
                        <li>Visual direction (art style, theme, tone)</li>
                        <li>Key value propositions or features to highlight</li>
                        <li>Any platform-specific considerations (iOS vs Android)</li>
                      </ul>
                      <li>You may include a wireframe/mockup and/or references to competitor examples if helpful etc.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Format */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-lg font-bold text-slate-900">Submission Format</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-2">
                <li>Please submit your work as a PDF presentation where you place your highlights, concept ideas and links to the document.</li>
                <li>File names should include your name (e.g., JohnDoe_Test.pdf).</li>
              </ul>
            </div>

            <div className="border-t pt-4 text-sm text-slate-600 italic">
              <p>If you have any questions, feel free to reach out.</p>
              <p className="mt-2">Looking forward to seeing your insights and creativity!</p>
              <p className="mt-2 font-semibold">Best regards,</p>
              <p>Product Madness Team</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
