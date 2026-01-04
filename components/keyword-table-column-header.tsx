"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface ColumnHeaderProps {
  field?: string
  currentSortField?: string
  currentSortDirection?: "asc" | "desc"
  onSort?: (field: string) => void
  tooltip: string
  children: React.ReactNode
}

export function ColumnHeader({ field, currentSortField, currentSortDirection, onSort, tooltip, children }: ColumnHeaderProps) {
  const content = field && onSort ? (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1"
      onClick={() => onSort(field)}
    >
      {children}
      {currentSortField === field ? (
        currentSortDirection === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </Button>
  ) : (
    <span className="font-medium">{children}</span>
  )

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 cursor-help">
          {content}
          <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 transition-colors" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-700">
        <p className="text-xs leading-relaxed">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// Metric descriptions for tooltips
export const METRIC_DESCRIPTIONS = {
  keyword: "The keyword or search term",
  brand: "Indicates if the keyword is a brand name (TRUE/FALSE)",
  volume: "Estimated monthly search volume for this keyword",
  difficulty: "Ranking difficulty score (0-100), where higher values indicate more competition",
  chance: "Percentage chance of ranking for this keyword (0-100)",
  kei: "Keyword Efficiency Index - ratio of search volume to difficulty, higher values indicate better opportunities",
  results: "Number of search results for this keyword",
  growth_yesterday: "Growth (Yesterday) - Percentage growth in search volume from yesterday. Positive values indicate increasing trend.",
  monthly_downloads: "Monthly Downloads - Estimated monthly downloads for apps ranking for this keyword. Higher values indicate more competitive keywords.",
  maximum_reach: "Maximum Reach - Maximum potential reach for this keyword. Represents the total addressable market size.",
  conversion_rate: "Conversion Rate - Conversion rate percentage for this keyword (0-100). Higher values indicate better user intent and quality.",
  relevance_score: "Relevancy Score - How relevant the keyword is to your app (0-100). Higher scores indicate better alignment with your app's features and target audience.",
  category: "Keyword category: Branded (your brand), Generic (common terms), or Competitor (competitor brands)",
  priority: "Priority level: High (focus first), Medium, or Low",
  platform: "Target platform: iOS, Android, or Both",
  density: "Keyword density - percentage of times this keyword appears across all ASO fields",
  recommended_field: "Recommended ASO field where this keyword should be used: Title, Subtitle, Keywords, or Description",
}
