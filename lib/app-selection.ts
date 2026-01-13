import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { saveAppData } from "@/app/actions"

/**
 * Get the selected app ID from cookies (set by navbar)
 * Falls back to null if not found
 */
export async function getSelectedAppId(): Promise<string | null> {
  const cookieStore = await cookies()
  const selectedAppId = cookieStore.get("selectedAppId")?.value
  return selectedAppId || null
}

/**
 * Get app data by ID, or fallback to latest app if no ID provided
 * Auto-updates old values to new ones if detected
 */
export async function getAppDataOrLatest(appId: string | null) {
  const supabase = await createClient()
  
  let data = null
  
  if (appId) {
    const { data: appData, error } = await supabase
      .from("app_data")
      .select("*")
      .eq("id", appId)
      .maybeSingle()
    
    if (!error && appData) {
      data = appData
    }
  }
  
  // Fallback to latest app if no data found
  if (!data) {
    const { data: latestData, error } = await supabase
      .from("app_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error) {
      console.error("Error fetching app data:", error)
      return null
    }
    
    data = latestData
  }
  
  if (!data) {
    return null
  }
  
  // Auto-update old values to new ones if detected
  const needsUpdate = 
    data.ios_app_name === "RedRain: Egyptian Riches Slots" ||
    data.ios_subtitle === "Premium Adventure & Fortune" ||
    data.android_app_name === "RedRain Casino: Fortune Games"
  
  if (needsUpdate && data.id) {
    console.log("[getAppDataOrLatest] Detected old values, auto-updating to new ones")
    const updatedData = {
      ...data,
      ios_app_name: data.ios_app_name === "RedRain: Egyptian Riches Slots" 
        ? "RedRain Fortune: Slots Casino" 
        : data.ios_app_name,
      ios_subtitle: data.ios_subtitle === "Premium Adventure & Fortune" 
        ? "Egyptian Las Vegas Adventure" 
        : data.ios_subtitle,
      android_app_name: data.android_app_name === "RedRain Casino: Fortune Games" 
        ? "RedRain Fortune: Slots Casino Las Vegas" 
        : data.android_app_name,
    }
    
    // Save updated values to database
    try {
      const result = await saveAppData(updatedData, data.id)
      if (result.success) {
        console.log("[getAppDataOrLatest] Successfully updated old values in database")
        return updatedData
      } else {
        console.error("[getAppDataOrLatest] Failed to update:", result.error)
        return data
      }
    } catch (error) {
      console.error("[getAppDataOrLatest] Error updating old values:", error)
      return data
    }
  }
  
  return data
}
