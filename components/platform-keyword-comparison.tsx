"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Monitor } from "lucide-react"
import type { AppKeyword } from "@/lib/types"
import { optimizeIOSKeywords, optimizeAndroidKeywords } from "@/lib/keyword-optimizer"

interface PlatformComparisonProps {
  keywords: AppKeyword[]
}

export function PlatformComparison({ keywords }: PlatformComparisonProps) {
  const iosOptimized = optimizeIOSKeywords(keywords)
  const androidOptimized = optimizeAndroidKeywords(keywords)

  const iosKeywordsFieldLength = iosOptimized.keywordsField.length

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* iOS Section */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Smartphone className="h-5 w-5 text-blue-600" />
            iOS App Store
          </CardTitle>
          <CardDescription>Optimized keywords for Apple App Store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Title Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Title Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {iosOptimized.title.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="flex flex-wrap gap-2">
                {iosOptimized.title.length > 0 ? (
                  iosOptimized.title.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No keywords assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Subtitle Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {iosOptimized.subtitle.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="flex flex-wrap gap-2">
                {iosOptimized.subtitle.length > 0 ? (
                  iosOptimized.subtitle.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No keywords assigned</span>
                )}
              </div>
            </div>
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
              {iosOptimized.keywordsField || (
                <span className="text-slate-500">No keywords assigned</span>
              )}
            </div>
            {iosKeywordsFieldLength > 100 && (
              <p className="text-xs text-slate-600 mt-1">Exceeds 100 character limit</p>
            )}
          </div>

          {/* Description Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Description Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {iosOptimized.description.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {iosOptimized.description.length > 0 ? (
                  iosOptimized.description.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No keywords assigned</span>
                )}
              </div>
            </div>
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
          <CardDescription>Optimized keywords for Google Play Store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Title Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Title Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {androidOptimized.title.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="flex flex-wrap gap-2">
                {androidOptimized.title.length > 0 ? (
                  androidOptimized.title.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No keywords assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Short Description Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Short Description Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {androidOptimized.shortDescription.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="flex flex-wrap gap-2">
                {androidOptimized.shortDescription.length > 0 ? (
                  androidOptimized.shortDescription.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No keywords assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Full Description Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Full Description Keywords</h4>
              <Badge variant="outline" className="text-xs">
                {androidOptimized.fullDescription.length} keywords
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {androidOptimized.fullDescription.length > 0 ? (
                  androidOptimized.fullDescription.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No keywords assigned</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
