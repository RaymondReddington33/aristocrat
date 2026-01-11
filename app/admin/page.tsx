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
import { getLatestAppData, getAllApps, getAppData, saveAppData, saveScreenshot, savePreviewVideo, getScreenshots, deleteScreenshot, updateScreenshotOrder, getKeywords, bulkDeleteKeywords, bulkSaveKeywords, deleteApp } from "@/app/actions"
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
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const loadExistingData = useCallback(async () => {
    // Prevent loading multiple times
    if (hasLoadedInitialData) {
      console.log("[loadExistingData] Already loaded, skipping...")
      return
    }
    
    setIsLoading(true)
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
      
      setHasLoadedInitialData(true)
    } catch (error) {
      console.error("[loadExistingData] Error loading existing data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [hasLoadedInitialData])

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
        console.log("[checkRole] User:", user?.email, "Role from server:", role)
        const effectiveRole = typeof window !== "undefined" ? getEffectiveRole(user?.email) : role
        console.log("[checkRole] Effective role:", effectiveRole, "canEdit:", canEdit(effectiveRole))
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

  // Auto-save DISABLED - use manual save button instead
  // This was causing issues with data disappearing
  /*
  useEffect(() => {
    if (!appData.app_name || appData.app_name.trim() === "") return
    if (saving) return
    
    const timeoutId = setTimeout(async () => {
      setSaving(true)
      try {
        const result = await saveAppData(appData, appId)
        if (result.success) {
          if (!appId && result.id) {
            setAppId(result.id)
            loadApps()
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
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [appData, appId, loadApps, saving])
  */

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

    // Read file as base64 and save immediately
    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageData = reader.result as string
      
      // Update local state
      const newAppData = { ...appData, [field]: imageData }
      setAppData(newAppData)
      
      // Save immediately to database
      setSaving(true)
      try {
        const result = await saveAppData(newAppData, appId)
        if (result.success) {
          if (!appId && result.id) {
            setAppId(result.id)
          }
          setLastSaved(new Date())
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
          
          // Refresh apps list to update navbar icon
          await loadApps()
          
          // Notify other components about the change
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("appChanged", { detail: { appId: appId || result.id } }))
          }
          
          toast({
            title: "Image saved",
            description: "The image has been uploaded and saved successfully.",
          })
        }
      } catch (error) {
        console.error("Error saving image:", error)
        toast({
          title: "Error",
          description: "Failed to save image",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
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
            
            // Save demo keywords
            console.log("[confirmCleanupAndLoadDemo] Saving demo keywords...")
            const demoKeywords = getDemoKeywords(saveResult.id)
            const keywordsResult = await bulkSaveKeywords(demoKeywords)
            if (keywordsResult.success) {
              console.log("[confirmCleanupAndLoadDemo] Saved", keywordsResult.count, "keywords")
              // Load keywords from database
              const loadedKeywords = await getKeywords(saveResult.id)
              setKeywords(loadedKeywords)
            } else {
              console.error("[confirmCleanupAndLoadDemo] Failed to save keywords:", keywordsResult.error)
              setKeywords([])
            }
            
            // Set the loaded app data and ID
            setAppData(loadedData)
            setAppId(loadedData.id)
            setLastSaved(new Date(loadedData.updated_at || new Date()))
            console.log("[confirmCleanupAndLoadDemo] State updated successfully with keywords")
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

  const getDemoCasinoAppData = (): Partial<AppData> => {
    return {
      // ═══════════════════════════════════════════════════════════════════════════
      // GENERAL APP INFORMATION
      // ═══════════════════════════════════════════════════════════════════════════
      app_name: "RedRain Slots Casino",
      app_subtitle: "Premium Egyptian Slots Adventure",
      category: "Casino",
      price: "Free",
      age_rating: "17+",
      rating: 4.8,
      review_count: 125000,
      download_count: "5M+",
      app_icon_url: "/images/casino-icon.jpg",

      // ═══════════════════════════════════════════════════════════════════════════
      // iOS APP STORE - ASO 2026 OPTIMIZED
      // ═══════════════════════════════════════════════════════════════════════════
      // STRATEGY: Zero keyword repetition between indexable fields
      // Title (30 chars): Brand + core theme - FIRST WORDS WEIGH MORE
      // Subtitle (30 chars): Value proposition - NO repetition from title  
      // Keywords (100 chars): Generic core keywords, NO spaces, NO plurals, NO repetition
      
      ios_app_name: "RedRain: Egyptian Riches Slots", // 30 chars ✅ 100%
      ios_subtitle: "Premium Adventure & Fortune", // 27 chars - Value prop, zero repetition
      ios_description:
        "Embark on an epic slot adventure in Ancient Egypt! Unlock your fortune with premium 3D graphics, epic bonus rounds, and massive jackpots. Enjoy daily free spins, treasure chest levels, and pharaoh-inspired jackpot tables.\n\nRedRain offers a social casino experience without real betting (\"play for fun\"), with millions of free coins to start and achievement rewards. Play now and become a legend among the Egyptian gods!\n\n═══════════════════════════════════════\nKEY FEATURES\n═══════════════════════════════════════\n• Premium Egyptian-Themed Slot Games\n• Massive Jackpots & Daily Rewards\n• Epic Bonus Rounds & Treasure Chests\n• Stunning 3D Graphics & Smooth Gameplay\n• Daily Free Spins & Multipliers\n• Social Casino Fun - Play with Friends\n• No Real Money Required\n\n═══════════════════════════════════════\nWHY PLAYERS LOVE US\n═══════════════════════════════════════\n✓ Premium Quality 3D Graphics\n✓ Generous Daily Bonuses\n✓ Regular New Egyptian Slots\n✓ Smooth Performance on All Devices\n✓ Social Features & Achievements\n✓ Offline Play Available\n\n═══════════════════════════════════════\nCALL TO ACTION\n═══════════════════════════════════════\n\"Unlock Your Fortune\" • \"Spin to Win\" • \"Join the Adventure\"\n\n▼ DISCLAIMER ▼\nFor entertainment purposes only. No real money gambling. In-app purchases available. Must be 17+ to play.",
      ios_promotional_text:
        "🎰 DOUBLE FORTUNE WEEKEND: Get 2x free spins + bonus coins today only!",
      ios_keywords: "pharaoh,cleopatra,fortune,jackpot,treasure,ancient,pyramid,sphinx,legend,reward,wheel,prize,charm", // 97 chars ✅
      ios_whats_new:
        "🆕 Version 3.2.0\n• NEW: Royal Pharaoh's Chamber slot with 50 paylines\n• NEW: Daily Fortune Wheel with bigger rewards\n• IMPROVED: Faster loading times\n• FIXED: Minor bugs and stability improvements\n• BONUS: Special launch rewards for all players!",
      ios_support_url: "https://support.redrain.com",
      ios_marketing_url: "https://redrain.com",
      ios_privacy_url: "https://redrain.com/privacy",

      // ═══════════════════════════════════════════════════════════════════════════
      // GOOGLE PLAY STORE - ASO 2026 OPTIMIZED
      // ═══════════════════════════════════════════════════════════════════════════
      // STRATEGY: Limited repetition (max 2-3x), Short Description is KEY conversion field
      // Title (50 chars): Brand + category - FIRST WORDS WEIGH MORE
      // Short Description (80 chars): KEY CONVERSION FIELD - semantic variations
      // Long Description (4000 chars): Keyword distribution with semantic variations
      
      android_app_name: "RedRain Casino: Fortune Games", // 29 chars
      android_short_description:
        "Premium Egyptian-themed slots with massive rewards – spin legendary reels today!", // 80 chars ✅ 100%
      android_full_description:
        "Discover the wealth of ancient Egypt through premium slot experiences. RedRain Casino delivers thrilling gameplay featuring pharaohs, pyramids, and legendary treasures.\n\n═══════════════════════════════════════\n🎰 EXPERIENCE THE MAGIC OF EGYPT\n═══════════════════════════════════════\nEnjoy daily bonuses, fortune wheels, and epic multipliers without spending real money. This social gaming experience offers premium graphics, mythological characters, and rewarding missions.\n\n═══════════════════════════════════════\n✨ GAME HIGHLIGHTS\n═══════════════════════════════════════\n• Themed Slots (Pharaoh's Fortune, Cleopatra's Eye, Sphinx's Secret)\n• Daily Rewards and Missions that unlock treasure chests\n• Bonus Rounds with Epic Multipliers up to 1000x\n• Social Network Connection to share achievements\n• Regular new content updates\n• Works offline - play anywhere!\n\n═══════════════════════════════════════\n🏆 WHY MILLIONS CHOOSE REDRAIN\n═══════════════════════════════════════\n✓ Premium 3D graphics and animations\n✓ Fair gameplay mechanics\n✓ Generous daily bonuses\n✓ Active community of players\n✓ 24/7 customer support\n\nDownload now and start your journey to fortune!\n\n▼ DISCLAIMER ▼\nFor entertainment purposes only. No real money gambling. In-app purchases available. Must be 17+ to play.",
      android_promo_text:
        "🎁 Double Coins Weekend! Download now for bonus rewards!",
      android_recent_changes:
        "Version 3.2.0:\n• NEW: Royal Pharaoh's Chamber slot\n• NEW: Fortune Wheel with bigger prizes\n• IMPROVED: Performance optimisations\n• FIXED: Bug fixes and stability",

      // ═══════════════════════════════════════════════════════════════════════════
      // CREATIVE BRIEF - COMPLETE MARKETING STRATEGY
      // ═══════════════════════════════════════════════════════════════════════════
      creative_brief_store_page_type: "cpp",
      creative_brief_target_market: "United Kingdom (en-GB)",
      creative_brief_primary_platform: "ios",
      
      creative_brief_objective:
        "BUSINESS OBJECTIVE:\nPosition RedRain as the #1 premium Egyptian-themed social casino in the UK market.\n\nKEY GOALS:\n• Increase organic downloads by 40% in Q1 2026\n• Achieve Top 10 ranking in Casino category\n• Improve conversion rate from impression to install by 25%\n• Reduce CPA (Cost Per Acquisition) to under £2.00\n\nSTRATEGIC APPROACH:\n• Emphasise 'premium' and 'free-to-play' positioning\n• Highlight unique Egyptian narrative vs. generic Vegas competitors\n• Build trust with clear 'no real money gambling' messaging",
      
      creative_brief_creative_concept:
        "CONCEPT: \"Unearth Your Fortune\"\n\nNARRATIVE:\nTransport players to Ancient Egypt where they discover hidden treasures in pharaoh's tombs. Every spin brings them closer to legendary riches.\n\nVISUAL METAPHORS:\n• Pyramids at sunset = mystery and adventure\n• Golden hieroglyphs = wealth and ancient secrets\n• Cleopatra = elegance and luxury\n• Scarab beetles = luck and fortune\n\nEMOTIONAL TRIGGERS:\n• Excitement: \"Massive jackpots await\"\n• Exclusivity: \"Premium Egyptian experience\"\n• Urgency: \"Limited-time bonuses\"\n• Social proof: \"Join millions of players\"\n\nAUDIO DIRECTION:\nModern Egyptian-inspired instrumental music with subtle electronic elements. Satisfying coin sounds and celebratory effects for wins.",
      
      creative_brief_target_audience:
        "PRIMARY AUDIENCE:\n• Age: 25-54\n• Gender: 60% Male, 40% Female\n• Location: United Kingdom (primary), US/CA/AU (secondary)\n• Interests: Social casino games, mythology, puzzle games\n• Behaviour: Plays 15-30 min daily, responds to daily bonuses\n\nSECONDARY AUDIENCE:\n• Mythology enthusiasts (Egyptian, Greek themes)\n• Casual gamers looking for relaxation\n• Previous users of competitor apps\n\nPSYCHOGRAPHICS:\n• Seeks entertainment without financial risk\n• Values premium graphics and smooth gameplay\n• Enjoys collection/achievement mechanics\n• Shares progress on social media",
      
      creative_brief_key_message:
        "HERO MESSAGE:\n\"Unlock Your Fortune – Play Premium Egyptian Slots Today!\"\n\nSUPPORTING MESSAGES:\n• \"Daily Gold Bonuses Await\"\n• \"Spin Legendary Reels for FREE\"\n• \"Join 5 Million Players Worldwide\"\n• \"No Real Money Required\"\n\nCTAs (Call-To-Action):\n• \"Play Now\" - primary\n• \"Join the Adventure\" - engagement\n• \"Claim Your Bonus\" - conversion\n• \"Spin to Win\" - action-oriented\n\nTONE OF VOICE:\n• Exciting but not aggressive\n• Premium but accessible\n• Fun but trustworthy",
      
      creative_brief_visual_style:
        "COLOUR PALETTE:\n• Primary: Gold (#FFD700) - wealth and prestige\n• Secondary: Sapphire Blue (#0F52BA) - trust and luxury\n• Accent: Royal Purple (#6B46C1) - premium quality\n• Neutral: Sand (#C2B280) - Egyptian authenticity\n• Contrast: Black (#000000) - sophistication\n\nIMAGERY STYLE:\n• High-quality 3D renders with golden lighting\n• Night-time pyramid backgrounds with starry skies\n• Elegant Egyptian symbols (ankh, scarab, eye of Horus)\n• Coin explosions and treasure chest animations\n\nGRAPHIC ELEMENTS:\n• Subtle golden gradients and metallic effects\n• Clean iconography with pharaonic elements\n• Luxury-inspired borders and frames\n• Professional typography hierarchy",
      
      creative_brief_brand_guidelines:
        "LOGO USAGE:\n• Primary: Golden logo on dark blue background\n• Secondary: White logo on dark backgrounds\n• Minimum size: 48px height\n• Clear space: 1x logo height on all sides\n\nTYPOGRAPHY:\n• Headlines: Classic Serif (carved stone effect)\n• Body: Modern Sans-Serif (clean, readable)\n• UI: SF Pro (iOS) / Roboto (Android)\n\nDO's:\n✓ Use premium, luxury-focused language\n✓ Include 'For entertainment only' disclaimer\n✓ Showcase actual gameplay screenshots\n✓ Highlight social/free-to-play aspects\n\nDON'Ts:\n✗ Use 'bet', 'gamble', 'earn real money'\n✗ Show misleading win amounts\n✗ Use aggressive or predatory language\n✗ Imply guaranteed winnings",
      
      creative_brief_screenshot_1_message: "🏛️ Epic Egyptian Slots – Unlock Pharaoh's Treasure!",
      creative_brief_screenshot_2_message: "💰 Huge Jackpots & Free Spins Every Day",
      creative_brief_screenshot_3_message: "🎁 Bonus Levels & Legendary Rewards",
      creative_brief_screenshot_4_message: "👥 Play With Friends – Social Casino Fun",
      creative_brief_screenshot_5_message: "⚡ Limited-Time Bonus: Double Coins Weekend!",
      
      creative_brief_platform_considerations:
        "═══════════════════════════════════════\niOS APP STORE GUIDELINES\n═══════════════════════════════════════\n\n✓ REQUIREMENTS:\n• Age rating: 17+ (required for simulated gambling)\n• Privacy policy URL: Must be provided\n• No 'Free' in title/subtitle\n• No real currency symbols in metadata\n• Promotional Text: Use as conversion hook\n\n✗ PROHIBITED:\n• Suggestive or misleading imagery\n• Real money gambling references\n• Guaranteed win claims\n• Under-18 targeting\n\n═══════════════════════════════════════\nGOOGLE PLAY STORE GUIDELINES\n═══════════════════════════════════════\n\n✓ REQUIREMENTS:\n• Content rating: Mature 17+\n• Clear 'simulated gambling' disclosure\n• Accurate screenshots only\n• Privacy policy linked\n\n✗ PROHIBITED:\n• Keyword stuffing (max 2-3 repetitions)\n• Fake reviews or ratings\n• Misleading promotional content\n\n═══════════════════════════════════════\nREQUIRED DISCLAIMER\n═══════════════════════════════════════\n'For entertainment purposes only. No real money gambling. In-app purchases available. Must be 17+ to play.'",
      
      creative_brief_asa_strategy:
        "═══════════════════════════════════════\nAPPLE SEARCH ADS STRATEGY\n═══════════════════════════════════════\n\nCAMPAIGN STRUCTURE:\n\n1️⃣ BRAND CAMPAIGNS\n• Keywords: RedRain, RedRain Slots, RedRain Casino\n• Match Type: Exact\n• Daily Budget: £150\n• Target CPA: £1.50\n• CPP: Enabled (Brand-focused creative)\n\n2️⃣ COMPETITOR CAMPAIGNS\n• Keywords: Royal Spin, Cleopatra Slots, Pharaoh Games\n• Match Type: Exact\n• Daily Budget: £100\n• Target CPA: £2.00\n• CPP: Enabled (Comparison messaging)\n\n3️⃣ GENERIC CAMPAIGNS\n• Keywords: slots free, casino games, jackpot\n• Match Type: Broad\n• Daily Budget: £75\n• Target CPA: £2.50\n• CPP: Disabled (Default page)\n\n4️⃣ DISCOVERY CAMPAIGNS\n• Search Match: Enabled\n• Daily Budget: £50\n• Purpose: Find new keyword opportunities\n\nOPTIMISATION TACTICS:\n• A/B test ad variations weekly\n• Negative keyword list for irrelevant terms\n• Bid adjustments based on device/time\n• CPP relevance matching for top keywords",
      
      creative_brief_cross_locations_strategy:
        "═══════════════════════════════════════\nMULTI-MARKET LOCALISATION STRATEGY\n═══════════════════════════════════════\n\n🇬🇧 UNITED KINGDOM (Primary - 40% budget)\n• Language: British English\n• Currency: £ GBP\n• Focus keywords: fortune, premium, treasure\n• Cultural notes: Avoid 'gambling' terminology\n• Local events: Bank holidays, Royal occasions\n\n🇺🇸 UNITED STATES (Secondary - 30% budget)\n• Language: American English\n• Currency: $ USD\n• Focus keywords: jackpot, casino slots, Vegas\n• Cultural notes: More direct CTAs accepted\n• Local events: July 4th, Thanksgiving, Super Bowl\n\n🇨🇦 CANADA (Tertiary - 15% budget)\n• Language: English (mix UK/US accepted)\n• Currency: $ CAD\n• Notes: Stricter gambling advertising laws\n\n🇦🇺 AUSTRALIA (10% budget)\n• Language: Australian English\n• Currency: $ AUD\n• Notes: Responsible gambling messaging required\n\n🇪🇺 EUROPE (5% budget)\n• Markets: DE, FR, IT, ES\n• Approach: English-first, consider localisation\n\n═══════════════════════════════════════\nCPP (CUSTOM PRODUCT PAGES) STRATEGY\n═══════════════════════════════════════\n• CPP-UK: British English, £ pricing, UK testimonials\n• CPP-US: American English, $ pricing, Vegas references\n• CPP-Generic: Neutral English, universal appeal",
      
      // ASA Keyword Groups (structured campaign data)
      // Note: Competitor keywords have LOW bids - we won't outrank brand owners
      creative_brief_asa_keyword_groups: [
        {
          id: "group-1",
          name: "Branded Keywords",
          keywords: ["RedRain Slots", "RedRain Casino", "RedRain"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-BRAND",
          dailyBudget: 100,
          targetCPA: 0.50,
        },
        {
          id: "group-2",
          name: "Generic High Volume (Priority)",
          keywords: ["slots", "casino slots", "free slots", "slot machines", "casino games"],
          matchType: "broad",
          cppEnabled: true,
          cppId: "CPP-GENERIC",
          dailyBudget: 500,
          targetCPA: 3.50,
        },
        {
          id: "group-3",
          name: "Thematic Egyptian (Niche Advantage)",
          keywords: ["egyptian slots", "pharaoh slots", "cleopatra slots", "pyramid slots", "ancient egypt slots"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-EGYPT",
          dailyBudget: 300,
          targetCPA: 2.00,
        },
        {
          id: "group-4",
          name: "Competitor Discovery (Low Priority)",
          keywords: ["heart of vegas", "cashman casino", "slotomania", "huuuge casino"],
          matchType: "broad",
          cppEnabled: false,
          dailyBudget: 50,
          targetCPA: 5.00,
        },
        {
          id: "group-5",
          name: "Jackpot & Fortune Keywords",
          keywords: ["jackpot slots", "fortune slots", "big win slots", "treasure slots"],
          matchType: "exact",
          cppEnabled: true,
          cppId: "CPP-JACKPOT",
          dailyBudget: 200,
          targetCPA: 2.50,
        },
      ],
      creative_brief_competitor_analysis: [
        {
          id: "comp-1",
          name: "Heart of Vegas",
          appStoreUrl: "https://apps.apple.com/app/heart-of-vegas-casino-slots/id671736279",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.productmadness.hovmobile",
          iconUrl: "",
          strengths: ["Product Madness flagship", "Massive user base (50M+ downloads)", "Authentic Vegas experience", "Strong brand recognition", "Excellent retention mechanics"],
          weaknesses: ["Vegas theme is saturated", "Less thematic differentiation", "Broad positioning"],
          ourAdvantage: "RedRain's focused Egyptian theme provides unique differentiation vs generic Vegas positioning; premium narrative experience",
          keywords: ["heart of vegas", "vegas slots", "casino slots"],
          notes: "Product Madness (Aristocrat) flagship title. Market leader with strong UA spend. Won't compete on brand keywords."
        },
        {
          id: "comp-2",
          name: "Cashman Casino",
          appStoreUrl: "https://apps.apple.com/app/cashman-casino-vegas-slot-game/id872745565",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.productmadness.cashmancasino",
          iconUrl: "",
          strengths: ["Product Madness title", "Strong jackpot mechanics", "Character-driven branding", "Good daily rewards"],
          weaknesses: ["Character (Mr. Cashman) limits thematic flexibility", "Less immersive narrative"],
          ourAdvantage: "Egyptian mythology offers richer storytelling potential vs single character mascot",
          keywords: ["cashman casino", "cashman slots", "free casino games"],
          notes: "Product Madness title. Strong character branding with Mr. Cashman. Focus on jackpot mechanics."
        },
        {
          id: "comp-3",
          name: "Lightning Link Casino",
          appStoreUrl: "https://apps.apple.com/app/lightning-link-casino-slots/id1189484498",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.productmadness.lightninglinkslots",
          iconUrl: "",
          strengths: ["Product Madness/Aristocrat", "Famous land-based brand", "Hold & Spin mechanic recognition", "Cross-platform appeal"],
          weaknesses: ["Appeals mainly to land-based players", "Less casual-friendly"],
          ourAdvantage: "RedRain targets mobile-first casual players; Egyptian theme more universally appealing than technical slot mechanics",
          keywords: ["lightning link", "lightning slots", "hold and spin slots"],
          notes: "Based on Aristocrat's famous land-based slot series. Strong with experienced slot players."
        },
        {
          id: "comp-4",
          name: "Slotomania",
          appStoreUrl: "https://apps.apple.com/app/slotomania-vegas-casino-slots/id284873059",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.playtika.slotomania",
          iconUrl: "",
          strengths: ["Playtika flagship", "Market leader (100M+ downloads)", "Massive UA budget", "Strong social features", "Excellent live ops"],
          weaknesses: ["Vegas-centric limits thematic appeal", "Aggressive monetization perception", "Less immersive storytelling"],
          ourAdvantage: "RedRain offers focused Egyptian narrative vs Slotomania's mini-games approach; premium feel vs casual",
          keywords: ["slotomania", "slot machines", "free slots"],
          notes: "Playtika's flagship. #1 social casino by revenue. Impossible to rank for brand keyword - focus generic instead."
        },
        {
          id: "comp-5",
          name: "Huuuge Casino",
          appStoreUrl: "https://apps.apple.com/app/huuuge-casino-slots-777-games/id582790430",
          playStoreUrl: "https://play.google.com/store/apps/details?id=com.huuuge.casino.slots",
          iconUrl: "",
          strengths: ["Strong social/multiplayer", "Clubs/guilds system", "Good retention mechanics", "Competitive events"],
          weaknesses: ["Social focus may alienate solo players", "Complex for casual users", "Cluttered UI"],
          ourAdvantage: "RedRain's premium Egyptian experience appeals to players seeking immersive solo play and aesthetic quality",
          keywords: ["huuuge casino", "casino games", "slots games"],
          notes: "Huuuge Games' main title. Strong social features with clubs. Focus on competitive multiplayer slots."
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

  // Demo keywords from keyword research - structured for reviewer analysis
  // Note: Competitor keywords are LOW priority (we won't reach top 1 for competitor brands)
  // Focus is on GENERIC high-volume keywords where we can compete
  const getDemoKeywords = (appDataId: string) => {
    return [
      // ═══════════════════════════════════════════════════════════════════════════
      // BRANDED KEYWORDS - Our brand, high priority, easy to rank #1
      // ═══════════════════════════════════════════════════════════════════════════
      { app_data_id: appDataId, keyword: "redrain slots casino", search_volume: 12000, difficulty: 15, relevance_score: 100, category: "branded" as const, priority: "high" as const, platform: "both" as const, recommended_field: "title" as const, brand: true, chance: 98, kei: 800, results: 50, maximum_reach: 12000, sort_order: 0 },
      { app_data_id: appDataId, keyword: "redrain", search_volume: 8500, difficulty: 10, relevance_score: 100, category: "branded" as const, priority: "high" as const, platform: "both" as const, recommended_field: "title" as const, brand: true, chance: 99, kei: 850, results: 30, maximum_reach: 8500, sort_order: 1 },
      { app_data_id: appDataId, keyword: "redrain casino", search_volume: 6500, difficulty: 12, relevance_score: 100, category: "branded" as const, priority: "high" as const, platform: "both" as const, recommended_field: "title" as const, brand: true, chance: 98, kei: 542, results: 40, maximum_reach: 6500, sort_order: 2 },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // GENERIC HIGH-VOLUME KEYWORDS - Main focus, where we can compete
      // ═══════════════════════════════════════════════════════════════════════════
      { app_data_id: appDataId, keyword: "slots", search_volume: 320000, difficulty: 85, relevance_score: 95, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 35, kei: 3765, results: 5000000, maximum_reach: 320000, sort_order: 3 },
      { app_data_id: appDataId, keyword: "casino slots", search_volume: 150000, difficulty: 78, relevance_score: 96, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "subtitle" as const, brand: false, chance: 42, kei: 1923, results: 3500000, maximum_reach: 150000, sort_order: 4 },
      { app_data_id: appDataId, keyword: "free slots", search_volume: 180000, difficulty: 72, relevance_score: 97, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 48, kei: 2500, results: 2800000, maximum_reach: 180000, sort_order: 5 },
      { app_data_id: appDataId, keyword: "casino games", search_volume: 280000, difficulty: 80, relevance_score: 92, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 38, kei: 3500, results: 4200000, maximum_reach: 280000, sort_order: 6 },
      { app_data_id: appDataId, keyword: "jackpot slots", search_volume: 95000, difficulty: 68, relevance_score: 94, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 52, kei: 1397, results: 1800000, maximum_reach: 95000, sort_order: 7 },
      { app_data_id: appDataId, keyword: "slot machines", search_volume: 120000, difficulty: 75, relevance_score: 93, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 45, kei: 1600, results: 2200000, maximum_reach: 120000, sort_order: 8 },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // THEMATIC KEYWORDS - Egyptian theme, medium-high priority (niche advantage)
      // ═══════════════════════════════════════════════════════════════════════════
      { app_data_id: appDataId, keyword: "egyptian slots", search_volume: 38000, difficulty: 45, relevance_score: 98, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 72, kei: 844, results: 85000, maximum_reach: 38000, sort_order: 9 },
      { app_data_id: appDataId, keyword: "pharaoh slots", search_volume: 62000, difficulty: 48, relevance_score: 97, category: "generic" as const, priority: "high" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 68, kei: 1292, results: 120000, maximum_reach: 62000, sort_order: 10 },
      { app_data_id: appDataId, keyword: "cleopatra slots", search_volume: 45000, difficulty: 52, relevance_score: 95, category: "generic" as const, priority: "medium" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 58, kei: 865, results: 150000, maximum_reach: 45000, sort_order: 11 },
      { app_data_id: appDataId, keyword: "pyramid slots", search_volume: 28000, difficulty: 40, relevance_score: 94, category: "generic" as const, priority: "medium" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 75, kei: 700, results: 65000, maximum_reach: 28000, sort_order: 12 },
      { app_data_id: appDataId, keyword: "ancient egypt slots", search_volume: 22000, difficulty: 35, relevance_score: 96, category: "generic" as const, priority: "medium" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 78, kei: 629, results: 45000, maximum_reach: 22000, sort_order: 13 },
      { app_data_id: appDataId, keyword: "treasure slots", search_volume: 35000, difficulty: 42, relevance_score: 90, category: "generic" as const, priority: "medium" as const, platform: "both" as const, recommended_field: "keywords" as const, brand: false, chance: 70, kei: 833, results: 95000, maximum_reach: 35000, sort_order: 14 },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // COMPETITOR KEYWORDS - LOW priority (won't reach top 1 for competitor brands)
      // Included for awareness/discovery campaigns only, NOT for organic ranking focus
      // ═══════════════════════════════════════════════════════════════════════════
      { app_data_id: appDataId, keyword: "heart of vegas", search_volume: 450000, difficulty: 95, relevance_score: 75, category: "competitor" as const, priority: "low" as const, platform: "both" as const, recommended_field: "description" as const, brand: false, chance: 5, kei: 4737, results: 800000, maximum_reach: 450000, sort_order: 15 },
      { app_data_id: appDataId, keyword: "cashman casino", search_volume: 320000, difficulty: 92, relevance_score: 72, category: "competitor" as const, priority: "low" as const, platform: "both" as const, recommended_field: "description" as const, brand: false, chance: 8, kei: 3478, results: 650000, maximum_reach: 320000, sort_order: 16 },
      { app_data_id: appDataId, keyword: "lightning link casino", search_volume: 280000, difficulty: 90, relevance_score: 70, category: "competitor" as const, priority: "low" as const, platform: "both" as const, recommended_field: "description" as const, brand: false, chance: 10, kei: 3111, results: 550000, maximum_reach: 280000, sort_order: 17 },
      { app_data_id: appDataId, keyword: "slotomania", search_volume: 520000, difficulty: 98, relevance_score: 68, category: "competitor" as const, priority: "low" as const, platform: "both" as const, recommended_field: "description" as const, brand: false, chance: 3, kei: 5306, results: 1200000, maximum_reach: 520000, sort_order: 18 },
      { app_data_id: appDataId, keyword: "huuuge casino", search_volume: 180000, difficulty: 88, relevance_score: 70, category: "competitor" as const, priority: "low" as const, platform: "both" as const, recommended_field: "description" as const, brand: false, chance: 12, kei: 2045, results: 420000, maximum_reach: 180000, sort_order: 19 },
    ]
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

  // Show loading state while initial data is being fetched
  if (isLoading && !hasLoadedInitialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-slate-600">Loading app data...</p>
        </div>
      </div>
    )
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
            {/* Always show demo button, but New App only for owners */}
            <Button onClick={handleCleanupAndLoadDemo} variant="outline" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
              <Sparkles className="h-4 w-4" />
              Load Perfect ASO Demo
            </Button>
            {!isReadOnly && (
              <Button onClick={handleCreateNewApp} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New App
              </Button>
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
                  <span>Saving...</span>
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
