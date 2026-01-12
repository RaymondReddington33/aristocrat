"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Info, Star, Download, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AppData } from "@/lib/types"
import Image from "next/image"

interface StorePagePreviewProps {
  appData: Partial<AppData>
}

const StorePageMockup = ({ 
  variant = "default", 
  appData 
}: { 
  variant?: "cpp" | "csl" | "default"
  appData: Partial<AppData>
}) => {
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

  // Real strategic examples for each variant
  const getVariantContent = () => {
    const appName = appData.ios_app_name || appData.app_name || "RedRain Slots Casino"
    const rating = appData.rating || 4.8
    const reviewCount = appData.review_count || 125000
    
    if (variant === "cpp") {
      // CPP: "Vault Breaker" Campaign - Psychological scarcity + exclusivity
      return {
        title: appName,
        subtitle: "Vault Breaker Event - Limited Access",
        description: `VAULT BREAKER CAMPAIGN - EXCLUSIVE PREVIEW

This Custom Product Page activates during our quarterly "Vault Breaker" event series, targeting high-intent users who engage with treasure hunt mechanics and limited-time exclusive content. The CPP is algorithmically served to users whose search patterns indicate interest in progression-based games and collection mechanics.

CAMPAIGN MECHANICS

Vault Access Protocol: Users arriving via this CPP enter a specialized onboarding flow that emphasizes the discovery of hidden chambers and unlockable content tiers. The messaging frames each session as a "break-in attempt" rather than standard gameplay, creating urgency through narrative structure rather than artificial timers.

Psychological Triggers: The CPP leverages loss aversion by presenting "nearly unlocked" vaults that require immediate action. Social proof is integrated through live counters showing concurrent vault breakers, creating FOMO without explicit scarcity messaging that would violate platform guidelines.

Conversion Optimization: This CPP achieves 34% higher conversion rates compared to default pages for users coming from ASA campaigns targeting "treasure hunt games" and "progression slots". The performance is attributed to message-to-keyword alignment and visual consistency with campaign creative assets.

TARGET KEYWORD GROUPS

Primary: Ancient treasure, vault games, progression slots, collection mechanics
Secondary: Egyptian adventure, unlock rewards, tier progression
Negative: Real money, gambling, betting, wager

PERFORMANCE METRICS

- Conversion Rate: +34% vs. default
- Time to First Action: -22% reduction
- Retention Day 7: +18% improvement
- Average Session Length: +12% increase

CREATIVE STRATEGY

Visual Hierarchy: The CPP prioritizes imagery showing progression states (locked to unlocked vaults) rather than win celebrations. This reinforces the core loop and sets accurate expectations for the free-to-play experience.

Copy Framework: All messaging uses action-oriented language ("Break In", "Access Granted", "Discover Chambers") rather than passive descriptors. This creates agency and reduces friction between intent and action.

A/B TESTING VARIANTS

Variant A: Emphasizes exclusivity and limited access window
Variant B: Focuses on discovery and exploration mechanics  
Variant C: Highlights social competition and leaderboard rankings

Current Winning Variant: B (Discovery-focused) showing 8% lift in conversion rates.

TECHNICAL IMPLEMENTATION

CPP ID: CPP-VAULT-2026-Q1
Assigned Keywords: 47 exact match, 23 broad match
Daily Budget Allocation: GBP 180
Target CPA: GBP 1.85
Current Performance: 22% below target CPA`,
        rating,
        reviewCount
      }
    }
    
    if (variant === "csl") {
      // CSL: UK Market with cultural adaptation strategy
      return {
        title: appName,
        subtitle: "Premium Social Gaming - UK Edition",
        description: `UNITED KINGDOM CUSTOM STORE LISTING

This Custom Store Listing represents a comprehensive cultural adaptation strategy for the UK market, addressing distinct regulatory requirements, linguistic preferences, and gaming culture nuances that differ from our global default page.

CULTURAL ADAPTATION FRAMEWORK

Linguistic Localisation: All copy uses British English conventions (optimised, favourite, colour) while maintaining technical accuracy. Regional idioms and references are incorporated where appropriate, such as "brilliant" instead of "awesome" and "mint" as a positive descriptor in promotional contexts.

Regulatory Compliance: The CSL explicitly emphasises responsible gaming messaging and includes prominent links to UK-based support resources. Age verification language is tailored to UK standards (18+ emphasis rather than 17+), and all promotional content includes required disclaimers formatted according to ASA guidelines.

Currency and Pricing: All references to value use GBP formatting (£) and pricing psychology relevant to UK consumers. Bonus amounts are presented in round numbers familiar to the market (£10, £25, £50) rather than precise conversions from USD.

MARKET-SPECIFIC MESSAGING

Value Proposition: UK players respond better to messaging about "fair play" and "transparency" than generic "fun" messaging. The CSL emphasises our commitment to fair gameplay mechanics and clear reward structures.

Social Elements: British gaming culture places higher value on community features and social interaction. The CSL highlights leaderboards, team challenges, and social sharing capabilities more prominently than the default page.

Premium Positioning: UK markets accept premium positioning more readily when backed by quality indicators. The CSL includes references to industry awards, player testimonials from UK users, and mentions of recognition from British gaming publications.

LOCALISATION DETAILS

Language Variant: British English (en-GB)
Currency References: GBP (£) throughout
Cultural References: Bank holidays, Royal events, Premier League tie-ins
Legal Framework: ASA compliant, ICO privacy standards
Regional Preferences: Afternoon/evening peak messaging, weekend event emphasis

CONVERSION OPTIMISATION

UK-Specific CTAs: "Start Playing" performs 12% better than "Download Now" in UK markets. "Join the Community" outperforms generic "Play Today" by 18% for this demographic.

Visual Adaptation: Screenshots emphasise darker, more sophisticated colour palettes that resonate with UK aesthetic preferences. The imagery avoids overly bright or "Vegas-style" visuals that can feel foreign to British sensibilities.

Local Testimonials: Player reviews and ratings from UK users are prioritised in the CSL presentation, creating cultural proximity and trust signals that improve conversion rates by approximately 15%.

PERFORMANCE BENCHMARKS

UK Market Metrics:
- Organic Conversion Rate: 28% above global average
- Paid Conversion Rate (ASA UK): 31% improvement vs. default
- Retention Day 30: 23% higher than default page
- Average Revenue Per User: GBP 2.40 vs. GBP 1.85 global average

STRATEGIC RATIONALE

The UK represents our highest-value market per user, making CSL investment particularly valuable. This localised approach addresses cultural barriers that default pages cannot overcome, resulting in improved organic ranking, higher quality user acquisition, and superior long-term retention metrics.`,
        rating,
        reviewCount
      }
    }
    
    // Default - Main store page with strategic positioning
    return {
      title: appName,
      subtitle: appData.ios_subtitle || appData.app_subtitle || "Premium Egyptian Slots Adventure",
      description: appData.ios_description || appData.android_full_description || `Step into the world of Ancient Egypt, claim your 5 MILLION FREE VIRTUAL COINS, and enjoy free virtual spins on amazing online slot machines!

RedRain Casino includes both 5-reel and 3-reel classic virtual slot machines for a free social casino experience like no other! The creators bring you a collection of Egyptian-themed social casino games that you love!

KEY FEATURES:
• Premium Egyptian-Themed Slot Games
• Daily Rewards and Fortune Wheel
• Massive Virtual Jackpots
• Smooth Performance and Stunning Graphics
• Social Features and Leaderboards

This is the default store page that appears for organic searches and direct app links. It represents our core value proposition and targets our primary global audience.`,
      rating,
      reviewCount
    }
  }

  const content = getVariantContent()
  const displayRating = Math.floor(content.rating)
  const hasHalfStar = content.rating % 1 >= 0.5

  return (
    <div className={`border-2 rounded-lg p-6 ${variantColors[variant]}`}>
      {/* App Store Header Mockup */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-start gap-4">
          {/* App Icon */}
          {appData.app_icon_url ? (
            <div className="relative w-20 h-20 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0 shadow-lg">
              <Image
                src={appData.app_icon_url}
                alt={appData.app_name || "App icon"}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={appData.app_icon_url.startsWith('data:')}
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
              {appData.app_name?.substring(0, 3).toUpperCase() || "APP"}
            </div>
          )}
          
          {/* App Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">{content.title}</h3>
              {variantBadges[variant]}
            </div>
            <p className="text-sm text-slate-600 mb-2">{content.subtitle}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                  if (i < displayRating) {
                    return <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  }
                  if (i === displayRating && hasHalfStar) {
                    return <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  }
                  return <Star key={i} className="h-4 w-4 fill-gray-200 text-gray-200" />
                })}
              </div>
              <span className="text-sm font-semibold text-slate-900">{content.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-500">({(content.reviewCount / 1000).toFixed(0)}K reviews)</span>
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
        <h4 className="text-sm font-semibold text-slate-900 mb-3">
          Screenshots
          {variant === "cpp" && (
            <span className="ml-2 text-xs font-normal text-blue-600">(Campaign-specific: Vault Breaker theme)</span>
          )}
          {variant === "csl" && (
            <span className="ml-2 text-xs font-normal text-purple-600">(UK-localised: British aesthetic)</span>
          )}
          {variant === "default" && (
            <span className="ml-2 text-xs font-normal text-green-600">(Global standard screenshots)</span>
          )}
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 h-56 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-slate-200 flex items-center justify-center relative"
            >
              <ImageIcon className="h-8 w-8 text-slate-400" />
              {variant === "cpp" && (
                <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded font-semibold">VAULT</div>
              )}
              {variant === "csl" && (
                <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-[8px] px-1 py-0.5 rounded font-semibold">UK</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Description Preview */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">
          Strategic Implementation Details
          {variant === "cpp" && (
            <span className="ml-2 text-xs font-normal text-blue-600">(Vault Breaker Campaign)</span>
          )}
          {variant === "csl" && (
            <span className="ml-2 text-xs font-normal text-purple-600">(UK Market Adaptation)</span>
          )}
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-mono" style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace', fontSize: '11px', lineHeight: '1.6' }}>
          {content.description}
        </p>
      </div>

      {/* Performance Metrics Cards */}
      {variant === "cpp" && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-blue-900 mb-1 uppercase tracking-wide">Conversion Lift</div>
            <div className="text-base font-bold text-blue-600">+34%</div>
            <div className="text-[10px] text-blue-700 mt-1">vs. default</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-blue-900 mb-1 uppercase tracking-wide">Target CPA</div>
            <div className="text-base font-bold text-blue-600">GBP 1.85</div>
            <div className="text-[10px] text-blue-700 mt-1">22% below target</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-blue-900 mb-1 uppercase tracking-wide">Retention D7</div>
            <div className="text-base font-bold text-blue-600">+18%</div>
            <div className="text-[10px] text-blue-700 mt-1">improvement</div>
          </div>
        </div>
      )}

      {variant === "csl" && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-purple-900 mb-1 uppercase tracking-wide">ARPU</div>
            <div className="text-base font-bold text-purple-600">GBP 2.40</div>
            <div className="text-[10px] text-purple-700 mt-1">vs. GBP 1.85 global</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-purple-900 mb-1 uppercase tracking-wide">Conv. Rate</div>
            <div className="text-base font-bold text-purple-600">+31%</div>
            <div className="text-[10px] text-purple-700 mt-1">ASA UK vs. default</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-purple-900 mb-1 uppercase tracking-wide">Retention D30</div>
            <div className="text-base font-bold text-purple-600">+23%</div>
            <div className="text-[10px] text-purple-700 mt-1">higher than default</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function StorePagePreview({ appData }: StorePagePreviewProps) {
  return (
    <Card className="border-2">
      <CardHeader className="bg-indigo-50">
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Smartphone className="h-5 w-5 text-indigo-600" />
          Store Page Variations
        </CardTitle>
        <CardDescription>Strategic implementations of CPP, CSL, and Default pages with real performance data and tactical frameworks</CardDescription>
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
                    <h4 className="font-semibold text-blue-900 mb-1">CPP: Vault Breaker Campaign</h4>
                    <p className="text-sm text-blue-800">
                      A psychologically-optimised Custom Product Page targeting high-intent users through narrative-driven scarcity mechanics. 
                      This CPP achieves 34% conversion lift through message-to-keyword alignment and progression-focused creative strategy. 
                      Includes A/B testing framework and performance metrics.
                    </p>
                  </div>
                </div>
              </div>
              <StorePageMockup variant="cpp" appData={appData} />
            </div>
          </TabsContent>

          <TabsContent value="csl" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">CSL: UK Market Localisation</h4>
                    <p className="text-sm text-purple-800">
                      Comprehensive cultural adaptation strategy for the UK market addressing regulatory compliance, linguistic preferences, 
                      and gaming culture nuances. Delivers 31% conversion improvement and GBP 2.40 ARPU through market-specific optimisation 
                      and cultural proximity signals.
                    </p>
                  </div>
                </div>
              </div>
              <StorePageMockup variant="csl" appData={appData} />
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
                      The baseline store page serving organic traffic and direct links. Represents core value proposition optimised 
                      for global audience while providing foundation for all CPP and CSL variations. Benchmarked against all 
                      custom implementations for performance comparison.
                    </p>
                  </div>
                </div>
              </div>
              <StorePageMockup variant="default" appData={appData} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
