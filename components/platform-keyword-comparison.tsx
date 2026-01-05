"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Monitor } from "lucide-react"
import type { AppData } from "@/lib/types"

interface PlatformComparisonProps {
  appData: AppData
}

// Helper function to extract keywords from text (split by spaces, commas, or other delimiters)
function extractKeywords(text: string | null | undefined): string[] {
  if (!text) return []
  return text
    .split(/[,\s]+/)
    .map(kw => kw.trim())
    .filter(kw => kw.length > 0)
}

export function PlatformComparison({ appData }: PlatformComparisonProps) {
  // Extract keywords from actual admin fields
  // iOS: Extract from title, subtitle, keywords field, and description
  const iosTitleKeywords = extractKeywords(appData.ios_app_name)
  const iosSubtitleKeywords = extractKeywords(appData.ios_subtitle)
  const iosKeywordsField = appData.ios_keywords || ""
  const iosKeywordsFieldArray = iosKeywordsField.split(",").map(k => k.trim()).filter(k => k.length > 0)
  const iosDescriptionKeywords = extractKeywords(appData.ios_description)

  // Android: Extract from title, short description, and full description
  const androidTitleKeywords = extractKeywords(appData.android_app_name)
  const androidShortDescKeywords = extractKeywords(appData.android_short_description)
  const androidFullDescKeywords = extractKeywords(appData.android_full_description)

  const iosKeywordsFieldLength = iosKeywordsField.length

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* iOS Section */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Smartphone className="h-5 w-5 text-blue-600" />
            iOS App Store
          </CardTitle>
          <CardDescription>Keywords configured in admin panel for Apple App Store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Title Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Title Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {iosTitleKeywords.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {iosTitleKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {iosTitleKeywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No keywords assigned</span>
              )}
            </div>
            {appData.ios_app_name && (
              <p className="text-xs text-slate-600 mt-1 italic">From: "{appData.ios_app_name}"</p>
            )}
          </div>

          {/* Subtitle Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Subtitle Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {iosSubtitleKeywords.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {iosSubtitleKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {iosSubtitleKeywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No keywords assigned</span>
              )}
            </div>
            {appData.ios_subtitle && (
              <p className="text-xs text-slate-600 mt-1 italic">From: "{appData.ios_subtitle}"</p>
            )}
          </div>

          {/* Keywords Field (100 chars max) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Keywords Field</h4>
              <Badge variant="outline" className="text-xs">
                {iosKeywordsFieldLength}/100 chars
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border font-mono text-xs">
              {iosKeywordsField || (
                <span className="text-slate-500">No keywords assigned</span>
              )}
            </div>
            {iosKeywordsFieldLength > 100 && (
              <p className="text-xs text-red-600 mt-1">⚠️ Exceeds 100 character limit</p>
            )}
            {iosKeywordsFieldArray.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {iosKeywordsFieldArray.map((kw, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Description Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {iosDescriptionKeywords.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border max-h-32 overflow-y-auto">
              {iosDescriptionKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {iosDescriptionKeywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No keywords assigned</span>
              )}
            </div>
            {appData.ios_description && (
              <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">
                From description: "{appData.ios_description.substring(0, 100)}..."
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Android Section */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Monitor className="h-5 w-5 text-green-600" />
            Google Play Store
          </CardTitle>
          <CardDescription>Keywords configured in admin panel for Google Play Store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Title Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Title Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {androidTitleKeywords.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {androidTitleKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {androidTitleKeywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No keywords assigned</span>
              )}
            </div>
            {appData.android_app_name && (
              <p className="text-xs text-slate-600 mt-1 italic">From: "{appData.android_app_name}"</p>
            )}
          </div>

          {/* Short Description Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Short Description Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {androidShortDescKeywords.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {androidShortDescKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {androidShortDescKeywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No keywords assigned</span>
              )}
            </div>
            {appData.android_short_description && (
              <p className="text-xs text-slate-600 mt-1 italic">From: "{appData.android_short_description}"</p>
            )}
          </div>

          {/* Full Description Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Full Description Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {androidFullDescKeywords.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border max-h-32 overflow-y-auto">
              {androidFullDescKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {androidFullDescKeywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No keywords assigned</span>
              )}
            </div>
            {appData.android_full_description && (
              <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">
                From description: "{appData.android_full_description.substring(0, 100)}..."
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
