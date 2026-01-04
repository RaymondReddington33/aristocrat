"use client"

import { useState, useMemo } from "react"
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Download, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ColumnHeader, METRIC_DESCRIPTIONS } from "@/components/keyword-table-column-header"
import type { AppKeyword, AppData } from "@/lib/types"
import { calculateIndividualKeywordDensity } from "@/lib/keyword-density"
import { calculateKeywordPriority, recommendField } from "@/lib/keyword-optimizer"

interface KeywordTableProps {
  keywords: AppKeyword[]
  appData?: AppData
  onKeywordUpdate?: (keyword: AppKeyword) => void
  onKeywordsDelete?: (keywordIds: string[]) => void
  onKeywordsExport?: (keywords: AppKeyword[]) => void
  editable?: boolean
  showFilters?: boolean
}

type SortField = "keyword" | "brand" | "category" | "relevance_score" | "search_volume" | "difficulty" | "chance" | "kei" | "results" | "maximum_reach" | "priority" | "platform" | "recommended_field" | "density"
type SortDirection = "asc" | "desc"

export function KeywordTable({ keywords, appData, onKeywordUpdate, onKeywordsDelete, onKeywordsExport, editable = false, showFilters = true }: KeywordTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("search_volume")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const itemsPerPage = 100

  // Calculate density, priority, and recommended_field for each keyword in real-time
  const keywordsWithCalculations = useMemo(() => {
    return keywords.map(keyword => {
      // Calculate density if appData is available
      const density = appData ? calculateIndividualKeywordDensity(keyword.keyword, appData) : 0
      
      // Calculate priority automatically (always calculate to ensure accuracy)
      const calculatedPriority = calculateKeywordPriority(keyword)
      
      // Calculate recommended_field automatically based on platform
      const targetPlatform = keyword.platform === "android" ? "android" : "ios"
      const calculatedRecommendedField = recommendField(keyword, targetPlatform)
      
      return {
        ...keyword,
        density,
        priority: calculatedPriority, // Override with calculated value
        recommended_field: calculatedRecommendedField, // Override with calculated value
      }
    })
  }, [keywords, appData])

  const filteredAndSorted = useMemo(() => {
    let filtered = [...keywordsWithCalculations]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((k) => k.keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply filters
    if (platformFilter !== "all") {
      filtered = filtered.filter((k) => k.platform === platformFilter || k.platform === "both")
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((k) => k.category === categoryFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((k) => k.priority === priorityFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a]
      let bVal: any = b[sortField as keyof typeof b]

      if (sortField === "keyword") {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      } else if (sortField === "density") {
        aVal = (a as any).density ?? 0
        bVal = (b as any).density ?? 0
      } else if (sortField === "brand") {
        aVal = a.brand ? 1 : 0
        bVal = b.brand ? 1 : 0
      } else if (sortField === "category") {
        aVal = (a.category || "").toLowerCase()
        bVal = (b.category || "").toLowerCase()
      } else if (sortField === "platform") {
        aVal = (a.platform || "").toLowerCase()
        bVal = (b.platform || "").toLowerCase()
      } else if (sortField === "recommended_field") {
        aVal = (a.recommended_field || "").toLowerCase()
        bVal = (b.recommended_field || "").toLowerCase()
      } else if (sortField === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
        bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      } else {
        // Handle null/undefined values for numeric fields
        aVal = aVal ?? 0
        bVal = bVal ?? 0
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })

    return filtered
  }, [keywordsWithCalculations, searchTerm, platformFilter, categoryFilter, priorityFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const paginatedKeywords = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Helper to get column count for colspan
  const getColumnCount = () => {
    let count = 1 // # column
    count += 1 // Keyword
    count += 1 // Brand
    count += 1 // Category
    count += 1 // Relevance
    count += 1 // Volume
    count += 1 // Difficulty
    count += 1 // Chance
    count += 1 // KEI
    count += 1 // Results
    count += 1 // Max Reach
    count += 1 // Priority
    count += 1 // Platform
    count += 1 // Recommended
    if (appData) count += 1 // Density
    if (editable) count += 1 // Checkbox
    return count
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "branded":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "generic":
        return "bg-green-100 text-green-800 border-green-200"
      case "competitor":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const selectedKeywords = useMemo(() => {
    return keywords.filter(k => selectedIds.has(k.id))
  }, [keywords, selectedIds])

  const allSelected = paginatedKeywords.length > 0 && paginatedKeywords.every(k => selectedIds.has(k.id))
  const someSelected = paginatedKeywords.some(k => selectedIds.has(k.id))

  const handleSelectAll = () => {
    if (allSelected) {
      const newSelected = new Set(selectedIds)
      paginatedKeywords.forEach(k => newSelected.delete(k.id))
      setSelectedIds(newSelected)
    } else {
      const newSelected = new Set(selectedIds)
      paginatedKeywords.forEach(k => newSelected.add(k.id))
      setSelectedIds(newSelected)
    }
  }

  const handleSelectKeyword = (keywordId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(keywordId)) {
      newSelected.delete(keywordId)
    } else {
      newSelected.add(keywordId)
    }
    setSelectedIds(newSelected)
  }

  const handleExportSelected = () => {
    if (selectedKeywords.length === 0) return
    if (onKeywordsExport) {
      onKeywordsExport(selectedKeywords)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedKeywords.length === 0) return
    setShowDeleteDialog(true)
  }

  const confirmDeleteSelected = () => {
    if (onKeywordsDelete && selectedKeywords.length > 0) {
      onKeywordsDelete(selectedKeywords.map(k => k.id))
      setSelectedIds(new Set())
    }
    setShowDeleteDialog(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Keywords ({filteredAndSorted.length})</CardTitle>
          {showFilters && (
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          )}
        </div>
        {showFilters && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="branded">Branded</SelectItem>
                <SelectItem value="generic">Generic</SelectItem>
                <SelectItem value="competitor">Competitor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {editable && selectedKeywords.length > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-slate-50 rounded-lg border">
            <span className="text-sm text-slate-600">
              {selectedKeywords.length} keyword(s) selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSelected}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                {editable && (
                  <th className="text-left p-2 w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      className={someSelected && !allSelected ? "data-[state=checked]:bg-slate-400" : ""}
                    />
                  </th>
                )}
                <th className="text-left p-2 w-12 text-xs font-medium text-slate-600">#</th>
                
                {/* Keyword */}
                <th className="text-left p-2 min-w-[150px]">
                  <ColumnHeader
                    field="keyword"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.keyword}
                  >
                    Keyword
                  </ColumnHeader>
                </th>
                
                {/* Brand */}
                <th className="text-left p-2 min-w-[80px]">
                  <ColumnHeader
                    field="brand"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.brand}
                  >
                    Brand
                  </ColumnHeader>
                </th>
                
                {/* Category */}
                <th className="text-left p-2 min-w-[100px]">
                  <ColumnHeader
                    field="category"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.category}
                  >
                    Category
                  </ColumnHeader>
                </th>
                
                {/* Relevance */}
                <th className="text-left p-2 min-w-[100px]">
                  <ColumnHeader
                    field="relevance_score"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.relevance_score}
                  >
                    Relevance
                  </ColumnHeader>
                </th>
                
                {/* Volume */}
                <th className="text-left p-2 min-w-[100px]">
                  <ColumnHeader
                    field="search_volume"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.volume}
                  >
                    Volume
                  </ColumnHeader>
                </th>
                
                {/* Difficulty */}
                <th className="text-left p-2 min-w-[100px]">
                  <ColumnHeader
                    field="difficulty"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.difficulty}
                  >
                    Difficulty
                  </ColumnHeader>
                </th>
                
                {/* Chance */}
                <th className="text-left p-2 min-w-[90px]">
                  <ColumnHeader
                    field="chance"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.chance}
                  >
                    Chance
                  </ColumnHeader>
                </th>
                
                {/* KEI */}
                <th className="text-left p-2 min-w-[80px]">
                  <ColumnHeader
                    field="kei"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.kei}
                  >
                    KEI
                  </ColumnHeader>
                </th>
                
                {/* Results */}
                <th className="text-left p-2 min-w-[90px]">
                  <ColumnHeader
                    field="results"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.results}
                  >
                    Results
                  </ColumnHeader>
                </th>
                
                {/* Max Reach */}
                <th className="text-left p-2 min-w-[110px]">
                  <ColumnHeader
                    field="maximum_reach"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.maximum_reach}
                  >
                    Max Reach
                  </ColumnHeader>
                </th>
                
                {/* Priority */}
                <th className="text-left p-2 min-w-[90px]">
                  <ColumnHeader
                    field="priority"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.priority}
                  >
                    Priority
                  </ColumnHeader>
                </th>
                
                {/* Platform */}
                <th className="text-left p-2 min-w-[90px]">
                  <ColumnHeader
                    field="platform"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.platform}
                  >
                    Platform
                  </ColumnHeader>
                </th>
                
                {/* Recommended */}
                <th className="text-left p-2 min-w-[130px]">
                  <ColumnHeader
                    field="recommended_field"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    tooltip={METRIC_DESCRIPTIONS.recommended_field}
                  >
                    Recommended
                  </ColumnHeader>
                </th>
                
                {/* Density */}
                {appData && (
                  <th className="text-left p-2 min-w-[90px]">
                    <ColumnHeader
                      field="density"
                      currentSortField={sortField}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                      tooltip={METRIC_DESCRIPTIONS.density}
                    >
                      Density
                    </ColumnHeader>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedKeywords.length === 0 ? (
                <tr>
                  <td colSpan={getColumnCount()} className="text-center p-8 text-slate-500">
                    No keywords found
                  </td>
                </tr>
              ) : (
                paginatedKeywords.map((keyword, index) => (
                  <tr key={keyword.id} className="border-b hover:bg-slate-50">
                    {editable && (
                      <td className="p-2">
                        <Checkbox
                          checked={selectedIds.has(keyword.id)}
                          onCheckedChange={() => handleSelectKeyword(keyword.id)}
                        />
                      </td>
                    )}
                    <td className="p-2 text-slate-500 text-sm">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    
                    {/* Keyword */}
                    <td className="p-2 font-medium text-sm">{keyword.keyword}</td>
                    
                    {/* Brand */}
                    <td className="p-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${keyword.brand ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {keyword.brand ? 'Yes' : 'No'}
                      </span>
                    </td>
                    
                    {/* Category */}
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(keyword.category)}`}
                      >
                        {keyword.category}
                      </span>
                    </td>
                    
                    {/* Relevance */}
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{keyword.relevance_score.toFixed(1)}</span>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${keyword.relevance_score > 80 ? 'bg-green-400' : keyword.relevance_score > 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(keyword.relevance_score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    {/* Volume */}
                    <td className="p-2 text-sm">{keyword.search_volume.toLocaleString('en-US')}</td>
                    
                    {/* Difficulty */}
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{keyword.difficulty.toFixed(1)}</span>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${keyword.difficulty > 70 ? 'bg-red-400' : keyword.difficulty > 40 ? 'bg-yellow-400' : 'bg-green-400'}`}
                            style={{ width: `${Math.min(keyword.difficulty, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    {/* Chance */}
                    <td className="p-2 text-sm">
                      {keyword.chance !== undefined && keyword.chance !== null ? `${keyword.chance.toFixed(1)}%` : '—'}
                    </td>
                    
                    {/* KEI */}
                    <td className="p-2 text-sm">
                      {keyword.kei !== undefined && keyword.kei !== null ? keyword.kei.toFixed(1) : '—'}
                    </td>
                    
                    {/* Results */}
                    <td className="p-2 text-sm">
                      {keyword.results !== undefined && keyword.results !== null ? keyword.results.toLocaleString('en-US') : '—'}
                    </td>
                    
                    {/* Max Reach */}
                    <td className="p-2 text-sm">
                      {keyword.maximum_reach !== undefined && keyword.maximum_reach !== null ? keyword.maximum_reach.toLocaleString('en-US') : '—'}
                    </td>
                    
                    {/* Priority */}
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(keyword.priority)}`}
                      >
                        {keyword.priority}
                      </span>
                    </td>
                    
                    {/* Platform */}
                    <td className="p-2">
                      <span className="text-xs text-slate-600 capitalize">{keyword.platform}</span>
                    </td>
                    
                    {/* Recommended */}
                    <td className="p-2">
                      <span className="text-xs text-slate-600 capitalize">
                        {keyword.recommended_field || "—"}
                      </span>
                    </td>
                    
                    {/* Density */}
                    {appData && (
                      <td className="p-2">
                        <span className="text-xs text-slate-600">{(keyword as any).density?.toFixed(1) || "0.0"}%</span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </TooltipProvider>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} keywords
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteSelected}
        title="Delete Keywords"
        description={`Are you sure you want to delete ${selectedKeywords.length} selected keyword(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Card>
  )
}
