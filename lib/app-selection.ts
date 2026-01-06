import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

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
 */
export async function getAppDataOrLatest(appId: string | null) {
  const supabase = await createClient()
  
  if (appId) {
    const { data, error } = await supabase
      .from("app_data")
      .select("*")
      .eq("id", appId)
      .maybeSingle()
    
    if (!error && data) {
      return data
    }
  }
  
  // Fallback to latest app
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
