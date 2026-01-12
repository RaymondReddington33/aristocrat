"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Copy, Check } from "lucide-react"
import type { AppData } from "@/lib/types"

interface MetadataViewerProps {
  appData: Partial<AppData>
  platform: "ios" | "android"
}

export function MetadataViewer({ appData, platform }: MetadataViewerProps) {
  const [open, setOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const renderField = (label: string, value: string | number | undefined | null, fieldName: string, isCode = false, maxLength?: number) => {
    if (value === undefined || value === null || value === "") return null

    const displayValue = String(value)
    const charCount = displayValue.length
    const limitExceeded = maxLength ? charCount > maxLength : false

    return (
      <div className="space-y-2 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {label}
            {maxLength && (
              <span className="ml-2 text-xs font-normal normal-case text-slate-500">
                (max {maxLength.toLocaleString()} chars)
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <Badge variant={limitExceeded ? "destructive" : "outline"} className="text-xs">
              {charCount.toLocaleString()} {limitExceeded ? "(exceeded)" : "chars"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => copyToClipboard(displayValue, fieldName)}
            >
              {copiedField === fieldName ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 text-slate-400" />
              )}
            </Button>
          </div>
        </div>
        <div className={`${isCode ? "font-mono text-xs bg-slate-50 p-3 rounded border" : "text-sm text-slate-900"} whitespace-pre-wrap break-words`}>
          {displayValue}
        </div>
      </div>
    )
  }

  if (platform === "ios") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            View Metadata
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              iOS App Store Metadata
            </DialogTitle>
            <DialogDescription>
              Complete ASO metadata including visible and hidden fields
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-6">
              {/* Visible Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Visible Fields (Public)
                </h3>
                {renderField("App Name", appData.ios_app_name || appData.app_name, "ios_app_name", false, 30)}
                {renderField("Subtitle", appData.ios_subtitle || appData.app_subtitle, "ios_subtitle", false, 30)}
                {renderField("Description", appData.ios_description, "ios_description", false, 4000)}
                {renderField("Promotional Text", appData.ios_promotional_text, "ios_promotional_text", false, 170)}
                {renderField("What's New", appData.ios_whats_new, "ios_whats_new", false, 4000)}
              </div>

              {/* Hidden Fields (Indexable) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Hidden Fields (Indexable by App Store)
                </h3>
                {renderField("Keywords Field", appData.ios_keywords, "ios_keywords", true, 100)}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  <strong>Note:</strong> The Keywords field is not visible to users but is used by Apple for search indexing. 
                  Maximum 100 characters, comma-separated, no spaces around commas.
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  URLs
                </h3>
                {renderField("Support URL", appData.ios_support_url, "ios_support_url", true)}
                {renderField("Marketing URL", appData.ios_marketing_url, "ios_marketing_url", true)}
                {renderField("Privacy URL", appData.ios_privacy_url, "ios_privacy_url", true)}
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Additional Information
                </h3>
                {renderField("Category", appData.category, "category")}
                {renderField("Age Rating", appData.age_rating, "age_rating")}
                {renderField("Price", appData.price, "price")}
                {renderField("Rating", appData.rating, "rating")}
                {renderField("Review Count", appData.review_count, "review_count")}
                {renderField("Download Count", appData.download_count, "download_count")}
                {appData.has_in_app_purchases && (
                  <div className="space-y-2 pb-4 border-b border-slate-200">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      In-App Purchases
                    </label>
                    <div className="text-sm text-slate-900">
                      {appData.ios_in_app_purchases || appData.in_app_purchases_description || "Yes"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  // Android
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View Metadata
        </Button>
      </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Google Play Store Metadata
            </DialogTitle>
            <DialogDescription>
              Complete ASO metadata including visible and hidden fields
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-6">
            {/* Visible Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                Visible Fields (Public)
              </h3>
              {renderField("App Name", appData.android_app_name || appData.app_name, "android_app_name", false, 50)}
              {renderField("Short Description", appData.android_short_description || appData.app_subtitle, "android_short_description", false, 80)}
              {renderField("Full Description", appData.android_full_description, "android_full_description", false, 4000)}
              {renderField("Promo Text", appData.android_promo_text, "android_promo_text", false, 80)}
              {renderField("Recent Changes", appData.android_recent_changes, "android_recent_changes", false, 500)}
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                Additional Information
              </h3>
              {renderField("Category", appData.category, "category")}
              {renderField("Age Rating", appData.age_rating, "age_rating")}
              {renderField("Price", appData.price, "price")}
              {renderField("Rating", appData.rating, "rating")}
              {renderField("Review Count", appData.review_count, "review_count")}
              {renderField("Download Count", appData.download_count, "download_count")}
              {appData.has_in_app_purchases && (
                <div className="space-y-2 pb-4 border-b border-slate-200">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    In-App Purchases
                  </label>
                  <div className="text-sm text-slate-900">
                    {appData.android_in_app_products || appData.in_app_purchases_description || "Yes"}
                  </div>
                </div>
              )}
            </div>

            {/* ASO Notes */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
              <strong>ASO Note:</strong> Google Play uses the Title, Short Description, and Full Description for indexing. 
              No separate keywords field exists - keywords should be naturally integrated into these fields.
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
