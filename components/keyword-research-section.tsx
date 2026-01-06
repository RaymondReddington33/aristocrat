"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeywordTable } from "@/components/keyword-table"
import { KeywordVisualizations } from "@/components/keyword-visualizations"
import { PlatformComparison } from "@/components/platform-keyword-comparison"
import { KeywordFilters } from "@/components/keyword-filters"
import { TrendingUp, Target } from "lucide-react"
import type { AppKeyword, AppData } from "@/lib/types"
import { calculateKeywordPriority } from "@/lib/keyword-optimizer"

interface KeywordResearchSectionProps {
  keywords: AppKeyword[]
  appData: AppData
}

export function KeywordResearchSection({ keywords, appData }: KeywordResearchSectionProps) {
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Filter keywords based on selected filters and calculate priority in real-time
  const filteredKeywords = useMemo(() => {
    let filtered = [...keywords]

    // Apply platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter((k) => k.platform === platformFilter || k.platform === "both")
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((k) => k.category === categoryFilter)
    }

    // Calculate priority for all keywords in real-time
    return filtered.map(k => ({
      ...k,
      priority: calculateKeywordPriority(k)
    }))
  }, [keywords, platformFilter, categoryFilter])

  // Calculate statistics based on filtered keywords (with calculated priority)
  const totalKeywords = filteredKeywords.length
  const brandedCount = filteredKeywords.filter((k) => k.category === "branded").length
  const genericCount = filteredKeywords.filter((k) => k.category === "generic").length
  const competitorCount = filteredKeywords.filter((k) => k.category === "competitor").length
  const highPriorityCount = filteredKeywords.filter((k) => k.priority === "high").length
  const totalVolume = filteredKeywords.reduce((sum, k) => sum + k.search_volume, 0)
  const avgDifficulty = filteredKeywords.length > 0
    ? filteredKeywords.reduce((sum, k) => sum + k.difficulty, 0) / filteredKeywords.length
    : 0
  const avgRelevance = filteredKeywords.length > 0
    ? filteredKeywords.reduce((sum, k) => sum + k.relevance_score, 0) / filteredKeywords.length
    : 0

  return (
    <>
      {/* Filters */}
      <KeywordFilters
        platformFilter={platformFilter}
        categoryFilter={categoryFilter}
        onPlatformFilterChange={setPlatformFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      {/* Overview Section */}
      <Card className="border-2 mb-6">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Overview
          </CardTitle>
          <CardDescription>Key metrics and statistics for your keyword research</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-slate-900">{totalKeywords}</div>
              <div className="text-sm text-slate-600 mt-1">Total Keywords</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-slate-900">{totalVolume.toLocaleString('en-US')}</div>
              <div className="text-sm text-slate-600 mt-1">Total Search Volume</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-slate-900">{avgDifficulty.toFixed(1)}</div>
              <div className="text-sm text-slate-600 mt-1">Avg Difficulty</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-slate-900">{avgRelevance.toFixed(1)}</div>
              <div className="text-sm text-slate-600 mt-1">Avg Relevance</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-800">{brandedCount}</div>
              <div className="text-sm text-purple-600 mt-1">Branded</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-800">{genericCount}</div>
              <div className="text-sm text-green-600 mt-1">Generic</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-800">{competitorCount}</div>
              <div className="text-sm text-orange-600 mt-1">Competitor</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-800">{highPriorityCount} High Priority Keywords</div>
                <div className="text-sm text-yellow-700">
                  Focus on optimizing these keywords first for maximum impact
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      {filteredKeywords.length > 0 && (
        <div className="mb-6">
          <KeywordVisualizations keywords={filteredKeywords} appData={appData} />
        </div>
      )}

      {/* Platform Analysis */}
      {filteredKeywords.length > 0 && (
        <Card className="border-2 mb-6">
          <CardHeader className="bg-indigo-50">
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Target className="h-5 w-5 text-indigo-600" />
              Platform Analysis
            </CardTitle>
            <CardDescription>Side-by-side comparison of keywords configured in admin panel for iOS and Android</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <PlatformComparison appData={appData} keywords={filteredKeywords} />
          </CardContent>
        </Card>
      )}

      {/* Keyword Table */}
      <Card className="border-2 mb-6">
        <CardHeader className="bg-slate-50">
          <CardTitle>Complete Keyword List</CardTitle>
          <CardDescription>All keywords with their metrics and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <KeywordTable keywords={filteredKeywords} appData={appData} editable={false} showFilters={false} />
        </CardContent>
      </Card>

    </>
  )
}
