import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Copy, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getSelectedAppId, getAppDataOrLatest } from "@/lib/app-selection"

export default async function AndroidMetadataPage({ searchParams }: { searchParams?: Promise<{ appId?: string }> }) {
  const params = await searchParams
  const queryAppId = params?.appId || null
  const cookieAppId = await getSelectedAppId()
  const selectedAppId = queryAppId || cookieAppId
  const appData = await getAppDataOrLatest(selectedAppId)

  if (!appData) {
    redirect("/admin")
  }

  const renderField = (label: string, value: string | number | undefined | null, fieldName: string, maxLength?: number) => {
    if (value === undefined || value === null || value === "") return null

    const displayValue = String(value)
    const charCount = displayValue.length
    const limitExceeded = maxLength ? charCount > maxLength : false

    return (
      <div className="space-y-2 pb-6 border-b border-slate-200 last:border-0 last:pb-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-base font-semibold text-slate-900 uppercase tracking-wide">
            {label}
            {maxLength && (
              <span className="ml-2 text-sm font-normal normal-case text-slate-500">
                (max {maxLength.toLocaleString()} chars)
              </span>
            )}
          </label>
          <div className="flex items-center gap-3">
            <Badge variant={limitExceeded ? "destructive" : "outline"} className="text-sm px-3 py-1">
              {charCount.toLocaleString()} {limitExceeded ? "(exceeded)" : "chars"}
            </Badge>
          </div>
        </div>
        <div className="text-base text-slate-900 whitespace-pre-wrap break-words bg-slate-50 p-4 rounded-lg border border-slate-200">
          {displayValue}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href="/preview/android" className="text-green-600 hover:text-green-700 flex items-center gap-2 font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to Android Preview
            </Link>
            <Badge variant="outline" className="text-sm">Google Play Store Metadata</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Google Play Store Metadata</h1>
              <p className="text-slate-600 mt-1">Complete ASO metadata including visible and hidden fields</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Visible Fields */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Visible Fields (Public)
              </CardTitle>
              <CardDescription className="text-base">
                These fields are visible to users on the Google Play Store
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {renderField("App Name", appData.android_app_name || appData.app_name, "android_app_name", 50)}
                {renderField("Short Description", appData.android_short_description || appData.app_subtitle, "android_short_description", 80)}
                {renderField("Full Description", appData.android_full_description, "android_full_description", 4000)}
                {renderField("Promo Text", appData.android_promo_text, "android_promo_text", 80)}
                {renderField("Recent Changes", appData.android_recent_changes, "android_recent_changes", 500)}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Additional Information
              </CardTitle>
              <CardDescription className="text-base">
                App details and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {renderField("Category", appData.category, "category")}
                {renderField("Age Rating", appData.age_rating, "age_rating")}
                {renderField("Price", appData.price, "price")}
                {renderField("Rating", appData.rating, "rating")}
                {renderField("Review Count", appData.review_count, "review_count")}
                {renderField("Download Count", appData.download_count, "download_count")}
                {appData.has_in_app_purchases && (
                  <div className="space-y-2 pb-6 border-b border-slate-200 last:border-0 last:pb-0">
                    <label className="text-base font-semibold text-slate-900 uppercase tracking-wide">
                      In-App Purchases
                    </label>
                    <div className="text-base text-slate-900 whitespace-pre-wrap break-words bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {appData.android_in_app_products || appData.in_app_purchases_description || "Yes"}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ASO Notes */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                ASO Note
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-base text-green-800">
                <strong>ASO Note:</strong> Google Play uses the Title, Short Description, and Full Description for indexing. 
                No separate keywords field exists - keywords should be naturally integrated into these fields.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
