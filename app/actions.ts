"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { AppData, AppScreenshot, AppPreviewVideo, AppKeyword, ScreenshotMessaging } from "@/lib/types"
import { generateOptimizedKeywordSets } from "@/lib/keyword-optimizer"

export async function getLatestAppData() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error fetching app data:", error)
    return null
  }

  return data
}

export async function getAllApps() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("app_data")
    .select("id, app_name, app_icon_url, created_at, updated_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching apps:", error)
    return []
  }

  return data || []
}

export async function getAppData(appId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("id", appId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching app data:", error)
    return null
  }

  return data
}

export async function saveAppData(appData: Partial<AppData>, appId: string | null) {
  const supabase = await createClient()

  try {
    // Prepare data for Supabase, ensuring JSONB fields are properly formatted
    const dataToSave = { ...appData }
    
    // Ensure JSONB fields are properly formatted (Supabase handles arrays/objects automatically)
    if (dataToSave.creative_brief_visual_references && Array.isArray(dataToSave.creative_brief_visual_references)) {
      // Supabase will automatically convert arrays to JSONB
    }
    if (dataToSave.creative_brief_color_palette && Array.isArray(dataToSave.creative_brief_color_palette)) {
      // Supabase will automatically convert arrays to JSONB
    }
    if (dataToSave.creative_brief_typography && Array.isArray(dataToSave.creative_brief_typography)) {
      // Supabase will automatically convert arrays to JSONB
    }
    if (dataToSave.creative_brief_asa_keyword_groups && Array.isArray(dataToSave.creative_brief_asa_keyword_groups)) {
      // Supabase will automatically convert arrays to JSONB
    }
    if (dataToSave.creative_brief_competitor_analysis && Array.isArray(dataToSave.creative_brief_competitor_analysis)) {
      // Supabase will automatically convert arrays to JSONB
    }

    if (appId) {
      // Update existing
      const { error } = await supabase
        .from("app_data")
        .update({ ...dataToSave, updated_at: new Date().toISOString() })
        .eq("id", appId)

      if (error) throw error

      revalidatePath("/admin")
      revalidatePath("/preview")

      return { success: true, id: appId }
    } else {
      // Create new
      const { data, error } = await supabase.from("app_data").insert([dataToSave]).select().single()

      if (error) throw error

      revalidatePath("/admin")
      revalidatePath("/preview")

      return { success: true, id: data.id }
    }
  } catch (error) {
    console.error("Error saving data:", error)
    return { success: false, error: String(error) }
  }
}

export async function saveScreenshot(
  appDataId: string,
  platform: "ios" | "android",
  deviceType: "iphone" | "ipad" | "android_phone" | "android_tablet",
  imageUrl: string,
  sortOrder: number = 0
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("app_screenshots")
      .insert([
        {
          app_data_id: appDataId,
          platform,
          device_type: deviceType,
          image_url: imageUrl,
          sort_order: sortOrder,
        },
      ])
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error saving screenshot:", error)
    return { success: false, error: String(error) }
  }
}

export async function savePreviewVideo(
  appDataId: string,
  platform: "ios" | "android",
  videoUrl: string,
  thumbnailUrl?: string,
  sortOrder: number = 0
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("app_preview_videos")
      .insert([
        {
          app_data_id: appDataId,
          platform,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          sort_order: sortOrder,
        },
      ])
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error saving preview video:", error)
    return { success: false, error: String(error) }
  }
}

export async function getScreenshots(appDataId: string, platform: "ios" | "android") {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("app_screenshots")
    .select("*")
    .eq("app_data_id", appDataId)
    .eq("platform", platform)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching screenshots:", error)
    return []
  }

  return (data || []) as AppScreenshot[]
}

export async function getPreviewVideos(appDataId: string, platform: "ios" | "android") {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("app_preview_videos")
    .select("*")
    .eq("app_data_id", appDataId)
    .eq("platform", platform)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching preview videos:", error)
    return []
  }

  return (data || []) as AppPreviewVideo[]
}

export async function deleteScreenshot(screenshotId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("app_screenshots").delete().eq("id", screenshotId)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true }
  } catch (error) {
    console.error("Error deleting screenshot:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateScreenshotOrder(screenshotId: string, sortOrder: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("app_screenshots")
      .update({ sort_order: sortOrder })
      .eq("id", screenshotId)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true }
  } catch (error) {
    console.error("Error updating screenshot order:", error)
    return { success: false, error: String(error) }
  }
}

export async function getKeywords(
  appDataId: string,
  filters?: {
    platform?: "ios" | "android" | "both"
    category?: "branded" | "generic" | "competitor"
    priority?: "high" | "medium" | "low"
    recommended_field?: "title" | "subtitle" | "keywords" | "description"
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from("app_keywords")
    .select("*")
    .eq("app_data_id", appDataId)
    .order("sort_order", { ascending: true })

  if (filters?.platform) {
    query = query.or(`platform.eq.${filters.platform},platform.eq.both`)
  }

  if (filters?.category) {
    query = query.eq("category", filters.category)
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority)
  }

  if (filters?.recommended_field) {
    query = query.eq("recommended_field", filters.recommended_field)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching keywords:", error)
    return []
  }

  return (data || []) as AppKeyword[]
}

export async function saveKeyword(keyword: Partial<AppKeyword> & { app_data_id: string }) {
  const supabase = await createClient()

  try {
    if (keyword.id) {
      // Update existing
      const { error } = await supabase
        .from("app_keywords")
        .update({
          keyword: keyword.keyword,
          search_volume: keyword.search_volume,
          difficulty: keyword.difficulty,
          relevance_score: keyword.relevance_score,
          category: keyword.category,
          priority: keyword.priority,
          platform: keyword.platform,
          recommended_field: keyword.recommended_field,
          brand: keyword.brand ?? null,
          chance: keyword.chance ?? null,
          kei: keyword.kei ?? null,
          results: keyword.results ?? null,
          growth_yesterday: keyword.growth_yesterday ?? null,
          monthly_downloads: keyword.monthly_downloads ?? null,
          maximum_reach: keyword.maximum_reach ?? null,
          conversion_rate: keyword.conversion_rate ?? null,
          sort_order: keyword.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", keyword.id)

      if (error) throw error

      revalidatePath("/admin")
      revalidatePath("/preview")

      return { success: true, id: keyword.id }
    } else {
      // Create new
      const { data, error } = await supabase
        .from("app_keywords")
        .insert([
          {
            app_data_id: keyword.app_data_id,
            keyword: keyword.keyword,
            search_volume: keyword.search_volume || 0,
            difficulty: keyword.difficulty || 0,
            relevance_score: keyword.relevance_score || 0,
            category: keyword.category || "generic",
            priority: keyword.priority || "medium",
            platform: keyword.platform || "both",
            recommended_field: keyword.recommended_field,
            brand: keyword.brand ?? false,
            chance: keyword.chance ?? null,
            kei: keyword.kei ?? null,
            results: keyword.results ?? null,
            growth_yesterday: keyword.growth_yesterday ?? null,
            monthly_downloads: keyword.monthly_downloads ?? null,
            maximum_reach: keyword.maximum_reach ?? null,
            conversion_rate: keyword.conversion_rate ?? null,
            sort_order: keyword.sort_order || 0,
          },
        ])
        .select()
        .single()

      if (error) throw error

      revalidatePath("/admin")
      revalidatePath("/preview")

      return { success: true, id: data.id }
    }
  } catch (error) {
    console.error("Error saving keyword:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteKeyword(keywordId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("app_keywords").delete().eq("id", keywordId)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true }
  } catch (error) {
    console.error("Error deleting keyword:", error)
    return { success: false, error: String(error) }
  }
}

export async function bulkDeleteKeywords(keywordIds: string[]) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("app_keywords").delete().in("id", keywordIds)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true, count: keywordIds.length }
  } catch (error) {
    console.error("Error deleting keywords:", error)
    return { success: false, error: String(error) }
  }
}

export async function bulkImportKeywords(keywords: Omit<AppKeyword, "id" | "created_at" | "updated_at">[]) {
  const supabase = await createClient()

  try {
    // Validate that all keywords have required fields
    const validKeywords = keywords.filter(
      (k) => k.app_data_id && k.keyword && k.category && k.priority && k.platform !== undefined
    )

    if (validKeywords.length === 0) {
      return { success: false, error: "No valid keywords to import" }
    }

    // Ensure numeric fields are properly formatted
    const formattedKeywords = validKeywords.map((k) => ({
      app_data_id: k.app_data_id,
      keyword: k.keyword.trim(),
      search_volume: Number(k.search_volume) || 0,
      difficulty: Number(k.difficulty) || 0,
      relevance_score: Number(k.relevance_score) || 0,
      category: k.category,
      priority: k.priority,
      platform: k.platform,
      recommended_field: k.recommended_field || null,
      brand: k.brand ?? false,
      chance: k.chance !== undefined ? Number(k.chance) : null,
      kei: k.kei !== undefined ? Number(k.kei) : null,
      results: k.results !== undefined ? Number(k.results) : null,
      growth_yesterday: k.growth_yesterday !== undefined ? Number(k.growth_yesterday) : null,
      monthly_downloads: k.monthly_downloads !== undefined ? Number(k.monthly_downloads) : null,
      maximum_reach: k.maximum_reach !== undefined ? Number(k.maximum_reach) : null,
      conversion_rate: k.conversion_rate !== undefined ? Number(k.conversion_rate) : null,
      sort_order: Number(k.sort_order) || 0,
    }))

    const { data, error } = await supabase.from("app_keywords").insert(formattedKeywords).select()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true, count: data?.length || 0 }
  } catch (error: any) {
    console.error("Error importing keywords:", error)
    // Provide more detailed error message
    const errorMessage = error?.message || error?.details || String(error) || "Unknown error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function generateOptimizedKeywordSetsAction(appDataId: string) {
  const keywords = await getKeywords(appDataId)
  return generateOptimizedKeywordSets(keywords)
}

export async function getUser() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  
  // Check for supervisor session first
  const supervisorSession = cookieStore.get("supervisor_session")
  if (supervisorSession && supervisorSession.value.startsWith("supervisor_")) {
    return { 
      id: "supervisor_laura",
      email: "laura@supervisor",
      username: "Laura",
      role: "test_reviewer"
    } as any
  }
  
  // Otherwise check Supabase auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserWithRole() {
  const user = await getUser()
  
  // If supervisor session
  if (user && (user as any).username === "Laura") {
    return { user: { email: "laura@supervisor", username: "Laura" }, role: "test_reviewer" as const }
  }
  
  // If Supabase user
  if (!user?.email) return { user: null, role: null }
  
  const { getUserRole } = await import("@/lib/auth")
  const role = getUserRole(user.email)
  return { user, role }
}

export async function signOut() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  
  // Clear supervisor session
  cookieStore.delete("supervisor_session")
  
  // Also sign out from Supabase if logged in
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    // Ignore errors if not logged in with Supabase
  }
}

export async function getScreenshotMessaging(screenshotId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("app_screenshot_messaging")
      .select("*")
      .eq("screenshot_id", screenshotId)
      .maybeSingle()

    if (error) {
      // If table doesn't exist, return null instead of throwing
      if (error.code === "42P01") {
        console.warn("app_screenshot_messaging table does not exist")
        return null
      }
      throw error
    }

    return data as ScreenshotMessaging | null
  } catch (error: any) {
    if (error?.code === "42P01") {
      return null
    }
    console.error("Error fetching screenshot messaging:", error)
    return null
  }
}

export async function saveScreenshotMessaging(
  screenshotId: string,
  messaging: Partial<ScreenshotMessaging>
) {
  const supabase = await createClient()

  try {
    // Check if messaging exists
    const { data: existing } = await supabase
      .from("app_screenshot_messaging")
      .select("id")
      .eq("screenshot_id", screenshotId)
      .maybeSingle()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("app_screenshot_messaging")
        .update({ ...messaging, updated_at: new Date().toISOString() })
        .eq("id", existing.id)

      if (error) throw error

      revalidatePath("/admin")
      revalidatePath("/preview")

      return { success: true, id: existing.id }
    } else {
      // Create new
      const { data, error } = await supabase
        .from("app_screenshot_messaging")
        .insert([
          {
            screenshot_id: screenshotId,
            ...messaging,
            ab_test_variant: messaging.ab_test_variant || "A",
          },
        ])
        .select()
        .single()

      if (error) throw error

      revalidatePath("/admin")
      revalidatePath("/preview")

      return { success: true, id: data.id }
    }
  } catch (error) {
    console.error("Error saving screenshot messaging:", error)
    return { success: false, error: String(error) }
  }
}

export async function bulkImportScreenshotMessaging(
  messagingData: Omit<ScreenshotMessaging, "id" | "created_at" | "updated_at">[]
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("app_screenshot_messaging").insert(messagingData).select()

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/preview")

    return { success: true, count: data?.length || 0 }
  } catch (error) {
    console.error("Error importing screenshot messaging:", error)
    return { success: false, error: String(error) }
  }
}
