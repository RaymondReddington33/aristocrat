import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButtons } from "@/components/export-buttons"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Users, MessageSquare, Palette, BookOpen, TrendingUp, Target, Lightbulb, BarChart3, Settings, Smartphone, Monitor, FileText, ArrowRight, Image as ImageIcon, Zap, Globe, Apple } from "lucide-react"
import { StorePagePreview } from "@/components/store-page-preview"
import { getScreenshots, getScreenshotMessaging } from "@/app/actions"
import { AppleSearchAdsConfig } from "@/components/apple-search-ads-config"
import { CompetitorAnalysisManager } from "@/components/competitor-analysis-manager"
import { getSelectedAppId, getAppDataOrLatest } from "@/lib/app-selection"

export default async function CreativeBriefPreview({ searchParams }: { searchParams?: { appId?: string } }) {
  // Get selected app ID from query param (from navbar), cookie, or use latest app
  const queryAppId = searchParams?.appId || null
  const cookieAppId = await getSelectedAppId()
  const selectedAppId = queryAppId || cookieAppId
  const appData = await getAppDataOrLatest(selectedAppId)

  if (!appData) {
    redirect("/admin")
  }

  // Fetch screenshots and messaging
  const iosScreenshots = await getScreenshots(appData.id!, "ios")
  const androidScreenshots = await getScreenshots(appData.id!, "android")
  
  // Fetch messaging for screenshots (gracefully handle errors if table doesn't exist)
  const screenshotMessaging = await Promise.all(
    [...iosScreenshots, ...androidScreenshots].map(async (screenshot) => {
      try {
        const messaging = await getScreenshotMessaging(screenshot.id)
        return { screenshot, messaging }
      } catch (error) {
        // If table doesn't exist, just return screenshot without messaging
        return { screenshot, messaging: null }
      }
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100">
      {/* Navigation */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div>
            <Link href="/preview" className="text-purple-600 text-sm font-medium">
              ← Back to previews
            </Link>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin">Edit Brief</Link>
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Target className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 text-balance">Creative Brief</h1>
          <p className="text-xl text-slate-600 text-pretty max-w-3xl mx-auto">
            {appData.app_name || "Your App"} • {appData.creative_brief_store_page_type?.toUpperCase() || "Creative Brief"}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Document Complete</span>
            </div>
            <div>Last updated: {new Date(appData.updated_at).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Overview & Context */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle className="text-2xl">Overview & Context</CardTitle>
                <CardDescription className="text-base">Store page type, target market, and primary objective</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-xs font-medium text-purple-600 uppercase mb-2">Store Page Type</div>
                <div className="text-lg font-semibold text-slate-900 capitalize">
                  {appData.creative_brief_store_page_type === "cpp" ? "CPP (Custom Product Page)" :
                   appData.creative_brief_store_page_type === "csl" ? "CSL (Creative Set)" :
                   appData.creative_brief_store_page_type === "default" ? "Default Store Page" :
                   "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-purple-600 uppercase mb-2">Target Market</div>
                <div className="text-lg font-semibold text-slate-900">{appData.creative_brief_target_market || "Not specified"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-purple-600 uppercase mb-2">Primary Platform</div>
                <div className="text-lg font-semibold text-slate-900 capitalize">
                  {appData.creative_brief_primary_platform === "ios" ? "iOS" :
                   appData.creative_brief_primary_platform === "android" ? "Android" :
                   appData.creative_brief_primary_platform === "both" ? "Both" :
                   "Not specified"}
                </div>
              </div>
            </div>
            {appData.creative_brief_objective && (
              <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-purple-500">
                <div className="text-xs font-medium text-purple-600 uppercase mb-2">Objective</div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {appData.creative_brief_objective}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Creative Strategy */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Creative Strategy</CardTitle>
                <CardDescription className="text-base">Core concept, key message, and target audience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {appData.creative_brief_creative_concept && (
              <div>
                <div className="text-xs font-medium text-blue-600 uppercase mb-2">Creative Concept (Core Message)</div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                    {appData.creative_brief_creative_concept}
                  </p>
                </div>
              </div>
            )}
            {appData.creative_brief_key_message && (
              <div>
                <div className="text-xs font-medium text-blue-600 uppercase mb-2">Key Message</div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {appData.creative_brief_key_message}
                  </p>
                </div>
              </div>
            )}
            {appData.creative_brief_target_audience && (
              <div>
                <div className="text-xs font-medium text-blue-600 uppercase mb-2">Target Audience</div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {appData.creative_brief_target_audience}
                  </p>
                </div>
              </div>
            )}
            {!appData.creative_brief_creative_concept && !appData.creative_brief_key_message && !appData.creative_brief_target_audience && (
              <p className="text-slate-500 italic">No creative strategy information provided</p>
            )}
          </CardContent>
        </Card>

        {/* Screenshot Messaging */}
        {(appData.creative_brief_screenshot_1_message || appData.creative_brief_screenshot_2_message || appData.creative_brief_screenshot_3_message || appData.creative_brief_screenshot_4_message || appData.creative_brief_screenshot_5_message) && (
          <Card className="mb-8 border-2">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-slate-50">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-cyan-600" />
                <div>
                  <CardTitle className="text-2xl">Screenshot Messaging</CardTitle>
                  <CardDescription className="text-base">Taglines and messages for each screenshot position</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {appData.creative_brief_screenshot_1_message && (
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border-l-4 border-cyan-500">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-cyan-600 uppercase mb-1">Screenshot 1 - Hook (Most Important)</div>
                        <p className="text-lg font-semibold text-slate-900">{appData.creative_brief_screenshot_1_message}</p>
                      </div>
                    </div>
                  </div>
                )}
                {appData.creative_brief_screenshot_2_message && (
                  <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-blue-600 uppercase mb-1">Screenshot 2 - Gameplay</div>
                        <p className="text-base font-semibold text-slate-900">{appData.creative_brief_screenshot_2_message}</p>
                      </div>
                    </div>
                  </div>
                )}
                {appData.creative_brief_screenshot_3_message && (
                  <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">3</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-green-600 uppercase mb-1">Screenshot 3 - Value Proposition</div>
                        <p className="text-base font-semibold text-slate-900">{appData.creative_brief_screenshot_3_message}</p>
                      </div>
                    </div>
                  </div>
                )}
                {appData.creative_brief_screenshot_4_message && (
                  <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">4</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-purple-600 uppercase mb-1">Screenshot 4 - Social Proof</div>
                        <p className="text-base font-semibold text-slate-900">{appData.creative_brief_screenshot_4_message}</p>
                      </div>
                    </div>
                  </div>
                )}
                {appData.creative_brief_screenshot_5_message && (
                  <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-amber-500">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">5</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-amber-600 uppercase mb-1">Screenshot 5 - CTA</div>
                        <p className="text-base font-semibold text-slate-900">{appData.creative_brief_screenshot_5_message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Screenshot Messaging Strategy (Legacy - keep for backward compatibility) */}
        {screenshotMessaging.length > 0 && (
          <Card className="mb-8 border-2">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-slate-50">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-cyan-600" />
                <div>
                  <CardTitle className="text-2xl">Screenshot Messaging Strategy</CardTitle>
                  <CardDescription className="text-base">Taglines, value propositions, and A/B testing recommendations for each screenshot</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {screenshotMessaging.map(({ screenshot, messaging }) => (
                  <div key={screenshot.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex gap-3">
                      <div className="w-24 h-48 relative flex-shrink-0 rounded border border-slate-200 overflow-hidden bg-slate-100">
                        {screenshot.image_url ? (
                          <Image
                            src={screenshot.image_url}
                            alt={`Screenshot ${screenshot.sort_order + 1}`}
                            fill
                            className="object-cover"
                            sizes="96px"
                            unoptimized={screenshot.image_url.startsWith('data:')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-slate-600">
                            {screenshot.platform === "ios" ? "iOS" : "Android"} • Position {screenshot.sort_order + 1}
                          </span>
                          {messaging?.ab_test_variant && (
                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${
                              messaging.ab_test_variant === "A"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                            }`}>
                              A/B Test: Variant {messaging.ab_test_variant}
                            </span>
                          )}
                        </div>
                        {messaging?.tagline && (
                          <div className="mb-2">
                            <p className="text-xs text-slate-500 mb-1">Tagline</p>
                            <p className="text-sm font-semibold text-slate-900">{messaging.tagline}</p>
                          </div>
                        )}
                        {messaging?.value_proposition && (
                          <div className="mb-2">
                            <p className="text-xs text-slate-500 mb-1">Value Proposition</p>
                            <p className="text-xs text-slate-700">{messaging.value_proposition}</p>
                          </div>
                        )}
                        {messaging?.cta_text && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">CTA</p>
                            <p className="text-xs font-medium text-blue-600">{messaging.cta_text}</p>
                          </div>
                        )}
                        {!messaging && (
                          <p className="text-xs text-slate-400 italic">No messaging configured</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Style */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-slate-50">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-pink-600" />
              <div>
                <CardTitle className="text-2xl">Visual Direction</CardTitle>
                <CardDescription className="text-base">Visual style, brand guidelines, and design principles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {appData.creative_brief_visual_style && (
              <div>
                <div className="text-xs font-medium text-pink-600 uppercase mb-2">Visual Style</div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {appData.creative_brief_visual_style}
                  </p>
                </div>
              </div>
            )}
            {appData.creative_brief_brand_guidelines && (
              <div>
                <div className="text-xs font-medium text-pink-600 uppercase mb-2">Brand Guidelines</div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {appData.creative_brief_brand_guidelines}
                  </p>
                </div>
              </div>
            )}
            {!appData.creative_brief_visual_style && !appData.creative_brief_brand_guidelines && (
              <p className="text-slate-500 italic">No visual direction information provided</p>
            )}
            
            {/* Color Palette - Interactive */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-3">Color Palette</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="group cursor-pointer">
                  <div className="w-full h-20 rounded-lg bg-purple-600 mb-2 border-2 border-slate-200 shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Royal Purple</p>
                  <p className="text-xs text-slate-500 font-mono">#9333EA</p>
                  <p className="text-xs text-slate-400 mt-1">Primary brand color</p>
                </div>
                <div className="group cursor-pointer">
                  <div className="w-full h-20 rounded-lg bg-yellow-500 mb-2 border-2 border-slate-200 shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Gold</p>
                  <p className="text-xs text-slate-500 font-mono">#EAB308</p>
                  <p className="text-xs text-slate-400 mt-1">Accent & CTAs</p>
                </div>
                <div className="group cursor-pointer">
                  <div className="w-full h-20 rounded-lg bg-red-600 mb-2 border-2 border-slate-200 shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Deep Red</p>
                  <p className="text-xs text-slate-500 font-mono">#DC2626</p>
                  <p className="text-xs text-slate-400 mt-1">Energy & excitement</p>
                </div>
                <div className="group cursor-pointer">
                  <div className="w-full h-20 rounded-lg bg-slate-900 mb-2 border-2 border-slate-200 shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Black</p>
                  <p className="text-xs text-slate-500 font-mono">#0F172A</p>
                  <p className="text-xs text-slate-400 mt-1">Text & contrast</p>
                </div>
                <div className="group cursor-pointer">
                  <div className="w-full h-20 rounded-lg bg-emerald-600 mb-2 border-2 border-slate-200 shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Emerald</p>
                  <p className="text-xs text-slate-500 font-mono">#059669</p>
                  <p className="text-xs text-slate-400 mt-1">Success & trust</p>
                </div>
              </div>
            </div>

            {/* Visual References Gallery */}
            {appData.creative_brief_visual_references && Array.isArray(appData.creative_brief_visual_references) && appData.creative_brief_visual_references.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Visual References</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Design inspiration and reference examples that capture the desired aesthetic and mood
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {appData.creative_brief_visual_references.map((imageUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-100 hover:border-purple-300 transition-all cursor-pointer"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Visual reference ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized={imageUrl.startsWith('data:')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Typography - Expanded */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Typography System</h4>
              <div className="space-y-6 p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                {/* Headlines */}
                <div className="border-b border-slate-200 pb-4">
                  <p className="text-xs font-medium text-purple-600 uppercase mb-3">Headlines & Titles</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Font: Playfair Display (Serif)</p>
                      <p className="text-3xl font-serif" style={{ fontFamily: "'Playfair Display', serif", color: "#0F172A" }}>
                        Premium Casino Experience
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-serif" style={{ fontFamily: "'Playfair Display', serif", color: "#0F172A" }}>
                        Welcome to Royal Spin Palace
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-serif" style={{ fontFamily: "'Playfair Display', serif", color: "#0F172A" }}>
                        Section Headings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Text */}
                <div className="border-b border-slate-200 pb-4">
                  <p className="text-xs font-medium text-purple-600 uppercase mb-3">Body Text & Descriptions</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Font: Inter (Sans-serif)</p>
                      <p className="text-base leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", color: "#334155" }}>
                        Experience Las Vegas casino gaming anytime, anywhere with world-class games and authentic atmosphere. 
                        Our premium selection features over 200 slot machines, live dealer tables, and exclusive tournaments.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", color: "#475569" }}>
                        Secondary body text for descriptions, features, and supporting information. Maintains excellent readability at all sizes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* UI Elements */}
                <div>
                  <p className="text-xs font-medium text-purple-600 uppercase mb-3">UI Elements & Labels</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Font: SF Pro (iOS) / Roboto (Android)</p>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors">
                          Play Now
                        </button>
                        <button className="px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg font-medium text-sm hover:bg-yellow-600 transition-colors">
                          Claim Bonus
                        </button>
                        <span className="px-3 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium text-sm border border-slate-200">
                          Navigation
                        </span>
                        <span className="px-3 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border-2 border-slate-300">
                          Labels
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography Scale */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs font-medium text-purple-600 uppercase mb-3">Typography Scale</p>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs text-slate-500 w-20">Display</span>
                      <span className="text-4xl font-bold text-slate-900">48px</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs text-slate-500 w-20">H1</span>
                      <span className="text-3xl font-bold text-slate-900">32px</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs text-slate-500 w-20">H2</span>
                      <span className="text-2xl font-semibold text-slate-900">24px</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs text-slate-500 w-20">H3</span>
                      <span className="text-xl font-semibold text-slate-900">20px</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs text-slate-500 w-20">Body</span>
                      <span className="text-base text-slate-700">16px</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs text-slate-500 w-20">Small</span>
                      <span className="text-sm text-slate-600">14px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform & ASA Strategy */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-slate-50">
            <div className="flex items-center gap-3">
              <Apple className="h-6 w-6 text-amber-600" />
              <div>
                <CardTitle className="text-2xl">Platform & ASA Strategy</CardTitle>
                <CardDescription className="text-base">Platform considerations, ASA strategy, and competitor analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {appData.creative_brief_platform_considerations && (
              <div>
                <div className="text-xs font-medium text-amber-600 uppercase mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Platform-Specific Considerations
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                      {appData.creative_brief_platform_considerations}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Apple Search Ads (ASA) Strategy */}
            <div>
              <div className="text-xs font-medium text-amber-600 uppercase mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Apple Search Ads (ASA) Strategy
              </div>
              
              {/* Apple Search Ads Configuration Component */}
              <div className="mb-6 border rounded-lg bg-white p-4">
                <AppleSearchAdsConfig
                  keywordGroups={Array.isArray(appData.creative_brief_asa_keyword_groups) ? appData.creative_brief_asa_keyword_groups : []}
                  editable={false}
                  defaultCPPId="CPP-001"
                />
              </div>
              
              {/* Additional Strategic Notes */}
              {appData.creative_brief_asa_strategy && (
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                      {appData.creative_brief_asa_strategy}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {appData.creative_brief_competitor_analysis && Array.isArray(appData.creative_brief_competitor_analysis) && appData.creative_brief_competitor_analysis.length > 0 && (
              <div>
                <div className="text-xs font-medium text-amber-600 uppercase mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Competitor Analysis
                </div>
                <div className="space-y-4">
                  <CompetitorAnalysisManager
                    competitors={appData.creative_brief_competitor_analysis}
                    editable={false}
                  />
                </div>
              </div>
            )}
            {!appData.creative_brief_platform_considerations && !appData.creative_brief_asa_strategy && (!appData.creative_brief_competitor_analysis || !Array.isArray(appData.creative_brief_competitor_analysis) || appData.creative_brief_competitor_analysis.length === 0) && (
              <p className="text-slate-500 italic">No platform or ASA strategy information provided</p>
            )}
          </CardContent>
        </Card>

        {/* Store Page Variations */}
        <div className="mb-8">
          <StorePagePreview />
        </div>

        {/* Current App Configuration */}
        <Card className="border-2 mb-6">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Settings className="h-5 w-5 text-slate-700" />
              Current App Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              {/* App Icon */}
              {appData.app_icon_url ? (
                <div className="flex-shrink-0 relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                  <Image
                    src={appData.app_icon_url}
                    alt={appData.app_name || "App icon"}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={appData.app_icon_url.startsWith('data:')}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Settings className="h-8 w-8 text-slate-400" />
                </div>
              )}
              
              {/* App Details */}
              <div className="flex-1">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase mb-1">App Name</div>
                    <div className="text-base font-semibold text-slate-900">{appData.app_name || "Not set"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase mb-1">Rating</div>
                    <div className="text-base font-semibold text-slate-900">
                      {appData.rating ? `${appData.rating.toFixed(1)} (${appData.review_count?.toLocaleString() || 0} reviews)` : "Not set"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase mb-1">Category</div>
                    <div className="text-base font-semibold text-slate-900">{appData.category || "Not set"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase mb-1">Price</div>
                    <div className="text-base font-semibold text-slate-900">{appData.price || "Not set"}</div>
                  </div>
                </div>
                
                {/* Preview Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/preview/ios">
                      <Smartphone className="h-4 w-4" />
                      iOS Preview
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/preview/android">
                      <Monitor className="h-4 w-4" />
                      Android Preview
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/preview/brief">
                      <FileText className="h-4 w-4" />
                      Creative Brief
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                iOS App Store
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">App Name</div>
                  <div className="text-slate-900">{appData.ios_app_name || "Not set"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">Subtitle</div>
                  <div className="text-slate-900">{appData.ios_subtitle || "Not set"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">Keywords</div>
                  <div className="text-slate-900">{appData.ios_keywords || "Not set"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Google Play Store
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">App Name</div>
                  <div className="text-slate-900">{appData.android_app_name || "Not set"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">Short Description</div>
                  <div className="text-slate-900 line-clamp-2">{appData.android_short_description || "Not set"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="border-2 bg-gradient-to-r from-purple-50 to-blue-50 no-print">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-slate-900 mb-2">Ready to present?</h3>
              <p className="text-sm text-slate-600 mb-4">
                This creative brief can be exported or shared with your team
              </p>
              <ExportButtons appName={appData.app_name} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
