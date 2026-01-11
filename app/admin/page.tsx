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
import { getLatestAppData, getAllApps, getAppData, saveAppData, saveScreenshot, savePreviewVideo, getScreenshots, deleteScreenshot, updateScreenshotOrder, getKeywords, bulkDeleteKeywords, deleteApp } from "@/app/actions"
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
import { KeywordRepetitionAlert } from "@/components/keyword-repetition-alert"
import { getUserWithRole } from "@/app/actions"
import { getUserRole, canEdit, getRoleLabel, getEffectiveRole, type UserRole } from "@/lib/auth"

// Lazy load heavy components
const KeywordManager = dynamic(() => import("@/components/keyword-manager").then(mod => ({ default: mod.KeywordManager })), {
      loading: () => <div className="text-center p-8">Loading keyword manager...</div>,
      ssr: false
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
  const [showDeleteAppDialog, setShowDeleteAppDialog] = useState(false)
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)
  const [sectionToClear, setSectionToClear] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const loadExistingData = useCallback(async () => {
    try {
      console.log("[loadExistingData] Starting to load data...")
      
      // Check localStorage for selected app first
      let appIdToLoad: string | null = null
      if (typeof window !== "undefined") {
        const savedAppId = localStorage.getItem("selectedAppId")
        console.log("[loadExistingData] localStorage savedAppId:", savedAppId)
        if (savedAppId) {
          appIdToLoad = savedAppId
        }
      }

      let data = null
      
      // Try to load the selected app from localStorage
      if (appIdToLoad) {
        console.log("[loadExistingData] Trying to load app with ID:", appIdToLoad)
        data = await getAppData(appIdToLoad)
        console.log("[loadExistingData] Result from getAppData:", data ? `Found: ${data.app_name}` : "Not found")
        
        // If the saved app doesn't exist anymore, clear localStorage and try latest
        if (!data) {
          console.log("[loadExistingData] Saved app ID not found, clearing localStorage and loading latest")
          if (typeof window !== "undefined") {
            localStorage.removeItem("selectedAppId")
          }
          data = await getLatestAppData()
          console.log("[loadExistingData] Latest app data:", data ? `Found: ${data.app_name}` : "No apps in DB")
        }
      } else {
        // No saved ID, load latest app
        console.log("[loadExistingData] No saved ID, loading latest app")
        data = await getLatestAppData()
        console.log("[loadExistingData] Latest app data:", data ? `Found: ${data.app_name}` : "No apps in DB")
      }

      if (data) {
        console.log("[loadExistingData] Setting app data:", data.app_name, "ID:", data.id)
        setAppData(data)
        setAppId(data.id || null)
        if (data.updated_at) {
          setLastSaved(new Date(data.updated_at))
        }
        
        // Save this app ID to localStorage for future loads
        if (data.id && typeof window !== "undefined") {
          localStorage.setItem("selectedAppId", data.id)
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
      } else {
        // No apps exist at all - reset to empty state
        console.log("[loadExistingData] No apps found in database - resetting to empty state")
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedAppId")
        }
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
      }
    } catch (error) {
      console.error("[loadExistingData] Error loading existing data:", error)
    }
  }, [])

  const handleCreateNewApp = () => {
    setShowNewAppDialog(true)
  }

  const confirmCreateNewApp = () => {
    // Clear localStorage when creating a new app
    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedAppId")
    }
    
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
      
      // Sync with navbar by updating cookie and localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedAppId", selectedAppId)
        document.cookie = `selectedAppId=${selectedAppId}; path=/; max-age=31536000` // 1 year
        // Dispatch custom event to notify navbar and other components
        window.dispatchEvent(new CustomEvent("appChanged", { detail: { appId: selectedAppId } }))
      }
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
    
    // Don't auto-save if we're currently saving (to avoid conflicts)
    if (saving) return
    
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
  }, [appData, appId, loadApps, saving])

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

  const handleCleanupAndLoadDemo = async () => {
    setShowCleanupDialog(true)
  }

  const confirmCleanupAndLoadDemo = async () => {
    try {
      console.log("[confirmCleanupAndLoadDemo] Starting cleanup...")
      
      // Delete all existing apps
      const response = await fetch("/api/admin/cleanup-apps", {
        method: "POST",
      })

      const result = await response.json()
      console.log("[confirmCleanupAndLoadDemo] Cleanup result:", result)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to cleanup apps",
          variant: "destructive",
        })
        setShowCleanupDialog(false)
        return
      }

      // Clear localStorage immediately after cleanup
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedAppId")
        console.log("[confirmCleanupAndLoadDemo] Cleared localStorage")
      }

      // Load perfect demo data
      const demoData = getDemoCasinoAppData()
      console.log("[confirmCleanupAndLoadDemo] Demo data prepared:", demoData.app_name)
      
      // Save immediately to database
      setSaving(true)
      try {
        console.log("[confirmCleanupAndLoadDemo] Saving to database...")
        const saveResult = await saveAppData(demoData, null)
        console.log("[confirmCleanupAndLoadDemo] Save result:", saveResult)
        
        if (saveResult.success && saveResult.id) {
          console.log("[confirmCleanupAndLoadDemo] Saved with ID:", saveResult.id)
          
          // Set localStorage to the new app ID
          if (typeof window !== "undefined") {
            localStorage.setItem("selectedAppId", saveResult.id)
            console.log("[confirmCleanupAndLoadDemo] Set localStorage to:", saveResult.id)
          }
          
          // Refresh apps list first
          await loadApps()
          console.log("[confirmCleanupAndLoadDemo] Apps list refreshed")
          
          // Load the newly created app data from database to ensure everything is in sync
          const loadedData = await getAppData(saveResult.id)
          console.log("[confirmCleanupAndLoadDemo] Loaded data from DB:", loadedData ? loadedData.app_name : "NULL")
          
          if (loadedData) {
            // Reset state
            setIosScreenshots([])
            setAndroidScreenshots([])
            setKeywords([])
            
            // Set the loaded app data and ID
            setAppData(loadedData)
            setAppId(loadedData.id)
            setLastSaved(new Date(loadedData.updated_at || new Date()))
            console.log("[confirmCleanupAndLoadDemo] State updated successfully")
          } else {
            // Fallback if loading fails
            console.log("[confirmCleanupAndLoadDemo] Fallback: using local demo data")
            setAppData(demoData)
            setAppId(saveResult.id)
            setLastSaved(new Date())
          }
          
          toast({
            title: "Success",
            description: "Perfect ASO demo data loaded and saved successfully",
          })
        } else {
          toast({
            title: "Error",
            description: saveResult.error || "Failed to save demo data",
            variant: "destructive",
          })
        }
      } catch (saveError) {
        console.error("Error saving demo data:", saveError)
        toast({
          title: "Error",
          description: "Failed to save demo data",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
      
      setShowCleanupDialog(false)
    } catch (error) {
      console.error("Error cleaning up apps:", error)
      toast({
        title: "Error",
        description: "Failed to cleanup apps",
        variant: "destructive",
      })
      setShowCleanupDialog(false)
    }
  }

  const getDemoCasinoAppData = () => {
    return {
      app_name: "RedRain Slots Casino",
      app_subtitle: "Premium Egyptian Slots Adventure",
      category: "Casino",
      price: "Free",
      age_rating: "17+",
      rating: 4.8,
      review_count: 10000,
      download_count: "1M+",
      app_icon_url: "/images/casino-icon.jpg",

      // iOS specific - ASO 2026 Advanced: 100% character limit usage, semantic order, zero repetition
      // Title (30 chars): Brand + core theme - FIRST WORDS WEIGH MORE
      // Subtitle (30 chars): Value proposition - NO repetition from title  
      // Keywords (100 chars): Generic core keywords, NO spaces, NO plurals, NO repetition
      ios_app_name: "RedRain: Egyptian Riches Slots", // 30 chars ✅ 100% - Brand first (semantic priority)
      ios_subtitle: "Premium Adventure Games", // 25 chars - Value prop, no repetition
      ios_description:
        "Embark on an epic slot adventure in Ancient Egypt! Unlock your fortune with premium 3D graphics, epic bonus rounds, and massive jackpots. Enjoy daily free spins, treasure chest levels, and pharaoh-inspired jackpot tables. RedRain offers a social casino experience without real betting (\"play for fun\"), with millions of free coins to start and achievement rewards. Play now and become a legend among the Egyptian gods!\n\nKEY FEATURES\n• Premium Egyptian-Themed Slot Games\n• Massive Jackpots & Daily Rewards\n• Epic Bonus Rounds & Treasure Chests\n• Stunning 3D Graphics & Smooth Gameplay\n• Daily Free Spins & Multipliers\n• Social Casino Fun - Play with Friends\n• No Real Money Required\n\nWHY PLAYERS LOVE US\n✓ Premium Quality 3D Graphics\n✓ Generous Daily Bonuses\n✓ Regular New Egyptian Slots\n✓ Smooth Performance\n✓ Social Features & Achievements\n\nCall to Action: \"Unlock Your Fortune\", \"Spin to Win\", \"Join the Adventure\"\n\nFor entertainment purposes only. No real money gambling. In-app purchases available.",
      ios_promotional_text:
        "Double Fortune Weekend: Get double free spins today!",
      ios_keywords: "pharaoh,cleopatra,fortune,jackpot,treasure,ancient,pyramid,sphinx,legend,reward,wheel,prize,charm", // 97 chars (optimized - close to 100%) - Generic core, NO spaces, NO plurals, NO repetition
      ios_whats_new:
        "Discover new Egyptian slots and improvements! Optimised performance, minor bug fixes, and special launch bonuses.",
      ios_support_url: "https://support.redrain.com",
      ios_marketing_url: "https://redrain.com",
      ios_privacy_url: "https://redrain.com/privacy",

      // Android specific - ASO 2026 Advanced: 100% character limit usage, Short Description as key conversion field
      // Title (50 chars): Brand + category - FIRST WORDS WEIGH MORE
      // Short Description (80 chars): KEY CONVERSION FIELD - semantic variations, no exact repetition
      // Long Description (4000 chars): Generic core keywords distributed, semantic variations
      android_app_name: "RedRain Casino: Fortune Games", // 32 chars (optimized semantic order)
      android_short_description:
        "Premium Egyptian-themed slots with massive rewards – spin legendary reels today!", // 80 chars ✅ 100% - KEY CONVERSION FIELD
      android_full_description:
        "Discover the wealth of ancient Egypt through premium slot experiences. RedRain Casino delivers thrilling gameplay featuring pharaohs, pyramids, and legendary treasures. Enjoy daily bonuses, fortune wheels, and epic multipliers without spending real money. This social gaming experience offers premium graphics, mythological characters, and rewarding missions.\n\nHIGHLIGHTS:\n• Themed Slots (Pharaoh's Fortune, Cleopatra's Eye) with animated scenes\n• Daily Rewards and Missions that unlock treasure chests\n• Bonus Rounds and Epic Multipliers\n• Social Network Connection to share achievements\n\nDownload now and start your journey to fortune!\n\nFor entertainment purposes only. No real money gambling. In-app purchases available.",
      android_promo_text:
        "Double Coins Weekend!",
      android_recent_changes:
        "New 'Royal Pharaoh' slot added, +3 treasure chest levels, improved game balance.",

      // Creative Brief - Task 2 Structure
      creative_brief_store_page_type: "cpp",
      creative_brief_target_market: "United Kingdom (en-GB)",
      creative_brief_primary_platform: "ios",
      creative_brief_objective:
        "Position the app as the most prestigious Egyptian slot machine in the UK market, maximising organic downloads and conversions. Highlight the free-to-play nature (no real betting) and premium quality.",
      creative_brief_creative_concept:
        "Real Adventure in the Pharaoh's Tomb: Combine classic Egyptian symbols and gods with high-quality golden graphics. Use metaphors of hidden treasures (hieroglyphs, pyramids, Cleopatra) to convey that the player 'unearths a fortune'. Employ modern Egyptian-inspired instrumental music.",
      creative_brief_target_audience:
        "Adult players interested in social casino games, lovers of mythology or Egyptian aesthetics, with emphasis on UK (British English). Also capture users of generic slots, highlighting thematic differentiators.",
      creative_brief_key_message:
        "Key Copy: \"Unlock Your Fortune – Play premium Egyptian slots now!\"; \"Daily Gold Bonuses Await\"; \"Spin legendary slots for FREE\". Include clear CTAs like \"Play Now!\", \"Join the Pharaoh's Challenge\", \"Win Big\". Conversion messages (\"unlock\", \"free spins\", \"win big\") create urgency and benefit.",
      creative_brief_visual_style:
        "Sober and luxurious. Main colours: gold, sapphire blue, and royal purple, with accents in sand and black. Illustrations of golden hieroglyphs on a night-time pyramid background. Clean iconography (e.g., stylised roulette with pharaonic crown). Images suggesting wealth and mystery, always within a sober framework.",
      creative_brief_brand_guidelines:
        "Logo: Golden logo on dark blue background. Typography: Classic serif titles (simulating carved stone) combined with modern sans-serif body text. Consistent use of soft shadows and metallic reliefs. Always clarify \"Free to Play, no actual money gambling\" in promotional texts. Avoid language that violates policies (\"bet\", \"earn real money\" are prohibited).",
      creative_brief_screenshot_1_message: "Epic Egyptian Slots – Unlock Pharaoh's Treasure!",
      creative_brief_screenshot_2_message: "Huge Jackpots & Free Spins Every Day",
      creative_brief_screenshot_3_message: "Bonus Levels & Legendary Rewards",
      creative_brief_screenshot_4_message: "Play With Friends – Social Casino Fun",
      creative_brief_screenshot_5_message: "Limited-Time Bonus: Double Coins Weekend!",
      creative_brief_platform_considerations:
        "iOS-Specific Considerations:\n• Respect age limit (17+) indicating \"+17\" in description\n• Do not use suggestive icons or text\n• Do not include \"Free\" or real currency symbols in title/subtitle\n• Promotional Text will appear before images, use as hook\n• Comply with privacy policy by uploading corresponding URL\n\nRecommended Disclaimer Text:\n'For entertainment purposes only. No real money gambling. In-app purchases available.'\n\nKey Compliance Points:\n• Clear 'just for fun' messaging\n• No real money claims\n• Appropriate age rating (17+)\n• Transparent about in-app purchases",
      creative_brief_asa_strategy:
        "Segmentation by groups: Create ad groups by keyword type – (a) Brand (e.g., RedRain, RoyalSpin), (b) Competition (Royal Spin Casino, Cleopatra Slots), (c) Generic terms (slots, jackpot, casino game).\n\nAligned Creativity: Use creatives (images and copies) consistent with Store Page (message \"Unlock Your Fortune\"). Align visual texts with keywords of each ad to improve CTR. For example, \"jackpot\" ads can show a large jackpot cage with corresponding screenshot text.\n\nPPC/Bids: Start with exact match and broad match modifier, moderate bids. Use tools (Search Ads) to exclude irrelevant keywords.\n\nKPIs and Optimisation: Measure TTR (Tap-Through-Rate) and CPT (Cost per Tap), reallocate budget to best-performing ads. Apply best practices: custom product pages (CPP) improve relevance and conversions. Continue adjusting bids based on performance.",
      creative_brief_cross_locations_strategy:
        "Multi-market approach for UK, US, CA, AU, and European markets:\n\n• Primary Market (UK): Focus on \"fortune\", \"premium\", British English spelling\n• US Market: Adapt messaging for \"jackpot\", \"casino slots\", American English\n• Localization Strategy: Core creative remains consistent (Egyptian theme), but adapt:\n  - Currency symbols (£ for UK, $ for US)\n  - Cultural references (adjust timing for regional events)\n  - Language variants (en-GB vs en-US)\n• Budget Allocation: 40% UK, 30% US, 15% CA, 10% AU, 5% Europe\n• CPP Strategy: Create market-specific Custom Product Pages for top 3 markets (UK, US, CA)\n• Performance Monitoring: Track market-specific KPIs and adjust budget based on ROI per location",
      
      // ASA Keyword Groups (structured campaign data)
      creative_brief_asa_keyword_groups: [
        {
          id: "group-1",
          name: "Branded Keywords",
          keywords: ["RedRain Slots Casino", "RedRain Casino"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-001",
          dailyBudget: 150,
          targetCPA: 1.5,
        },
        {
          id: "group-2",
          name: "Competition Keywords",
          keywords: ["Royal Spin Palace", "Cleopatra Slots", "Pharaoh Riches"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-001",
          dailyBudget: 100,
          targetCPA: 2.0,
        },
        {
          id: "group-3",
          name: "Generic High Volume",
          keywords: ["slots free", "casino games", "jackpot slot", "pyramid slots"],
          matchType: "broad",
          cppEnabled: false,
          dailyBudget: 75,
          targetCPA: 2.5,
        },
        {
          id: "group-4",
          name: "Thematic Egyptian",
          keywords: ["Egyptian slots", "ancient treasure slots", "Cleopatra casino"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-001",
          dailyBudget: 80,
          targetCPA: 1.8,
        },
      ],
      creative_brief_competitor_analysis: [
        {
          id: "comp-1",
          name: "Royal Spin Casino",
          appStoreUrl: "https://apps.apple.com/app/royal-spin-casino/id123456789",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.royalspin.casino",
          iconUrl: "",
          strengths: ["Large jackpots", "Established presence", "Good graphics"],
          weaknesses: ["Generic positioning", "No unique theme"],
          ourAdvantage: "All competitors highlight large jackpots; RedRain differentiates with premium aesthetics and unique Egyptian narrative",
          keywords: ["royal spin", "casino slots", "jackpot slots"],
          notes: "All competitors highlight large jackpots; RedRain differentiates with premium aesthetics and unique Egyptian narrative"
        },
        {
          id: "comp-2",
          name: "Pharaoh Slots",
          appStoreUrl: "https://apps.apple.com/app/pharaoh-slots/id123456790",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.pharaoh.slots",
          iconUrl: "",
          strengths: ["Egyptian theme", "Thematic consistency"],
          weaknesses: ["Smaller game library", "Less marketing budget", "Lower production quality"],
          ourAdvantage: "Premium quality, better graphics, more games, stronger brand positioning",
          keywords: ["pharaoh slots", "egyptian slots", "ancient egypt"],
          notes: "Direct competitor with Egyptian theme, but we have premium positioning and better quality"
        },
        {
          id: "comp-3",
          name: "Cleopatra's Fortune",
          appStoreUrl: "https://apps.apple.com/app/cleopatra-fortune/id123456791",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.cleopatra.fortune",
          iconUrl: "",
          strengths: ["Cleopatra theme", "Good visuals"],
          weaknesses: ["Limited game variety", "Generic messaging"],
          ourAdvantage: "More comprehensive Egyptian theme beyond just Cleopatra, premium positioning",
          keywords: ["cleopatra slots", "cleopatra casino", "egyptian fortune"],
          notes: "Good Cleopatra focus but limited to single character theme"
        },
        {
          id: "comp-4",
          name: "Vegas Casino Slots",
          appStoreUrl: "https://apps.apple.com/app/vegas-casino-slots/id123456792",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.vegas.casino.slots",
          iconUrl: "",
          strengths: ["Vegas theme", "Large player base"],
          weaknesses: ["Overused Vegas theme", "No differentiation"],
          ourAdvantage: "Egyptian theme is more unique than generic Vegas, more focused and premium positioning",
          keywords: ["vegas slots", "casino slots", "vegas casino"],
          notes: "Vegas theme is overused; Egyptian theme provides differentiation"
        }
      ],
      
      // Color Palette (structured data)
      creative_brief_color_palette: [
        { name: "Gold", hex: "#FFD700", usage: "Primary luxury colour - wealth and prestige" },
        { name: "Sapphire Blue", hex: "#0F52BA", usage: "Royal blue background - sophistication" },
        { name: "Royal Purple", hex: "#6B46C1", usage: "Secondary brand colour - luxury and premium quality" },
        { name: "Sand", hex: "#C2B280", usage: "Egyptian desert accent - neutral tones" },
        { name: "Black", hex: "#000000", usage: "Text and contrast - sophistication" },
      ],
      
      // Typography System (structured data)
      creative_brief_typography: [
        {
          name: "Headlines & Titles",
          font: "Classic Serif (carved stone style)",
          size: "32px-48px",
          weight: "700",
          example: "Unlock Your Fortune",
        },
        {
          name: "Body Text",
          font: "Modern Sans-Serif",
          size: "16px-18px",
          weight: "400",
          example: "Play premium Egyptian slots now!",
        },
        {
          name: "UI Elements & Labels",
          font: "SF Pro (iOS) / Roboto (Android)",
          size: "14px-16px",
          weight: "500",
          example: "Play Now • Join the Pharaoh's Challenge • Win Big",
        },
      ],

      // In-App Purchases
      has_in_app_purchases: true,
      in_app_purchases_description:
        "RedRain Slots Casino offers a variety of in-app purchases to enhance your gaming experience. From coin packages to VIP membership, unlock exclusive features and maximise your fortune-seeking journey.",
      ios_in_app_purchases:
        "Golden Coin Pack (10k coins) – £1.99\n\nPremium Coin Pack (50k coins) – £4.99\n\nVIP Monthly Membership – £9.99\n• Includes extra daily bonuses\n• Exclusive bonus rounds\n• Priority support\n• Special events access",
      android_in_app_products:
        "Golden Coin Pack (10k coins) – £1.99\n\nPremium Coin Pack (50k coins) – £4.99\n\nVIP Monthly Membership – £9.99\n• Includes extra daily bonuses\n• Exclusive bonus rounds\n• Priority support\n• Special events access",
    }
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
          newData.creative_brief_cross_locations_strategy = ""
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
            {!isReadOnly && (
              <>
                <Button onClick={handleCreateNewApp} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New App
                </Button>
                <Button onClick={handleCleanupAndLoadDemo} variant="outline" className="gap-2 bg-transparent">
                  <Sparkles className="h-4 w-4" />
                  Load Perfect ASO Demo
                </Button>
              </>
            )}
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
            {appId && !isReadOnly && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteAppDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete App
              </Button>
            )}
            {!isReadOnly && (
              <Button variant="outline" onClick={handleClearAll} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
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
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" onClick={() => handleClearSection("general")} className="gap-2 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      Clear Section
                    </Button>
                  )}
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
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" onClick={() => handleClearSection("ios")} className="gap-2 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      Clear Section
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <KeywordRepetitionAlert appData={appData} platform="ios" />
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
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" onClick={() => handleClearSection("android")} className="gap-2 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      Clear Section
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <KeywordRepetitionAlert appData={appData} platform="android" />
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
                  <Label htmlFor="creative_brief_cross_locations_strategy">Cross-Locations Strategy</Label>
                  <Textarea
                    id="creative_brief_cross_locations_strategy"
                    value={appData.creative_brief_cross_locations_strategy || ""}
                    onChange={(e) => handleInputChange("creative_brief_cross_locations_strategy", e.target.value)}
                    placeholder="Strategy for multi-market/cross-location campaigns (e.g., localization approach, market-specific adaptations, budget allocation across regions...)"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500">Define your approach for managing campaigns across multiple markets/locations</p>
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
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" onClick={() => handleClearSection("keywords")} className="gap-2 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      Clear Section
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <KeywordManager appId={appId} initialKeywords={keywords} />
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

      <ConfirmDialog
        open={showCleanupDialog}
        onOpenChange={setShowCleanupDialog}
        onConfirm={confirmCleanupAndLoadDemo}
        title="Cleanup and Load Perfect ASO Demo"
        description="This will DELETE ALL existing apps and load the perfect ASO-optimized RedRain demo data. This action cannot be undone. Continue?"
        confirmText="Yes, Cleanup and Load"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        open={showDeleteAppDialog}
        onOpenChange={setShowDeleteAppDialog}
        title="Delete App"
        description={`Are you sure you want to delete "${appData.app_name || 'this app'}"? This will permanently delete the app and ALL associated data including screenshots, keywords, preview videos, and all other information. This action cannot be undone.`}
        confirmText="Delete App"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!appId) return
          
          try {
            const result = await deleteApp(appId)
            
            if (result.success) {
              toast({
                title: "Success",
                description: "App deleted successfully",
              })
              
              // Reset state
              setAppId(null)
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
              
              // Reload apps list
              await loadApps()
              
              // If there are other apps, load the first one
              const appsList = await getAllApps()
              if (appsList.length > 0) {
                await loadAppData(appsList[0].id)
              }
              
              setShowDeleteAppDialog(false)
            } else {
              toast({
                title: "Error",
                description: result.error || "Failed to delete app",
                variant: "destructive",
              })
            }
          } catch (error) {
            console.error("Error deleting app:", error)
            toast({
              title: "Error",
              description: "An error occurred while deleting the app",
              variant: "destructive",
            })
          }
        }}
      />
    </div>
  )
}
