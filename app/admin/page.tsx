"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, Sparkles, Plus, Undo2, Redo2, Trash2 } from "lucide-react"
import type { AppData, AppScreenshot, AppKeyword } from "@/lib/types"
import { getLatestAppData, getAllApps, getAppData, saveAppData, saveScreenshot, savePreviewVideo, getScreenshots, deleteScreenshot, updateScreenshotOrder, getKeywords, bulkDeleteKeywords } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScreenshotManager } from "@/components/screenshot-manager"
import { VisualReferencesUpload } from "@/components/visual-references-upload"
import { ColorPaletteDisplay } from "@/components/color-palette-display"
import { TypographyDisplay } from "@/components/typography-display"
import { AppleSearchAdsConfig } from "@/components/apple-search-ads-config"
import { CompetitorAnalysisManager } from "@/components/competitor-analysis-manager"
import { getUserWithRole } from "@/app/actions"
import { getUserRole, canEdit, getRoleLabel, getEffectiveRole, type UserRole } from "@/lib/auth"

// Lazy load heavy components
const KeywordManager = dynamic(() => import("@/components/keyword-manager").then(mod => ({ default: mod.KeywordManager })), {
  loading: () => <div className="text-center p-8">Loading keyword manager...</div>,
  ssr: false,
  suspense: true
})

export default function AdminPanel() {
  const [appData, setAppData] = useState<Partial<AppData>>({
    app_name: "",
    category: "",
    price: "Free",
    age_rating: "4+",
    rating: 0,
    review_count: 0,
    download_count: "",
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [appId, setAppId] = useState<string | null>(null)
  const [iosScreenshots, setIosScreenshots] = useState<AppScreenshot[]>([])
  const [androidScreenshots, setAndroidScreenshots] = useState<AppScreenshot[]>([])
  const [keywords, setKeywords] = useState<AppKeyword[]>([])
  const [apps, setApps] = useState<Array<{ id: string; app_name: string; app_icon_url?: string }>>([])
  const [showNewAppDialog, setShowNewAppDialog] = useState(false)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [showClearSectionDialog, setShowClearSectionDialog] = useState(false)
  const [sectionToClear, setSectionToClear] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const loadExistingData = useCallback(async () => {
    try {
      const data = await getLatestAppData()

      if (data) {
        setAppData(data)
        setAppId(data.id)
        if (data.updated_at) {
          setLastSaved(new Date(data.updated_at))
        }
        
        // Load screenshots and keywords in parallel when data is loaded
        if (data.id) {
          const [ios, android, keywordsData] = await Promise.all([
            getScreenshots(data.id, "ios"),
            getScreenshots(data.id, "android"),
            getKeywords(data.id)
          ])
          setIosScreenshots(ios)
          setAndroidScreenshots(android)
          setKeywords(keywordsData)
        }
      }
    } catch (error) {
      console.error("Error loading existing data:", error)
    }
  }, [])

  const handleCreateNewApp = () => {
    setShowNewAppDialog(true)
  }

  const confirmCreateNewApp = () => {
    setAppData({
      app_name: "",
      category: "",
      price: "Free",
      age_rating: "4+",
      rating: 0,
      review_count: 0,
      download_count: "",
    })
    setAppId(null)
    setLastSaved(null)
    setIosScreenshots([])
    setAndroidScreenshots([])
    setKeywords([])
    setSaveSuccess(false)
    setValidationErrors({})
    setShowNewAppDialog(false)
  }

  const loadAppData = useCallback(async (selectedAppId: string) => {
    try {
      const data = await getAppData(selectedAppId)
      if (data) {
        setAppData(data)
        setAppId(data.id)
        if (data.updated_at) {
          setLastSaved(new Date(data.updated_at))
        }
        // Load screenshots and keywords
        const [ios, android, keywordsData] = await Promise.all([
          getScreenshots(data.id, "ios"),
          getScreenshots(data.id, "android"),
          getKeywords(data.id)
        ])
        setIosScreenshots(ios)
        setAndroidScreenshots(android)
        setKeywords(keywordsData)
      }
    } catch (error) {
      console.error("Error loading app data:", error)
    }
  }, [])

  const handleAppSelect = async (selectedAppId: string) => {
    if (selectedAppId !== appId) {
      setValidationErrors({})
      await loadAppData(selectedAppId)
      await loadApps() // Refresh apps list
    }
  }

  useEffect(() => {
    // Check user role
    const checkRole = async () => {
      try {
        const { user, role } = await getUserWithRole()
        const effectiveRole = typeof window !== "undefined" ? getEffectiveRole(user?.email) : role
        setUserRole(effectiveRole)
        setIsReadOnly(!canEdit(effectiveRole))
      } catch (error) {
        console.error("Error checking user role:", error)
      }
    }
    
    checkRole()
    loadExistingData()
    
    // Listen for role override changes
    if (typeof window !== "undefined") {
      const handleStorageChange = () => {
        checkRole()
      }
      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }
  }, [loadExistingData])

  const validateAppData = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!appData.app_name || appData.app_name.trim().length === 0) {
      errors.app_name = "App name is required"
    }
    
    if (appData.rating !== undefined && (appData.rating < 0 || appData.rating > 5)) {
      errors.rating = "Rating must be between 0 and 5"
    }
    
    if (appData.review_count !== undefined && appData.review_count < 0) {
      errors.review_count = "Review count cannot be negative"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = useCallback((field: keyof AppData, value: string | number | boolean | string[] | any) => {
    setAppData((prev) => {
      const newData = { ...prev, [field]: value }
      // Clear validation error for this field
      if (validationErrors[field]) {
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors }
          delete newErrors[field]
          return newErrors
        })
      }
      return newData
    })
  }, [validationErrors])

  // Load apps list
  const loadApps = useCallback(async () => {
    try {
      const appsList = await getAllApps()
      setApps(appsList)
    } catch (error) {
      console.error("Error loading apps:", error)
    }
  }, [])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  // Auto-save with debounce
  useEffect(() => {
    // Don't auto-save if there's no meaningful data
    if (!appData.app_name || appData.app_name.trim() === "") return
    
    const timeoutId = setTimeout(async () => {
      setSaving(true)
      try {
        const result = await saveAppData(appData, appId)
        if (result.success) {
          // If we just created a new app, update the appId and refresh apps list
          if (!appId && result.id) {
            setAppId(result.id)
            loadApps() // Refresh apps list to include the new app
          }
          setLastSaved(new Date())
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
        }
      } catch (error) {
        console.error("Error auto-saving:", error)
      } finally {
        setSaving(false)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timeoutId)
  }, [appData, appId, loadApps])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)

    try {
      const result = await saveAppData(appData, appId)

      if (result.success) {
        if (!appId) {
          setAppId(result.id)
        }
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (field: keyof AppData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, use a placeholder. In production, you'd upload to Supabase Storage
    const reader = new FileReader()
    reader.onloadend = () => {
      handleInputChange(field, reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const loadDemoCasinoApp = () => {
    setAppData({
      app_name: "RedRain Slots Casino",
      app_subtitle: "Free Casino Slots & Jackpots",
      category: "Casino",
      price: "Free",
      age_rating: "12+",
      rating: 4.6,
      review_count: 89542,
      download_count: "8.5M+",
      app_icon_url: "/images/casino-icon.jpg",

      // iOS specific
      ios_app_name: "RedRain Fortune: Slot Games",
      ios_subtitle: "Free Casino Slots & Jackpots",
      ios_description:
        "Unlock Your Fortune with RedRain Fortune, the premium Egyptian-themed slot experience. Discover legendary treasures with stunning slot games inspired by ancient Egypt, featuring Cleopatra, pharaohs, and hidden pyramids.\n\nKEY FEATURES\n• Premium Egyptian-Themed Slot Games\n• Big Jackpots & Daily Rewards\n• Fortune Wheel & Daily Bonuses\n• Stunning Graphics & Smooth Gameplay\n• Play Anytime, Just for Fun\n• No Real Money Required\n\nWHY PLAYERS LOVE US\n✓ Premium Quality Graphics\n✓ Generous Daily Rewards\n✓ Regular New Games\n✓ Smooth Performance\n✓ Social Features\n\nFor entertainment purposes only. No real money gambling. In-app purchases available.",
      ios_promotional_text:
        "Welcome Bonus! Get 1,000,000 FREE COINS plus 100 free spins. Unlock your fortune and start spinning today!",
      ios_keywords: "casino games,free slots,slot machine,jackpot slots,egypt slots,pharaoh,cleopatra,slotomania,huuuge casino",
      ios_whats_new:
        "Version 2.1.0 - Ancient Treasures Update\n\nNEW GAMES\n• Cleopatra's Gold Rush\n• Pharaoh's Fortune Megaways\n• Pyramid Secrets\n\nFEATURES\n• Enhanced Fortune Wheel\n• Improved Daily Rewards\n• New Bonus Rounds\n\nPERFORMANCE\n• Faster loading times\n• Smoother animations\n• Bug fixes and optimisations",
      ios_support_url: "https://redrainfortune.com/support",
      ios_marketing_url: "https://redrainfortune.com",
      ios_privacy_url: "https://redrainfortune.com/privacy",

      // Android specific
      android_app_name: "RedRain Fortune: Slot Games",
      android_short_description:
        "Premium Egyptian-themed slot games with big jackpots and daily rewards. Unlock your fortune today!",
      android_full_description:
        "Unlock Your Fortune with RedRain Fortune, the premium Egyptian-themed slot experience. Journey through ancient Egypt and discover legendary treasures with stunning slot games featuring Cleopatra, pharaohs, and hidden pyramids.\n\nPREMIUM SLOT GAMES\n• Egyptian-Themed Slots\n• Cleopatra & Pharaoh Games\n• Progressive Jackpots\n• Fortune Wheel Bonus\n• Daily Rewards\n• New Games Regularly\n\nGENEROUS REWARDS\n• Welcome Bonus: 1,000,000 FREE COINS\n• 100 Free Spins\n• Daily Login Rewards\n• Fortune Wheel Prizes\n• Bonus Rounds\n\nWHY REDRAIN FORTUNE?\n✓ Premium Quality Graphics\n✓ Smooth Gameplay\n✓ Generous Rewards\n✓ Regular Updates\n✓ Social Features\n✓ For Entertainment Only\n\nFor entertainment purposes only. No real money gambling. In-app purchases available.",
      android_promo_text:
        "Welcome Bonus! Get 1,000,000 FREE COINS plus 100 free spins. Start your fortune journey today!",
      android_recent_changes:
        "What's New in Version 2.1.0:\n\nNEW GAMES\n• Cleopatra's Gold Rush\n• Pharaoh's Fortune Megaways\n• Pyramid Secrets\n\nIMPROVEMENTS\n• Enhanced Fortune Wheel\n• Improved Daily Rewards System\n• New Bonus Rounds\n• Better Performance\n\nOPTIMISATION\n• Faster loading\n• Smoother animations\n• Bug fixes",

      // Creative Brief - Task 2 Structure
      creative_brief_store_page_type: "cpp",
      creative_brief_target_market: "United Kingdom (valid also for United States with adjustments)",
      creative_brief_primary_platform: "ios",
      creative_brief_objective:
        "Increase conversion (CVR) of users searching for 'slots', 'egypt slots', 'pharaoh slots', 'fortune slots' and related variants, highlighting a clear and differentiated Egyptian Fortune fantasy that sets RedRain apart from generic casino apps.",
      creative_brief_creative_concept:
        "Unlock Your Fortune\n\nWe speak of destiny, fortune, power, and reward - not real money or betting. This language converts, is legal, and aligns with Apple guidelines. The concept positions RedRain as a premium Egyptian-themed slot experience, not just another generic casino app.",
      creative_brief_target_audience:
        "Primary Audience:\n• Age: 25-55 years old\n• Gender: 55% Female, 45% Male\n• Income: £25,000-£75,000 annually\n• Interests: Casino gaming, slot games, entertainment, social gaming, Egyptian themes\n• Location: UK (primary), US (secondary)\n\nUser Personas:\n1. Fortune Seeker Fiona - 35, enjoys themed slot games, plays during commute\n2. Casual Player Chris - 42, plays during breaks, prefers simple mechanics\n3. Slot Enthusiast Sam - 28, loves Egyptian themes, enjoys daily rewards",
      creative_brief_key_message:
        "Primary Message: Unlock Your Fortune with Premium Egyptian-Themed Slots\n\nKey Value Propositions:\n1. Premium Egyptian-themed slot experience\n2. Big jackpots and daily rewards\n3. Stunning graphics and smooth gameplay\n4. Play anytime, just for fun (no real money)\n5. Regular new games and features\n\nDifferentiation: Clear Egyptian Fortune fantasy vs generic casino positioning",
      creative_brief_visual_style:
        "Style:\n• Premium illustration\n• Central female character (Egyptian queen/Cleopatra)\n• Golden and purple lighting\n• Clear slot UI (visible reels)\n• Egyptian architectural elements (pyramids, hieroglyphs)\n\nTone:\n• Power\n• Elegance\n• Mystery\n• Fortune\n• Not childish cartoon\n• Mid-core social casino aesthetic\n\nColour Palette:\n• Royal Purple (#6B46C1) - Luxury and premium quality\n• Gold (#F59E0B) - Wealth and prestige\n• Deep Red (#DC2626) - Excitement and energy\n• Black (#1F2937) - Sophistication\n• Sand Beige (#F5F5DC) - Egyptian desert\n\nTypography:\n• Headlines: Playfair Display / Merriweather (for official docs)\n• Body: Inter / I Manrope (for UI)\n• UI: SF Pro (iOS) / Roboto (Android)\n\nDesign Principles:\n• Premium aesthetic\n• Clear visual hierarchy\n• Generous whitespace\n• Gold highlights for CTAs\n• Egyptian motifs as decorative elements",
      creative_brief_brand_guidelines:
        "Brand Positioning: A premium Egyptian Fortune slot experience within the Social Casino genre\n\nBrand Values:\n1. Excellence - Premium quality in every detail\n2. Fortune - Destiny and reward\n3. Elegance - Sophisticated, not cartoonish\n4. Trustworthy - Clear, honest communication\n5. Entertaining - Fun and engaging\n\nDo's:\n✓ Emphasise Egyptian Fortune theme\n✓ Showcase premium quality\n✓ Highlight daily rewards and jackpots\n✓ Use 'fortune', 'destiny', 'treasure' language\n✓ Maintain elegant, sophisticated tone\n\nDon'ts:\n✗ Unrealistic promises\n✗ Real money gambling references\n✗ Betting terminology\n✗ Low-quality graphics\n✗ Generic casino messaging\n✗ Aggressive tactics",
      creative_brief_screenshot_1_message: "Unlock Your Fortune",
      creative_brief_screenshot_2_message: "Epic Slot Games Inspired by Ancient Fortune",
      creative_brief_screenshot_3_message: "Big Jackpots. Daily Rewards.",
      creative_brief_screenshot_4_message: "Play Anytime. Just for Fun.",
      creative_brief_screenshot_5_message: "Start Spinning Today",
      creative_brief_platform_considerations:
        "iOS-Specific Considerations:\n• No 'win real money' language\n• No 'bet' or 'wagering' terminology\n• No confusing symbols\n• Disclaimer clearly visible in description\n• Age Rating: 12+\n• Compliance with Apple Review Guidelines\n\nRecommended Disclaimer Text:\n'For entertainment purposes only. No real money gambling. In-app purchases available.'\n\nKey Compliance Points:\n• Clear 'just for fun' messaging\n• No real money claims\n• Appropriate age rating\n• Transparent about in-app purchases",
      creative_brief_asa_strategy:
        "Strategic Rationale:\n• Apple measures relevance between keyword + CPP\n• Higher relevance = better Quality Score = better CVR = lower CPI\n• Egyptian-themed keywords align perfectly with our CPP visuals and messaging\n• Demonstrates senior UA thinking: keyword → creative alignment",
      
      // ASA Keyword Groups (structured campaign data)
      creative_brief_asa_keyword_groups: [
        {
          id: "group-1",
          name: "High Volume - Slots",
          keywords: ["slots", "casino slots", "slot games", "free slots"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-001",
          dailyBudget: 100,
          targetCPA: 2.0,
        },
        {
          id: "group-2",
          name: "Egyptian Theme - High Relevance",
          keywords: ["egypt slots", "pharaoh slots", "cleopatra slots", "fortune slots", "egyptian slots"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-001",
          dailyBudget: 75,
          targetCPA: 1.8,
        },
      ],
      creative_brief_competitor_analysis: [
        {
          id: "comp-1",
          name: "Slotomania",
          appStoreUrl: "https://apps.apple.com/app/slotomania-slots-casino/id393922266",
          playStoreUrl: "https://play.google.com/store/apps/details?id=air.com.playtika.slotomania",
          iconUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/e0/59/86/e05986c5-2b05-8d24-4b2e-2a0b8e5c8f5c/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg",
          strengths: ["Large game library", "Established brand", "Strong user base"],
          weaknesses: ["Dated interface", "Generic positioning", "Outdated visuals"],
          ourAdvantage: "Premium Egyptian-themed positioning with modern, elegant visuals that differentiate from generic casino apps",
          keywords: ["slots", "casino", "slot games", "free slots", "jackpot slots"],
          notes: "Market leader but lacks thematic differentiation"
        },
        {
          id: "comp-2",
          name: "Huuuge Casino",
          appStoreUrl: "https://apps.apple.com/app/huuuge-casino-slots-vegas/id1069144272",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.huuuge.casino.slots",
          iconUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/d1/f1/e9/d1f1e9c8-3f5e-8b5d-9c2a-4e6f8a9b0c1d/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg",
          strengths: ["Strong marketing", "Large player base", "Good game quality"],
          weaknesses: ["Generic casino positioning", "Crowded marketplace", "No clear theme"],
          ourAdvantage: "Clear fantasy differentiation with Egyptian Fortune theme that creates emotional connection",
          keywords: ["casino", "slots", "vegas slots", "casino games", "free casino"],
          notes: "Strong marketing but struggles with differentiation in crowded market"
        },
        {
          id: "comp-3",
          name: "DoubleU Casino",
          appStoreUrl: "https://apps.apple.com/app/doubleu-casino-free-slots/id547436543",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.doubleugame.DoubleUCasino",
          iconUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/a1/b2/c3/a1b2c3d4-e5f6-7890-abcd-ef1234567890/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg",
          strengths: ["Good game quality", "Social features", "Regular updates"],
          weaknesses: ["Generic messaging", "No clear theme", "Limited visual identity"],
          ourAdvantage: "Unique Egyptian theme with premium aesthetic that creates memorable brand identity",
          keywords: ["casino", "slots", "free casino", "casino games", "social casino"],
          notes: "Good gameplay but lacks strong visual and thematic identity"
        }
      ] as Competitor[],
      
      // Color Palette (structured data)
      creative_brief_color_palette: [
        { name: "Royal Purple", hex: "#9333EA", usage: "Primary brand color" },
        { name: "Gold", hex: "#EAB308", usage: "Accent & CTAs" },
        { name: "Deep Red", hex: "#DC2626", usage: "Energy & excitement" },
        { name: "Black", hex: "#0F172A", usage: "Text & contrast" },
        { name: "Emerald", hex: "#059669", usage: "Success & trust" },
      ],
      
      // Typography System (structured data)
      creative_brief_typography: [
        {
          name: "Headlines & Titles",
          font: "Playfair Display",
          size: "32px",
          weight: "700",
          example: "Premium Casino Experience",
        },
        {
          name: "Section Headings",
          font: "Inter",
          size: "24px",
          weight: "600",
          example: "Welcome to RedRain Fortune",
        },
        {
          name: "Body Text & Descriptions",
          font: "Inter",
          size: "16px",
          weight: "400",
          example: "Experience the premium Egyptian-themed slot experience with stunning graphics and smooth gameplay.",
        },
        {
          name: "UI Elements & Labels",
          font: "SF Pro",
          size: "14px",
          weight: "500",
          example: "Play Now • Claim Bonus • Navigation",
        },
      ],

      // In-App Purchases
      has_in_app_purchases: true,
      in_app_purchases_description:
        "RedRain Fortune offers a variety of in-app purchases to enhance your gaming experience. From coin packages to remove ads, unlock exclusive features and maximise your fortune-seeking journey.",
      ios_in_app_purchases:
        "Fortune Starter Pack - £2.99\n• 500,000 coins\n• 50 free spins\n• Remove ads for 7 days\n\nGold Fortune Pack - £4.99\n• 1,000,000 coins\n• 100 free spins\n• Remove ads for 14 days\n\nPlatinum Fortune Pack - £9.99\n• 2,500,000 coins\n• 250 free spins\n• Remove ads for 30 days\n• Exclusive bonus games\n\nDiamond Fortune Pack - £19.99\n• 5,000,000 coins\n• 500 free spins\n• Remove ads permanently\n• VIP status\n• Exclusive tournaments\n\nRemove Ads - £4.99 (one-time)\n• Enjoy uninterrupted gameplay\n• Faster loading times\n• Ad-free experience",
      android_in_app_products:
        "Fortune Starter Pack - £2.99\n• 500,000 coins\n• 50 free spins\n• Remove ads for 7 days\n\nGold Fortune Pack - £4.99\n• 1,000,000 coins\n• 100 free spins\n• Remove ads for 14 days\n\nPlatinum Fortune Pack - £9.99\n• 2,500,000 coins\n• 250 free spins\n• Remove ads for 30 days\n• Exclusive bonus games\n\nDiamond Fortune Pack - £19.99\n• 5,000,000 coins\n• 500 free spins\n• Remove ads permanently\n• VIP status\n• Exclusive tournaments\n\nRemove Ads - £4.99 (one-time)\n• Enjoy uninterrupted gameplay\n• Faster loading times\n• Ad-free experience",
    })
  }

  const getCharCount = (text: string | undefined, max: number) => {
    const count = text?.length || 0
    const colorClass = count > max ? "text-red-600" : count > max * 0.9 ? "text-orange-600" : "text-muted-foreground"
    return (
      <span className={`text-xs ${colorClass}`}>
        {count}/{max}
      </span>
    )
  }

  const handleClearSection = (section: string) => {
    setSectionToClear(section)
    setShowClearSectionDialog(true)
  }

  const confirmClearSection = () => {
    if (!sectionToClear) return

    setAppData((prev) => {
      const newData = { ...prev }
      
      switch (sectionToClear) {
        case "general":
          newData.app_name = ""
          newData.app_subtitle = ""
          newData.category = ""
          newData.price = "Free"
          newData.rating = 0
          newData.review_count = 0
          newData.download_count = ""
          newData.age_rating = "4+"
          newData.app_icon_url = ""
          break
        case "ios":
          newData.ios_app_name = ""
          newData.ios_subtitle = ""
          newData.ios_promotional_text = ""
          newData.ios_description = ""
          newData.ios_keywords = ""
          newData.ios_whats_new = ""
          newData.ios_support_url = ""
          newData.ios_marketing_url = ""
          newData.ios_privacy_url = ""
          break
        case "android":
          newData.android_app_name = ""
          newData.android_short_description = ""
          newData.android_full_description = ""
          newData.android_promo_text = ""
          newData.android_recent_changes = ""
          break
        case "creative":
          newData.creative_brief_store_page_type = undefined
          newData.creative_brief_target_market = ""
          newData.creative_brief_primary_platform = undefined
          newData.creative_brief_objective = ""
          newData.creative_brief_creative_concept = ""
          newData.creative_brief_target_audience = ""
          newData.creative_brief_key_message = ""
          newData.creative_brief_visual_style = ""
          newData.creative_brief_brand_guidelines = ""
          newData.creative_brief_competitor_analysis = []
          newData.creative_brief_screenshot_1_message = ""
          newData.creative_brief_screenshot_2_message = ""
          newData.creative_brief_screenshot_3_message = ""
          newData.creative_brief_screenshot_4_message = ""
          newData.creative_brief_screenshot_5_message = ""
          newData.creative_brief_platform_considerations = ""
          newData.creative_brief_asa_strategy = ""
          newData.creative_brief_color_palette = []
          newData.creative_brief_typography = []
          newData.creative_brief_visual_references = []
          break
        case "keywords":
          // Keywords will be handled separately
          break
      }
      
      return newData
    })

    if (sectionToClear === "ios") {
      setIosScreenshots([])
    } else if (sectionToClear === "android") {
      setAndroidScreenshots([])
    } else if (sectionToClear === "keywords") {
      // Delete all keywords
      if (appId && keywords.length > 0) {
        const keywordIds = keywords.map(k => k.id)
        bulkDeleteKeywords(keywordIds).then(result => {
          if (result.success) {
            setKeywords([])
            toast({
              title: "Success",
              description: `Deleted ${result.count} keyword(s)`,
            })
          } else {
            toast({
              title: "Error",
              description: result.error || "Failed to delete keywords",
              variant: "destructive",
            })
          }
        })
      } else {
        setKeywords([])
      }
    }

    setShowClearSectionDialog(false)
    setSectionToClear(null)
    if (sectionToClear !== "keywords") {
      toast({
        title: "Success",
        description: `Cleared ${sectionToClear} section`,
      })
    }
  }

  const handleClearAll = () => {
    setShowClearAllDialog(true)
  }

  const confirmClearAll = () => {
    setAppData({
      app_name: "",
      category: "",
      price: "Free",
      age_rating: "4+",
      rating: 0,
      review_count: 0,
      download_count: "",
    })
    setIosScreenshots([])
    setAndroidScreenshots([])
    setKeywords([])
    setValidationErrors({})
    setShowClearAllDialog(false)
    toast({
      title: "Success",
      description: "All sections cleared",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              ASO/ASA Admin Panel
            </h1>
            <p className="text-muted-foreground mt-2">Manage your App Store and Google Play listings</p>
          </div>
          <div className="flex gap-3 items-center">
            {apps.length > 0 && (
              <Select value={appId || ""} onValueChange={handleAppSelect}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select App" />
                </SelectTrigger>
                <SelectContent>
                  {apps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.app_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={handleCreateNewApp} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New App
            </Button>
            <Button onClick={loadDemoCasinoApp} variant="outline" className="gap-2 bg-transparent">
              <Sparkles className="h-4 w-4" />
              Load Demo Casino App
            </Button>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-xs text-slate-500">
                  Last saved: {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
              {saving && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Auto-saving...</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => router.push("/preview")}>
              View Previews
            </Button>
            <Button variant="outline" onClick={handleClearAll} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Your changes have been saved successfully!</AlertDescription>
          </Alert>
        )}

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="ios">iOS App Store</TabsTrigger>
                <TabsTrigger value="android">Google Play</TabsTrigger>
                <TabsTrigger value="creative">Creative Brief</TabsTrigger>
                <TabsTrigger value="keywords">Keyword Research</TabsTrigger>
              </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Basic app information used across both platforms</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleClearSection("general")} className="gap-2 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Clear Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="app_name">App Name *</Label>
                    <Input
                      id="app_name"
                      value={appData.app_name || ""}
                      onChange={(e) => handleInputChange("app_name", e.target.value)}
                      placeholder="Enter app name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={appData.category || ""}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      placeholder="e.g., Productivity, Games"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app_subtitle">App Subtitle</Label>
                  <Input
                    id="app_subtitle"
                    value={appData.app_subtitle || ""}
                    onChange={(e) => handleInputChange("app_subtitle", e.target.value)}
                    placeholder="Brief tagline for your app"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app_icon">App Icon</Label>
                  <div className="flex items-center gap-4">
                    {appData.app_icon_url && (
                      <img
                        src={appData.app_icon_url || "/placeholder.svg"}
                        alt="App icon"
                        className="w-16 h-16 rounded-lg border object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        id="app_icon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("app_icon_url", e)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-slate-500 mt-1">Recommended: 1024x1024px PNG</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={appData.price || ""}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="Free or £4.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={appData.rating || ""}
                      onChange={(e) => handleInputChange("rating", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review_count">Review Count</Label>
                    <Input
                      id="review_count"
                      type="number"
                      value={appData.review_count || ""}
                      onChange={(e) => handleInputChange("review_count", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="download_count">Download Count</Label>
                    <Input
                      id="download_count"
                      value={appData.download_count || ""}
                      onChange={(e) => handleInputChange("download_count", e.target.value)}
                      placeholder="e.g., 1M+, 10K+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age_rating">Age Rating</Label>
                    <Input
                      id="age_rating"
                      value={appData.age_rating || ""}
                      onChange={(e) => handleInputChange("age_rating", e.target.value)}
                      placeholder="4+, 12+, 17+"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_in_app_purchases"
                      checked={appData.has_in_app_purchases || false}
                      onCheckedChange={(checked) => handleInputChange("has_in_app_purchases", checked ? true : false)}
                    />
                    <Label htmlFor="has_in_app_purchases" className="font-medium cursor-pointer">
                      Offers In-App Purchases
                    </Label>
                  </div>
                  {appData.has_in_app_purchases && (
                    <div className="space-y-2">
                      <Label htmlFor="in_app_purchases_description">In-App Purchases Description</Label>
                      <Textarea
                        id="in_app_purchases_description"
                        value={appData.in_app_purchases_description || ""}
                        onChange={(e) => handleInputChange("in_app_purchases_description", e.target.value)}
                        placeholder="General description of in-app purchases available in the app"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ios" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>iOS App Store Listing</CardTitle>
                    <CardDescription>Information specific to the Apple App Store</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleClearSection("ios")} className="gap-2 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Clear Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ios_app_name">iOS App Name</Label>
                  <Input
                    id="ios_app_name"
                    value={appData.ios_app_name || ""}
                    onChange={(e) => handleInputChange("ios_app_name", e.target.value)}
                    placeholder="Max 30 characters"
                    maxLength={30}
                  />
                  {getCharCount(appData.ios_app_name, 30)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ios_subtitle">Subtitle</Label>
                  <Input
                    id="ios_subtitle"
                    value={appData.ios_subtitle || ""}
                    onChange={(e) => handleInputChange("ios_subtitle", e.target.value)}
                    placeholder="Max 30 characters"
                    maxLength={30}
                  />
                  {getCharCount(appData.ios_subtitle, 30)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ios_promotional_text">Promotional Text</Label>
                  <Textarea
                    id="ios_promotional_text"
                    value={appData.ios_promotional_text || ""}
                    onChange={(e) => handleInputChange("ios_promotional_text", e.target.value)}
                    placeholder="Max 170 characters"
                    rows={3}
                    maxLength={170}
                  />
                  {getCharCount(appData.ios_promotional_text, 170)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ios_description">Description</Label>
                  <Textarea
                    id="ios_description"
                    value={appData.ios_description || ""}
                    onChange={(e) => handleInputChange("ios_description", e.target.value)}
                    placeholder="Max 4,000 characters"
                    rows={8}
                    maxLength={4000}
                  />
                  {getCharCount(appData.ios_description, 4000)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ios_keywords">Keywords</Label>
                  <Input
                    id="ios_keywords"
                    value={appData.ios_keywords || ""}
                    onChange={(e) => handleInputChange("ios_keywords", e.target.value)}
                    placeholder="Comma-separated, max 100 characters"
                    maxLength={100}
                  />
                  {getCharCount(appData.ios_keywords, 100)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ios_whats_new">What's New</Label>
                  <Textarea
                    id="ios_whats_new"
                    value={appData.ios_whats_new || ""}
                    onChange={(e) => handleInputChange("ios_whats_new", e.target.value)}
                    placeholder="Latest update information"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="ios_support_url">Support URL</Label>
                    <Input
                      id="ios_support_url"
                      type="url"
                      value={appData.ios_support_url || ""}
                      onChange={(e) => handleInputChange("ios_support_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ios_marketing_url">Marketing URL</Label>
                    <Input
                      id="ios_marketing_url"
                      type="url"
                      value={appData.ios_marketing_url || ""}
                      onChange={(e) => handleInputChange("ios_marketing_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ios_privacy_url">Privacy Policy URL</Label>
                    <Input
                      id="ios_privacy_url"
                      type="url"
                      value={appData.ios_privacy_url || ""}
                      onChange={(e) => handleInputChange("ios_privacy_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {appData.has_in_app_purchases && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="ios_in_app_purchases">iOS In-App Purchases</Label>
                    <Textarea
                      id="ios_in_app_purchases"
                      value={appData.ios_in_app_purchases || ""}
                      onChange={(e) => handleInputChange("ios_in_app_purchases", e.target.value)}
                      placeholder="List of iOS in-app purchases (e.g., Premium Subscription - $9.99/month, Remove Ads - $4.99, Extra Coins Pack - $2.99)"
                      rows={4}
                    />
                    <p className="text-xs text-slate-500">List all in-app purchases available on iOS</p>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t">
                  <ScreenshotManager
                    appId={appId}
                    platform="ios"
                    screenshots={iosScreenshots}
                    onScreenshotsChange={setIosScreenshots}
                    onSave={async (screenshot) => {
                      const result = await saveScreenshot(
                        screenshot.app_data_id,
                        screenshot.platform as "ios" | "android",
                        screenshot.device_type as "iphone" | "ipad" | "android_phone" | "android_tablet",
                        screenshot.image_url,
                        screenshot.sort_order
                      )
                      return result
                    }}
                    onDelete={async (id) => {
                      return await deleteScreenshot(id)
                    }}
                    onUpdateOrder={async (id, sortOrder) => {
                      return await updateScreenshotOrder(id, sortOrder)
                    }}
                    onReload={async () => {
                      if (appId) {
                        const ios = await getScreenshots(appId, "ios")
                        setIosScreenshots(ios)
                      }
                    }}
                  />

                  <div className="space-y-2">
                    <Label>iOS Preview Videos</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || [])
                        if (!appId) {
                          toast({
                            title: "Action Required",
                            description: "Please save the app data first before uploading videos",
                            variant: "destructive",
                          })
                          return
                        }
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i]
                          const reader = new FileReader()
                          reader.onloadend = async () => {
                            const videoUrl = reader.result as string
                            const result = await savePreviewVideo(appId, "ios", videoUrl, undefined, i)
                            if (result.success) {
                              console.log("Preview video saved:", file.name)
                            } else {
                              console.error("Error saving video:", result.error)
                            }
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">Upload preview videos (max 30 seconds each)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="android" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Google Play Store Listing</CardTitle>
                    <CardDescription>Information specific to Google Play Store</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleClearSection("android")} className="gap-2 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Clear Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="android_app_name">App Name</Label>
                  <Input
                    id="android_app_name"
                    value={appData.android_app_name || ""}
                    onChange={(e) => handleInputChange("android_app_name", e.target.value)}
                    placeholder="Max 50 characters"
                    maxLength={50}
                  />
                  {getCharCount(appData.android_app_name, 50)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="android_short_description">Short Description</Label>
                  <Textarea
                    id="android_short_description"
                    value={appData.android_short_description || ""}
                    onChange={(e) => handleInputChange("android_short_description", e.target.value)}
                    placeholder="Max 80 characters"
                    rows={2}
                    maxLength={80}
                  />
                  {getCharCount(appData.android_short_description, 80)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="android_full_description">Full Description</Label>
                  <Textarea
                    id="android_full_description"
                    value={appData.android_full_description || ""}
                    onChange={(e) => handleInputChange("android_full_description", e.target.value)}
                    placeholder="Max 4,000 characters"
                    rows={8}
                    maxLength={4000}
                  />
                  {getCharCount(appData.android_full_description, 4000)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="android_promo_text">Promotional Text</Label>
                  <Textarea
                    id="android_promo_text"
                    value={appData.android_promo_text || ""}
                    onChange={(e) => handleInputChange("android_promo_text", e.target.value)}
                    placeholder="Optional promotional text"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="android_recent_changes">Recent Changes</Label>
                  <Textarea
                    id="android_recent_changes"
                    value={appData.android_recent_changes || ""}
                    onChange={(e) => handleInputChange("android_recent_changes", e.target.value)}
                    placeholder="What's new in this version"
                    rows={4}
                  />
                </div>

                {appData.has_in_app_purchases && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="android_in_app_products">Android In-App Products</Label>
                    <Textarea
                      id="android_in_app_products"
                      value={appData.android_in_app_products || ""}
                      onChange={(e) => handleInputChange("android_in_app_products", e.target.value)}
                      placeholder="List of Android in-app products (e.g., Premium Subscription - $9.99/month, Remove Ads - $4.99, Extra Coins Pack - $2.99)"
                      rows={4}
                    />
                    <p className="text-xs text-slate-500">List all in-app products available on Android</p>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t">
                  <ScreenshotManager
                    appId={appId}
                    platform="android"
                    screenshots={androidScreenshots}
                    onScreenshotsChange={setAndroidScreenshots}
                    onSave={async (screenshot) => {
                      const result = await saveScreenshot(
                        screenshot.app_data_id,
                        screenshot.platform as "ios" | "android",
                        screenshot.device_type as "iphone" | "ipad" | "android_phone" | "android_tablet",
                        screenshot.image_url,
                        screenshot.sort_order
                      )
                      return result
                    }}
                    onDelete={async (id) => {
                      return await deleteScreenshot(id)
                    }}
                    onUpdateOrder={async (id, sortOrder) => {
                      return await updateScreenshotOrder(id, sortOrder)
                    }}
                    onReload={async () => {
                      if (appId) {
                        const android = await getScreenshots(appId, "android")
                        setAndroidScreenshots(android)
                      }
                    }}
                  />

                  <div className="space-y-2">
                    <Label>Android Feature Graphic</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            // In production, upload to Supabase Storage
                            console.log("Feature graphic uploaded:", file.name)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">1024x500px recommended</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Android Preview Videos</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || [])
                        if (!appId) {
                          toast({
                            title: "Action Required",
                            description: "Please save the app data first before uploading videos",
                            variant: "destructive",
                          })
                          return
                        }
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i]
                          // Generate thumbnail
                          const video = document.createElement("video")
                          const canvas = document.createElement("canvas")
                          const ctx = canvas.getContext("2d")
                          video.src = URL.createObjectURL(file)
                          video.currentTime = 1
                          video.onloadeddata = async () => {
                            canvas.width = video.videoWidth
                            canvas.height = video.videoHeight
                            ctx?.drawImage(video, 0, 0)
                            const thumbnailUrl = canvas.toDataURL("image/jpeg")
                            
                            const reader = new FileReader()
                            reader.onloadend = async () => {
                              const videoUrl = reader.result as string
                              const result = await savePreviewVideo(appId, "android", videoUrl, thumbnailUrl, i)
                              if (result.success) {
                                console.log("Preview video saved:", file.name)
                                window.location.reload()
                              } else {
                                console.error("Error saving video:", result.error)
                              }
                            }
                            reader.readAsDataURL(file)
                            URL.revokeObjectURL(video.src)
                          }
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">Upload preview videos for Google Play. Thumbnail will be auto-generated.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creative" className="space-y-6">
            {/* Overview & Context */}
            <Card>
              <CardHeader>
                <CardTitle>Overview & Context</CardTitle>
                <CardDescription>Store page type, target market, and primary objective</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creative_brief_store_page_type">Store Page Type</Label>
                    <Select
                      value={appData.creative_brief_store_page_type || ""}
                      onValueChange={(value) => handleInputChange("creative_brief_store_page_type", value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpp">CPP (Custom Product Page)</SelectItem>
                        <SelectItem value="csl">CSL (Creative Set)</SelectItem>
                        <SelectItem value="default">Default Store Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creative_brief_target_market">Target Market</Label>
                    <Input
                      id="creative_brief_target_market"
                      value={appData.creative_brief_target_market || ""}
                      onChange={(e) => handleInputChange("creative_brief_target_market", e.target.value)}
                      placeholder="e.g., UK, US, UK & US"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creative_brief_primary_platform">Primary Platform</Label>
                    <Select
                      value={appData.creative_brief_primary_platform || ""}
                      onValueChange={(value) => handleInputChange("creative_brief_primary_platform", value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ios">iOS</SelectItem>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_objective">Objective</Label>
                  <Textarea
                    id="creative_brief_objective"
                    value={appData.creative_brief_objective || ""}
                    onChange={(e) => handleInputChange("creative_brief_objective", e.target.value)}
                    placeholder="Define the goal: e.g., 'Increase conversion (CVR) of users searching for specific keywords, highlighting a clear and differentiated fantasy'"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Creative Strategy */}
            <Card>
              <CardHeader>
                <CardTitle>Creative Strategy</CardTitle>
                <CardDescription>Core concept, key message, and target audience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_creative_concept">Creative Concept (Core Message)</Label>
                  <Textarea
                    id="creative_brief_creative_concept"
                    value={appData.creative_brief_creative_concept || ""}
                    onChange={(e) => handleInputChange("creative_brief_creative_concept", e.target.value)}
                    placeholder="e.g., 'Unlock Your Fortune' - The central creative concept that drives all communication"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_key_message">Key Message</Label>
                  <Textarea
                    id="creative_brief_key_message"
                    value={appData.creative_brief_key_message || ""}
                    onChange={(e) => handleInputChange("creative_brief_key_message", e.target.value)}
                    placeholder="What's the main message you want to communicate?"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_target_audience">Target Audience</Label>
                  <Textarea
                    id="creative_brief_target_audience"
                    value={appData.creative_brief_target_audience || ""}
                    onChange={(e) => handleInputChange("creative_brief_target_audience", e.target.value)}
                    placeholder="Describe your target users: demographics, behaviours, pain points..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visual Direction */}
            <Card>
              <CardHeader>
                <CardTitle>Visual Direction</CardTitle>
                <CardDescription>Visual style, brand guidelines, and design principles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_visual_style">Visual Style</Label>
                  <Textarea
                    id="creative_brief_visual_style"
                    value={appData.creative_brief_visual_style || ""}
                    onChange={(e) => handleInputChange("creative_brief_visual_style", e.target.value)}
                    placeholder="Describe the visual style, colour palette, typography, design principles..."
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_brand_guidelines">Brand Guidelines</Label>
                  <Textarea
                    id="creative_brief_brand_guidelines"
                    value={appData.creative_brief_brand_guidelines || ""}
                    onChange={(e) => handleInputChange("creative_brief_brand_guidelines", e.target.value)}
                    placeholder="Brand voice, tone, dos and don'ts..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <VisualReferencesUpload
                    images={Array.isArray(appData.creative_brief_visual_references) ? appData.creative_brief_visual_references : []}
                    onImagesChange={(images) => handleInputChange("creative_brief_visual_references", images as any)}
                    maxImages={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Screenshot Messaging */}
            <Card>
              <CardHeader>
                <CardTitle>Screenshot Messaging</CardTitle>
                <CardDescription>Taglines and messages for each screenshot position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_screenshot_1_message">Screenshot 1 - Hook (Most Important)</Label>
                  <Textarea
                    id="creative_brief_screenshot_1_message"
                    value={appData.creative_brief_screenshot_1_message || ""}
                    onChange={(e) => handleInputChange("creative_brief_screenshot_1_message", e.target.value)}
                    placeholder="e.g., 'Unlock Your Fortune' - The hook that activates curiosity"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_screenshot_2_message">Screenshot 2 - Gameplay</Label>
                  <Textarea
                    id="creative_brief_screenshot_2_message"
                    value={appData.creative_brief_screenshot_2_message || ""}
                    onChange={(e) => handleInputChange("creative_brief_screenshot_2_message", e.target.value)}
                    placeholder="e.g., 'Epic Slot Games Inspired by Ancient Fortune'"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_screenshot_3_message">Screenshot 3 - Value Proposition</Label>
                  <Textarea
                    id="creative_brief_screenshot_3_message"
                    value={appData.creative_brief_screenshot_3_message || ""}
                    onChange={(e) => handleInputChange("creative_brief_screenshot_3_message", e.target.value)}
                    placeholder="e.g., 'Big Jackpots. Daily Rewards.'"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_screenshot_4_message">Screenshot 4 - Social Proof</Label>
                  <Textarea
                    id="creative_brief_screenshot_4_message"
                    value={appData.creative_brief_screenshot_4_message || ""}
                    onChange={(e) => handleInputChange("creative_brief_screenshot_4_message", e.target.value)}
                    placeholder="e.g., 'Play Anytime. Just for Fun.'"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_screenshot_5_message">Screenshot 5 - CTA</Label>
                  <Textarea
                    id="creative_brief_screenshot_5_message"
                    value={appData.creative_brief_screenshot_5_message || ""}
                    onChange={(e) => handleInputChange("creative_brief_screenshot_5_message", e.target.value)}
                    placeholder="e.g., 'Start Spinning Today'"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform & ASA Strategy */}
            <Card>
              <CardHeader>
                <CardTitle>Platform & ASA Strategy</CardTitle>
                <CardDescription>Platform considerations, ASA strategy, and competitor analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creative_brief_platform_considerations">Platform-Specific Considerations</Label>
                  <Textarea
                    id="creative_brief_platform_considerations"
                    value={appData.creative_brief_platform_considerations || ""}
                    onChange={(e) => handleInputChange("creative_brief_platform_considerations", e.target.value)}
                    placeholder="iOS/Android specific considerations, compliance notes, disclaimers..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apple Search Ads (ASA) Strategy</Label>
                  <div className="border rounded-lg bg-white">
                    <AppleSearchAdsConfig
                      keywordGroups={Array.isArray(appData.creative_brief_asa_keyword_groups) ? appData.creative_brief_asa_keyword_groups : []}
                      onKeywordGroupsChange={(groups) => handleInputChange("creative_brief_asa_keyword_groups", groups as any)}
                      editable={true}
                      defaultCPPId="CPP-001"
                    />
                  </div>
                  {appData.creative_brief_asa_strategy && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="creative_brief_asa_strategy_notes">Additional Notes</Label>
                      <Textarea
                        id="creative_brief_asa_strategy_notes"
                        value={appData.creative_brief_asa_strategy || ""}
                        onChange={(e) => handleInputChange("creative_brief_asa_strategy", e.target.value)}
                        placeholder="Additional strategic notes, rationale, or considerations..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Competitor Analysis</Label>
                  <div className="border rounded-lg bg-white p-4">
                    <CompetitorAnalysisManager
                      competitors={Array.isArray(appData.creative_brief_competitor_analysis) ? appData.creative_brief_competitor_analysis : []}
                      onChange={(competitors) => handleInputChange("creative_brief_competitor_analysis", competitors as any)}
                      editable={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Keyword Research</CardTitle>
                    <CardDescription>Manage and optimize keywords for App Store and Google Play Store</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleClearSection("keywords")} className="gap-2 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Clear Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <KeywordManager appId={appId} initialKeywords={keywords} appName={appData.app_name} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={showNewAppDialog}
        onOpenChange={setShowNewAppDialog}
        onConfirm={confirmCreateNewApp}
        title="Create New App"
        description="Are you sure you want to create a new app? This will clear the current form and all unsaved changes will be lost."
        confirmText="Create New App"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={showClearAllDialog}
        onOpenChange={setShowClearAllDialog}
        onConfirm={confirmClearAll}
        title="Clear All Sections"
        description="Are you sure you want to clear ALL fields from ALL sections? This action cannot be undone and will remove all data including screenshots and keywords."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        open={showClearSectionDialog}
        onOpenChange={setShowClearSectionDialog}
        onConfirm={confirmClearSection}
        title={`Clear ${sectionToClear === "general" ? "General" : sectionToClear === "ios" ? "iOS App Store" : sectionToClear === "android" ? "Google Play" : sectionToClear === "creative" ? "Creative Brief" : sectionToClear === "keywords" ? "Keyword Research" : ""} Section`}
        description={`Are you sure you want to clear all fields in the ${sectionToClear === "general" ? "General" : sectionToClear === "ios" ? "iOS App Store" : sectionToClear === "android" ? "Google Play" : sectionToClear === "creative" ? "Creative Brief" : sectionToClear === "keywords" ? "Keyword Research" : ""} section? ${(sectionToClear === "ios" || sectionToClear === "android") ? "This will also remove all screenshots." : sectionToClear === "keywords" ? `This will delete all ${keywords.length} keyword(s).` : ""} This action cannot be undone.`}
        confirmText="Clear Section"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
