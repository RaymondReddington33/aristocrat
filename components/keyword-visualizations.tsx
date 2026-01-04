"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AppKeyword, AppData } from "@/lib/types"
import { calculateKeywordScore, calculateKeywordPriority } from "@/lib/keyword-optimizer"
import { calculateIndividualKeywordDensity } from "@/lib/keyword-density"

interface KeywordVisualizationsProps {
  keywords: AppKeyword[]
}

const COLORS = {
  branded: "#9333ea", // purple
  generic: "#22c55e", // green
  competitor: "#f97316", // orange
}

const PRIORITY_COLORS = {
  high: "#ef4444", // red
  medium: "#eab308", // yellow
  low: "#3b82f6", // blue
}

export function KeywordVisualizations({ keywords, appData }: KeywordVisualizationsProps) {
  // Volume Chart Data - Top 10 by volume
  const volumeData = useMemo(() => {
    return [...keywords]
      .sort((a, b) => b.search_volume - a.search_volume)
      .slice(0, 10)
      .map((k) => ({
        keyword: k.keyword.length > 15 ? k.keyword.substring(0, 15) + "..." : k.keyword,
        volume: k.search_volume,
        fullKeyword: k.keyword,
      }))
  }, [keywords])

  // Category Distribution
  const categoryData = useMemo(() => {
    const counts = keywords.reduce(
      (acc, k) => {
        acc[k.category] = (acc[k.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS],
    }))
  }, [keywords])

  // Difficulty vs Volume Scatter
  const scatterData = useMemo(() => {
    return keywords.map((k) => ({
      volume: k.search_volume,
      difficulty: k.difficulty,
      relevance: k.relevance_score,
      keyword: k.keyword,
      category: k.category,
      score: calculateKeywordScore(k),
    }))
  }, [keywords])

  // Priority Keywords with density (calculate priority in real-time)
  const priorityKeywords = useMemo(() => {
    // Calculate priority for all keywords first
    const keywordsWithCalculatedPriority = keywords.map(k => ({
      ...k,
      calculatedPriority: calculateKeywordPriority(k)
    }))
    
    // Filter by high priority (using calculated priority)
    const filtered = keywordsWithCalculatedPriority
      .filter((k) => k.calculatedPriority === "high")
      .sort((a, b) => calculateKeywordScore(b) - calculateKeywordScore(a))
      .slice(0, 10)
    
    if (appData) {
      return filtered.map(k => ({
        ...k,
        priority: k.calculatedPriority, // Use calculated priority
        density: calculateIndividualKeywordDensity(k.keyword, appData)
      }))
    }
    return filtered.map(k => ({ 
      ...k, 
      priority: k.calculatedPriority, // Use calculated priority
      density: 0 
    }))
  }, [keywords, appData])

  // Platform Comparison
  const platformData = useMemo(() => {
    const ios = keywords.filter((k) => k.platform === "ios" || k.platform === "both").length
    const android = keywords.filter((k) => k.platform === "android" || k.platform === "both").length
    const both = keywords.filter((k) => k.platform === "both").length

    return [
      { name: "iOS Only", value: ios - both, color: "#3b82f6" },
      { name: "Android Only", value: android - both, color: "#22c55e" },
      { name: "Both Platforms", value: both, color: "#9333ea" },
    ]
  }, [keywords])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.fullKeyword || payload[0].payload.keyword}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString('en-US') : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Keywords by Search Volume</CardTitle>
          <CardDescription>Top 10 keywords ranked by estimated search volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Distribution of keywords by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {categoryData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Keywords by target platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {platformData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty vs Volume Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty vs Volume Analysis</CardTitle>
          <CardDescription>Keyword difficulty vs search volume (bubble size = relevance score)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="volume"
                name="Search Volume"
                label={{ value: "Search Volume", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                type="number"
                dataKey="difficulty"
                name="Difficulty"
                label={{ value: "Difficulty", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{data.keyword}</p>
                        <p>Volume: {data.volume.toLocaleString('en-US')}</p>
                        <p>Difficulty: {data.difficulty.toFixed(1)}</p>
                        <p>Relevance: {data.relevance.toFixed(1)}</p>
                        <p>Score: {data.score.toFixed(1)}</p>
                        <p className="capitalize">Category: {data.category}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter name="Keywords" data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {Object.entries(COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs capitalize">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>High Priority Keywords</CardTitle>
          <CardDescription>Top 10 high-priority keywords ranked by optimization score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {priorityKeywords.length > 0 ? (
              priorityKeywords.map((keyword, index) => (
                <div
                  key={keyword.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-semibold">{keyword.keyword}</div>
                      <div className="text-xs text-slate-600">
                        Volume: {keyword.search_volume.toLocaleString('en-US')} • Difficulty: {keyword.difficulty.toFixed(1)} • Relevance: {keyword.relevance_score.toFixed(1)}
                        {appData && (keyword as any).density !== undefined && ` • Density: ${((keyword as any).density || 0).toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className="capitalize"
                    style={{
                      backgroundColor: PRIORITY_COLORS[keyword.priority],
                      color: "white",
                    }}
                  >
                    {keyword.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">No high-priority keywords found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
