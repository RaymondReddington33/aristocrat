"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Home, 
  Settings, 
  Smartphone, 
  Monitor, 
  FileText,
  Search,
  Menu,
  X,
  Info,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showTestInfoDialog, setShowTestInfoDialog] = useState(false)
  const [apps, setApps] = useState<Array<{ id: string; app_name: string; app_icon_url?: string }>>([])
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Fetch all apps for selector
    const fetchApps = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("app_data")
          .select("id, app_name, app_icon_url")
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) {
          console.error("Supabase error fetching apps:", error)
          return
        }

        if (data && data.length > 0) {
          setApps(data)
          // Set the first app as selected by default if no app is selected
          if (!selectedAppId) {
            setSelectedAppId(data[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching apps:", error)
        // Silently fail - app can still work without the app selector
      }
    }

    if (isMounted) {
      fetchApps()
      // Refresh apps list every 5 seconds to catch new apps
      const interval = setInterval(fetchApps, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedAppId, isMounted])

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId)
    // Optionally store in localStorage or context for persistence
  }

  const handlePreviewSelect = (platform: "ios" | "android" | "brief") => {
    router.push(`/preview/${platform}`)
  }

  const selectedApp = apps.find(app => app.id === selectedAppId)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Candidate Info Box - Left Side */}
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              OC
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">Oriol Claramunt</span>
              <span className="text-[10px] text-slate-600 leading-tight">Technical Test de Aristocrat</span>
            </div>
          </Link>

          {/* App Selector & Quick Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl mx-4">
            <div className="flex items-center gap-2 flex-1">
              {isMounted ? (
                <Select
                  value={selectedAppId || ""}
                  onValueChange={handleAppSelect}
                >
                  <SelectTrigger className="w-full max-w-xs h-9">
                    <div className="flex items-center gap-2">
                      {selectedApp?.app_icon_url ? (
                        <img 
                          src={selectedApp.app_icon_url} 
                          alt="App icon" 
                          className="w-4 h-4 rounded object-cover"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded bg-slate-200" />
                      )}
                      <SelectValue>
                        {selectedApp?.app_name || "Select App"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <div className="flex items-center gap-2 w-full">
                          {app.app_icon_url ? (
                            <img 
                              src={app.app_icon_url} 
                              alt={`${app.app_name} icon`} 
                              className="w-4 h-4 rounded object-cover"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded bg-slate-200" />
                          )}
                          <span className="flex-1">{app.app_name}</span>
                          {selectedAppId === app.id && (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full max-w-xs h-9 px-3 py-2 border border-slate-200 rounded-md bg-white flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-200" />
                  <span className="text-sm text-slate-500">Loading...</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/preview/ios")}
                className="h-9 gap-1.5"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">iOS</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/preview/android")}
                className="h-9 gap-1.5"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Android</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/preview/brief")}
                className="h-9 gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Brief</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/preview/keywords")}
                className="h-9 gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Keywords</span>
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={isActive("/") && pathname === "/" ? "default" : "ghost"}
              size="sm"
              className="h-9"
              asChild
            >
              <Link href="/">Home</Link>
            </Button>
            <Button
              variant={isActive("/preview") ? "default" : "ghost"}
              size="sm"
              className="h-9"
              asChild
            >
              <Link href="/preview">All Previews</Link>
            </Button>
            <Button
              variant={isActive("/admin") ? "default" : "ghost"}
              size="sm"
              className="h-9 gap-1.5"
              asChild
            >
              <Link href="/admin">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setShowTestInfoDialog(true)}
            >
              <Info className="h-4 w-4" />
              <span className="hidden lg:inline">Info</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t border-slate-200 mt-2">
            {/* Mobile App Selector */}
            <div className="px-2 py-2">
              {isMounted ? (
                <Select
                  value={selectedAppId || ""}
                  onValueChange={handleAppSelect}
                >
                  <SelectTrigger className="w-full h-10">
                    <div className="flex items-center gap-2">
                      {selectedApp?.app_icon_url ? (
                        <img 
                          src={selectedApp.app_icon_url} 
                          alt="App icon" 
                          className="w-4 h-4 rounded object-cover"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded bg-slate-200" />
                      )}
                      <SelectValue>
                        {selectedApp?.app_name || "Select App"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <div className="flex items-center gap-2 w-full">
                          {app.app_icon_url ? (
                            <img 
                              src={app.app_icon_url} 
                              alt={`${app.app_name} icon`} 
                              className="w-4 h-4 rounded object-cover"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded bg-slate-200" />
                          )}
                          <span className="flex-1">{app.app_name}</span>
                          {selectedAppId === app.id && (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full h-10 px-3 py-2 border border-slate-200 rounded-md bg-white flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-200" />
                  <span className="text-sm text-slate-500">Loading...</span>
                </div>
              )}
            </div>

            {/* Mobile Quick Actions */}
            <div className="grid grid-cols-4 gap-2 px-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/preview/ios")
                  setMobileMenuOpen(false)
                }}
                className="w-full gap-1.5"
              >
                <Smartphone className="h-4 w-4" />
                <span className="text-xs">iOS</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/preview/android")
                  setMobileMenuOpen(false)
                }}
                className="w-full gap-1.5"
              >
                <Monitor className="h-4 w-4" />
                <span className="text-xs">Android</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/preview/brief")
                  setMobileMenuOpen(false)
                }}
                className="w-full gap-1.5"
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">Brief</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/preview/keywords")
                  setMobileMenuOpen(false)
                }}
                className="w-full gap-1.5"
              >
                <Search className="h-4 w-4" />
                <span className="text-xs">Keywords</span>
              </Button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 px-2 pt-2">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive("/") && pathname === "/"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/preview"
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive("/preview")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                All Previews
              </Link>
              <Link
                href="/admin"
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive("/admin")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
              <button
                onClick={() => {
                  setShowTestInfoDialog(true)
                  setMobileMenuOpen(false)
                }}
                className="block px-3 py-2 rounded-md text-sm font-medium transition-all text-slate-700 hover:bg-slate-50 w-full text-left"
              >
                Test Information
              </button>
            </div>

            {/* Mobile Candidate Info */}
            <div className="px-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  OC
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900">Oriol Claramunt</span>
                  <span className="text-[10px] text-slate-600">Technical Test de Aristocrat</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </nav>
  )
}
