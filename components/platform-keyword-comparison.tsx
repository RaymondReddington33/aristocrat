"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Smartphone, Monitor, BarChart3 } from "lucide-react"
import type { AppData, AppKeyword } from "@/lib/types"

interface PlatformComparisonProps {
  appData: AppData
  keywords?: AppKeyword[]
}

/**
 * Calculate keyword density for a specific field
 * Returns: { density: number, keywordsFound: number, totalKeywords: number, keywordsList: string[] }
 */
function calculateFieldDensity(
  fieldText: string,
  keywords: AppKeyword[]
): { density: number; keywordsFound: number; totalKeywords: number; keywordsList: string[] } {
  if (!fieldText || !keywords || keywords.length === 0) {
    return { density: 0, keywordsFound: 0, totalKeywords: keywords?.length || 0, keywordsList: [] }
  }

  const fieldTextLower = fieldText.toLowerCase()
  const keywordsFound: string[] = []

  // Check each keyword against the field text
  for (const keyword of keywords) {
    const keywordLower = keyword.keyword.toLowerCase().trim()
    // Check if keyword appears in the field (as whole word or part of a phrase)
    const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
    if (regex.test(fieldTextLower)) {
      keywordsFound.push(keyword.keyword)
    }
  }

  const totalKeywords = keywords.length
  const density = totalKeywords > 0 ? (keywordsFound.length / totalKeywords) * 100 : 0

  return {
    density: Math.round(density * 10) / 10,
    keywordsFound: keywordsFound.length,
    totalKeywords,
    keywordsList: keywordsFound,
  }
}

export function PlatformComparison({ appData, keywords = [] }: PlatformComparisonProps) {
  // Get actual content from admin fields (not extracted keywords)
  // iOS: Get from title, subtitle, keywords field
  const iosTitle = appData.ios_app_name || ""
  const iosSubtitle = appData.ios_subtitle || ""
  const iosKeywordsField = appData.ios_keywords || ""
  const iosKeywordsFieldArray = iosKeywordsField.split(",").map(k => k.trim()).filter(k => k.length > 0)
  const iosDescription = appData.ios_description || ""

  // Android: Get from title, short description
  const androidTitle = appData.android_app_name || ""
  const androidShortDescription = appData.android_short_description || ""
  const androidFullDescription = appData.android_full_description || ""

  const iosKeywordsFieldLength = iosKeywordsField.length

  // Filter keywords by platform
  const iosKeywords = useMemo(
    () => keywords.filter((k) => k.platform === "ios" || k.platform === "both"),
    [keywords]
  )
  const androidKeywords = useMemo(
    () => keywords.filter((k) => k.platform === "android" || k.platform === "both"),
    [keywords]
  )

  // Calculate keyword density for each field
  const iosTitleDensity = useMemo(
    () => calculateFieldDensity(iosTitle, iosKeywords),
    [iosTitle, iosKeywords]
  )
  const iosSubtitleDensity = useMemo(
    () => calculateFieldDensity(iosSubtitle, iosKeywords),
    [iosSubtitle, iosKeywords]
  )
  const iosKeywordsFieldDensity = useMemo(
    () => calculateFieldDensity(iosKeywordsField, iosKeywords),
    [iosKeywordsField, iosKeywords]
  )
  const iosDescriptionDensity = useMemo(
    () => calculateFieldDensity(iosDescription, iosKeywords),
    [iosDescription, iosKeywords]
  )

  const androidTitleDensity = useMemo(
    () => calculateFieldDensity(androidTitle, androidKeywords),
    [androidTitle, androidKeywords]
  )
  const androidShortDescDensity = useMemo(
    () => calculateFieldDensity(androidShortDescription, androidKeywords),
    [androidShortDescription, androidKeywords]
  )
  const androidFullDescDensity = useMemo(
    () => calculateFieldDensity(androidFullDescription, androidKeywords),
    [androidFullDescription, androidKeywords]
  )

  return (
    <div className="space-y-6">
      {/* Keyword Distribution Section */}
      {keywords.length > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Keyword Distribution
            </CardTitle>
            <CardDescription>
              Percentage of keywords from your list that appear in each field
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* iOS Distribution */}
              <div>
                <h4 className="font-semibold text-sm text-blue-800 mb-4 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  iOS App Store
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Title</span>
                      <Badge variant="outline" className="text-xs">
                        {iosTitleDensity.keywordsFound}/{iosTitleDensity.totalKeywords} keywords
                      </Badge>
                    </div>
                    <Progress value={iosTitleDensity.density} className="h-2" />
                    <p className="text-xs text-slate-600 mt-1">
                      {iosTitleDensity.density}% density
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Subtitle</span>
                      <Badge variant="outline" className="text-xs">
                        {iosSubtitleDensity.keywordsFound}/{iosSubtitleDensity.totalKeywords} keywords
                      </Badge>
                    </div>
                    <Progress value={iosSubtitleDensity.density} className="h-2" />
                    <p className="text-xs text-slate-600 mt-1">
                      {iosSubtitleDensity.density}% density
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Keywords Field</span>
                      <Badge variant="outline" className="text-xs">
                        {iosKeywordsFieldDensity.keywordsFound}/{iosKeywordsFieldDensity.totalKeywords} keywords
                      </Badge>
                    </div>
                    <Progress value={iosKeywordsFieldDensity.density} className="h-2" />
                    <p className="text-xs text-slate-600 mt-1">
                      {iosKeywordsFieldDensity.density}% density
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Description</span>
                      <Badge variant="outline" className="text-xs">
                        {iosDescriptionDensity.keywordsFound}/{iosDescriptionDensity.totalKeywords} keywords
                      </Badge>
                    </div>
                    <Progress value={iosDescriptionDensity.density} className="h-2" />
                    <p className="text-xs text-slate-600 mt-1">
                      {iosDescriptionDensity.density}% density
                    </p>
                  </div>
                </div>
              </div>

              {/* Android Distribution */}
              <div>
                <h4 className="font-semibold text-sm text-green-800 mb-4 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Google Play Store
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Title</span>
                      <Badge variant="outline" className="text-xs">
                        {androidTitleDensity.keywordsFound}/{androidTitleDensity.totalKeywords} keywords
                      </Badge>
                    </div>
                    <Progress value={androidTitleDensity.density} className="h-2" />
                    <p className="text-xs text-slate-600 mt-1">
                      {androidTitleDensity.density}% density
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Short Description</span>
                      <Badge variant="outline" className="text-xs">
                        {androidShortDescDensity.keywordsFound}/{androidShortDescDensity.totalKeywords} keywords
                      </Badge>
                    </div>
                    <Progress value={androidShortDescDensity.density} className="h-2" />
                    <p className="text-xs text-slate-600 mt-1">
                      {androidShortDescDensity.density}% density
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Full Description</span>
                      <Badge variant="outline" className="text-xs">
                        {androidFullDescDensity.keywordsFound}/{androidFullDescDensity.totalKeywords} keywords
                      </Badge>
                    </div>
                    <Progress value={androidFullDescDensity.density} className="h-2" />
                    <p className="text-xs text-slate-600 mt-1">
                      {androidFullDescDensity.density}% density
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Fields Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* iOS Section */}
        <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Smartphone className="h-5 w-5 text-blue-600" />
            iOS App Store
          </CardTitle>
          <CardDescription>Content configured in admin panel for Apple App Store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Title</h4>
              <Badge variant="outline" className="text-xs">
                {iosTitle.length}/30 chars
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {iosTitle ? (
                <p className="text-sm text-slate-900 font-medium">{iosTitle}</p>
              ) : (
                <span className="text-xs text-slate-500">No title assigned</span>
              )}
            </div>
            {iosTitle.length > 30 && (
              <p className="text-xs text-red-600 mt-1">⚠️ Exceeds 30 character limit</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Subtitle</h4>
              <Badge variant="outline" className="text-xs">
                {iosSubtitle.length}/30 chars
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {iosSubtitle ? (
                <p className="text-sm text-slate-900 font-medium">{iosSubtitle}</p>
              ) : (
                <span className="text-xs text-slate-500">No subtitle assigned</span>
              )}
            </div>
            {iosSubtitle.length > 30 && (
              <p className="text-xs text-red-600 mt-1">⚠️ Exceeds 30 character limit</p>
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

        </CardContent>
      </Card>

      {/* Android Section */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Monitor className="h-5 w-5 text-green-600" />
            Google Play Store
          </CardTitle>
          <CardDescription>Content configured in admin panel for Google Play Store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Title</h4>
              <Badge variant="outline" className="text-xs">
                {androidTitle.length}/50 chars
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {androidTitle ? (
                <p className="text-sm text-slate-900 font-medium">{androidTitle}</p>
              ) : (
                <span className="text-xs text-slate-500">No title assigned</span>
              )}
            </div>
            {androidTitle.length > 50 && (
              <p className="text-xs text-red-600 mt-1">⚠️ Exceeds 50 character limit</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Short Description</h4>
              <Badge variant="outline" className="text-xs">
                {androidShortDescription.length}/80 chars
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              {androidShortDescription ? (
                <p className="text-sm text-slate-900">{androidShortDescription}</p>
              ) : (
                <span className="text-xs text-slate-500">No short description assigned</span>
              )}
            </div>
            {androidShortDescription.length > 80 && (
              <p className="text-xs text-red-600 mt-1">⚠️ Exceeds 80 character limit</p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
