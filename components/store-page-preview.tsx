"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Monitor, Info, Star, Download, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const StorePageMockup = ({ variant = "default" }: { variant?: "cpp" | "csl" | "default" }) => {
  const variantColors = {
    cpp: "border-blue-300 bg-blue-50/30",
    csl: "border-purple-300 bg-purple-50/30",
    default: "border-green-300 bg-green-50/30",
  }

  const variantBadges = {
    cpp: <Badge className="bg-blue-600 text-white">CPP</Badge>,
    csl: <Badge className="bg-purple-600 text-white">CSL</Badge>,
    default: <Badge className="bg-green-600 text-white">Default</Badge>,
  }

  return (
    <div className={`border-2 rounded-lg p-6 ${variantColors[variant]}`}>
      {/* App Store Header Mockup */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-start gap-4">
          {/* App Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
            RSP
          </div>
          
          {/* App Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">Royal Spin Palace</h3>
              {variantBadges[variant]}
            </div>
            <p className="text-sm text-slate-600 mb-2">Premium Casino & Slot Games</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-900">4.7</span>
              <span className="text-xs text-slate-500">(128K reviews)</span>
            </div>
            
            {/* Download Button */}
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Get
            </button>
          </div>
        </div>
      </div>

      {/* Screenshots Preview */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Screenshots</h4>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 h-56 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-slate-200 flex items-center justify-center"
            >
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Description Preview */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          {variant === "cpp" && (
            <>🎰 <strong>Campaign-Specific Content:</strong> This CPP features tailored screenshots and messaging optimized for your target audience. Test different creative strategies to maximize conversions.</>
          )}
          {variant === "csl" && (
            <>🌍 <strong>Localized Version:</strong> This CSL is optimized for specific regions or user segments. Content can be tailored while maintaining the same app binary.</>
          )}
          {variant === "default" && (
            <>📱 Experience Las Vegas casino gaming anytime, anywhere. Premium slot machines, live dealers, and daily jackpots await. Join millions of players worldwide!</>
          )}
        </p>
      </div>
    </div>
  )
}

export function StorePagePreview() {
  return (
    <Card className="border-2">
      <CardHeader className="bg-indigo-50">
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Smartphone className="h-5 w-5 text-indigo-600" />
          Store Page Variations
        </CardTitle>
        <CardDescription>Preview different App Store page types (CPP, CSL, Default)</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="cpp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cpp">CPP</TabsTrigger>
            <TabsTrigger value="csl">CSL</TabsTrigger>
            <TabsTrigger value="default">Default</TabsTrigger>
          </TabsList>

          <TabsContent value="cpp" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Custom Product Page (CPP)</h4>
                    <p className="text-sm text-blue-800">
                      Custom Product Pages allow you to create unique landing pages for specific campaigns or audiences.
                      Each CPP can have different screenshots, videos, and promotional text while maintaining the same app
                      core functionality. Perfect for A/B testing different creative strategies.
                    </p>
                  </div>
                </div>
              </div>
              <StorePageMockup variant="cpp" />
            </div>
          </TabsContent>

          <TabsContent value="csl" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">Custom Store Listing (CSL)</h4>
                    <p className="text-sm text-purple-800">
                      Custom Store Listings enable you to create localized or targeted versions of your app store page
                      for specific regions or user segments. Each CSL can have unique descriptions, screenshots, and
                      promotional content while keeping the same app binary.
                    </p>
                  </div>
                </div>
              </div>
              <StorePageMockup variant="csl" />
            </div>
          </TabsContent>

          <TabsContent value="default" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Default Store Page</h4>
                    <p className="text-sm text-green-800">
                      The default store page is your main app listing that appears for organic searches and direct links.
                      This is the baseline version that all users see unless they arrive via a CPP or CSL link. It should
                      represent your core value proposition and target your primary audience.
                    </p>
                  </div>
                </div>
              </div>
              <StorePageMockup variant="default" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
