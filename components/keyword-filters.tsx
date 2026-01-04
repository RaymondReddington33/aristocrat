"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

interface KeywordFiltersProps {
  platformFilter: string
  categoryFilter: string
  onPlatformFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
}

export function KeywordFilters({
  platformFilter,
  categoryFilter,
  onPlatformFilterChange,
  onCategoryFilterChange,
}: KeywordFiltersProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
      <div className="flex items-center gap-2 text-slate-700">
        <Filter className="h-4 w-4" />
        <span className="font-medium text-sm">Filters:</span>
      </div>
      <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Platforms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Platforms</SelectItem>
          <SelectItem value="ios">iOS</SelectItem>
          <SelectItem value="android">Android</SelectItem>
          <SelectItem value="both">Both</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="branded">Branded</SelectItem>
          <SelectItem value="generic">Generic</SelectItem>
          <SelectItem value="competitor">Competitor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
