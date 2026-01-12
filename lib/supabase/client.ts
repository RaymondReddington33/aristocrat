import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Missing Supabase environment variables. Please check your configuration.\n" +
      `Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n` +
      `Current status: ${!supabaseUrl ? "URL missing" : "OK"}, ${!supabaseAnonKey ? "Key missing" : "OK"}`
    
    console.error("Supabase configuration error:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      envKeys: Object.keys(process.env).filter(k => k.includes("SUPABASE"))
    })
    
    // Throw error instead of silent fallback - Supabase is critical
    throw new Error(errorMessage)
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error creating Supabase client:", errorMessage)
    // Throw error instead of silent fallback - Supabase connection is critical
    throw new Error(`Failed to initialize Supabase client: ${errorMessage}`)
  }
}
