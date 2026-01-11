import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * API Route to delete all apps except the one with perfect ASO data
 * This is a cleanup utility for the demo
 */
export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get all apps
    const { data: apps, error: fetchError } = await supabase
      .from("app_data")
      .select("id, app_name")
      .order("created_at", { ascending: false })

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    if (!apps || apps.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No apps to delete",
        deleted: 0
      })
    }

    // Delete all apps (CASCADE will handle related data)
    const appIds = apps.map(app => app.id)
    
    // Delete screenshot messaging first (manual cleanup needed)
    const { data: screenshots } = await supabase
      .from("app_screenshots")
      .select("id")
      .in("app_data_id", appIds)

    if (screenshots && screenshots.length > 0) {
      const screenshotIds = screenshots.map(s => s.id)
      await supabase
        .from("app_screenshot_messaging")
        .delete()
        .in("screenshot_id", screenshotIds)
    }

    // Delete all apps
    const { error: deleteError } = await supabase
      .from("app_data")
      .delete()
      .in("id", appIds)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${apps.length} app(s)`,
      deleted: apps.length
    })
  } catch (error) {
    console.error("Error cleaning up apps:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
