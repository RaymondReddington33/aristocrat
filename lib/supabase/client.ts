import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      envKeys: Object.keys(process.env).filter(k => k.includes("SUPABASE"))
    })
    // Return a mock client that will fail gracefully instead of throwing
    // This allows the app to continue loading even if Supabase is not configured
    return createBrowserClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-key"
    )
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Return a mock client to prevent app crash
    return createBrowserClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-key"
    )
  }
}
