"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, Trash2, Download, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface KeywordResearchRow {
  keyword: string
  brand: boolean
  category: string
  relevancy_score: number
  volume: number
  difficulty: number
  chance: number
  kei: number
  results: number
  maximum_reach: number
  priority: string
  platform: string
  recommended_field: string
}

interface KeywordResearchUploadProps {
  data: KeywordResearchRow[]
  onChange?: (data: KeywordResearchRow[]) => void
  onSave?: () => void
  editable?: boolean
}

// Demo keyword research data
const DEMO_KEYWORD_RESEARCH: KeywordResearchRow[] = [
  { keyword: "redrain slots casino", brand: true, category: "branded", relevancy_score: 95, volume: 12000, difficulty: 50, chance: 0.7, kei: 150, results: 200000, maximum_reach: 500000, priority: "high", platform: "both", recommended_field: "title" },
  { keyword: "redrain", brand: true, category: "branded", relevancy_score: 98, volume: 8500, difficulty: 30, chance: 0.95, kei: 280, results: 1200, maximum_reach: 8500, priority: "high", platform: "both", recommended_field: "title" },
  { keyword: "redrain casino", brand: true, category: "branded", relevancy_score: 97, volume: 6500, difficulty: 35, chance: 0.85, kei: 185.7, results: 800, maximum_reach: 6500, priority: "high", platform: "both", recommended_field: "title" },
  { keyword: "casino slots", brand: false, category: "generic", relevancy_score: 96, volume: 50000, difficulty: 30, chance: 0.6, kei: 1666, results: 1500000, maximum_reach: 1000000, priority: "high", platform: "both", recommended_field: "subtitle" },
  { keyword: "slots casino", brand: false, category: "generic", relevancy_score: 94, volume: 45000, difficulty: 25, chance: 0.65, kei: 1800, results: 1200000, maximum_reach: 800000, priority: "high", platform: "android", recommended_field: "title" },
  { keyword: "free slots", brand: false, category: "generic", relevancy_score: 97, volume: 47000, difficulty: 15, chance: 0.55, kei: 3133, results: 1100000, maximum_reach: 600000, priority: "high", platform: "android", recommended_field: "subtitle" },
  { keyword: "jackpot", brand: false, category: "generic", relevancy_score: 89, volume: 245000, difficulty: 75, chance: 0.45, kei: 3266, results: 3000000, maximum_reach: 2000000, priority: "high", platform: "both", recommended_field: "keywords" },
  { keyword: "slots", brand: false, category: "generic", relevancy_score: 95, volume: 320000, difficulty: 78, chance: 0.45, kei: 4100, results: 45000, maximum_reach: 320000, priority: "high", platform: "both", recommended_field: "keywords" },
  { keyword: "casino games", brand: false, category: "generic", relevancy_score: 92, volume: 280000, difficulty: 75, chance: 0.42, kei: 3733, results: 38000, maximum_reach: 280000, priority: "high", platform: "both", recommended_field: "keywords" },
  { keyword: "heart of vegas", brand: false, category: "competitor", relevancy_score: 75, volume: 450000, difficulty: 95, chance: 0.05, kei: 4737, results: 800000, maximum_reach: 450000, priority: "low", platform: "both", recommended_field: "description" },
  { keyword: "cashman casino", brand: false, category: "competitor", relevancy_score: 72, volume: 320000, difficulty: 92, chance: 0.08, kei: 3478, results: 650000, maximum_reach: 320000, priority: "low", platform: "both", recommended_field: "description" },
  { keyword: "vegas", brand: false, category: "generic", relevancy_score: 82, volume: 180000, difficulty: 70, chance: 0.3, kei: 2571, results: 2500000, maximum_reach: 1500000, priority: "medium", platform: "both", recommended_field: "keywords" },
  { keyword: "cleopatra slots", brand: false, category: "generic", relevancy_score: 90, volume: 12000, difficulty: 20, chance: 0.5, kei: 600, results: 800000, maximum_reach: 500000, priority: "medium", platform: "both", recommended_field: "keywords" },
  { keyword: "egyptian slots", brand: false, category: "generic", relevancy_score: 93, volume: 38000, difficulty: 50, chance: 0.66, kei: 760, results: 3200, maximum_reach: 38000, priority: "medium", platform: "both", recommended_field: "keywords" },
  { keyword: "pharaoh slots", brand: false, category: "generic", relevancy_score: 94, volume: 62000, difficulty: 52, chance: 0.68, kei: 1192, results: 5400, maximum_reach: 62000, priority: "high", platform: "both", recommended_field: "keywords" },
  { keyword: "egypt slots", brand: false, category: "generic", relevancy_score: 96, volume: 88000, difficulty: 58, chance: 0.65, kei: 1517, results: 8200, maximum_reach: 88000, priority: "high", platform: "both", recommended_field: "keywords" },
  { keyword: "ancient treasure slots", brand: false, category: "generic", relevancy_score: 88, volume: 25000, difficulty: 40, chance: 0.58, kei: 625, results: 3500, maximum_reach: 25000, priority: "medium", platform: "both", recommended_field: "keywords" },
  { keyword: "pyramid slots", brand: false, category: "generic", relevancy_score: 87, volume: 18000, difficulty: 35, chance: 0.62, kei: 514, results: 2800, maximum_reach: 18000, priority: "medium", platform: "both", recommended_field: "keywords" },
  { keyword: "cleopatra casino", brand: false, category: "generic", relevancy_score: 85, volume: 15000, difficulty: 38, chance: 0.6, kei: 395, results: 3200, maximum_reach: 15000, priority: "medium", platform: "both", recommended_field: "keywords" },
]

// Helper function to format numbers consistently (avoid hydration mismatch)
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function KeywordResearchUpload({ data, onChange, onSave, editable = true }: KeywordResearchUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleLoadDemo = useCallback(async () => {
    if (onChange) {
      onChange(DEMO_KEYWORD_RESEARCH)
    }
    setError(null)
    // Auto-save after loading demo data
    if (onSave) {
      setIsSaving(true)
      // Small delay to ensure state is updated
      setTimeout(async () => {
        await onSave()
        setIsSaving(false)
      }, 100)
    }
  }, [onChange, onSave])

  const parseCSV = useCallback((csvText: string): KeywordResearchRow[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row")
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, '').replace(/ /g, '_'))
    
    const rows: KeywordResearchRow[] = []
    const seenKeywords = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Handle CSV with quoted fields
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const keyword = values[header.indexOf('keyword')]?.replace(/"/g, '') || ''
      
      // Skip duplicates
      if (seenKeywords.has(keyword.toLowerCase())) continue
      seenKeywords.add(keyword.toLowerCase())

      const row: KeywordResearchRow = {
        keyword,
        brand: values[header.indexOf('brand')]?.toUpperCase() === 'TRUE',
        category: values[header.indexOf('category')]?.replace(/"/g, '') || 'generic',
        relevancy_score: parseFloat(values[header.indexOf('relevancy_score')] || '0') || 0,
        volume: parseInt(values[header.indexOf('volume')] || '0') || 0,
        difficulty: parseFloat(values[header.indexOf('difficulty')] || '0') || 0,
        chance: parseFloat(values[header.indexOf('chance')] || '0') || 0,
        kei: parseFloat(values[header.indexOf('kei')] || '0') || 0,
        results: parseInt(values[header.indexOf('results')] || '0') || 0,
        maximum_reach: parseInt(values[header.indexOf('maximum_reach')] || '0') || 0,
        priority: values[header.indexOf('priority')]?.replace(/"/g, '') || 'medium',
        platform: values[header.indexOf('platform')]?.replace(/"/g, '') || 'both',
        recommended_field: values[header.indexOf('recommended_field')]?.replace(/"/g, '') || '',
      }

      if (row.keyword) {
        rows.push(row)
      }
    }

    return rows
  }, [])

  const handleFileUpload = useCallback((file: File) => {
    setError(null)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsedData = parseCSV(text)
        if (onChange) {
          onChange(parsedData)
        }
        // Auto-save after uploading CSV
        if (onSave) {
          setIsSaving(true)
          setTimeout(async () => {
            await onSave()
            setIsSaving(false)
          }, 100)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV file")
      }
    }
    reader.onerror = () => {
      setError("Failed to read file")
    }
    reader.readAsText(file)
  }, [parseCSV, onChange, onSave])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      handleFileUpload(file)
    } else {
      setError("Please upload a CSV file")
    }
  }, [handleFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleClear = useCallback(() => {
    if (onChange) {
      onChange([])
    }
    setError(null)
  }, [onChange])

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'branded': return 'bg-purple-100 text-purple-800'
      case 'competitor': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'low': return 'bg-gray-100 text-gray-600'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-4">
      {editable && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p className="text-sm text-slate-600 mb-2">
            Drag and drop your keyword research CSV here, or
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                disabled={isSaving}
              />
              <Button type="button" variant="outline" size="sm" className="cursor-pointer" disabled={isSaving} asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </span>
              </Button>
            </label>
            <span className="text-slate-400 text-sm">or</span>
            <Button 
              type="button" 
              size="sm" 
              onClick={handleLoadDemo}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Load Demo Research"}
            </Button>
          </div>
          {isSaving && (
            <p className="text-xs text-blue-600 mt-2 flex items-center justify-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Auto-saving to database...
            </p>
          )}
          <p className="text-xs text-slate-500 mt-3">
            Expected columns: Keyword, Brand, Category, Relevancy Score, Volume, Difficulty, Chance, KEI, Results, Maximum Reach, Priority, Platform, Recommended Field
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Keyword Research Data</CardTitle>
                <CardDescription>{data.length} keywords imported (duplicates removed)</CardDescription>
              </div>
              {editable && (
                <Button variant="outline" size="sm" onClick={handleClear} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editable ? (
              // Full table with all columns for admin/edit mode
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Keyword</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold text-right">Volume</TableHead>
                      <TableHead className="font-semibold text-right">Difficulty</TableHead>
                      <TableHead className="font-semibold text-right">Chance</TableHead>
                      <TableHead className="font-semibold text-right">KEI</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Platform</TableHead>
                      <TableHead className="font-semibold">Recommended</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          {row.keyword}
                          {row.brand && <Badge variant="outline" className="ml-2 text-xs">Brand</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(row.category)}>{row.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.volume)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {row.difficulty}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(row.chance * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {row.kei.toFixed(0)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(row.priority)}>{row.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{row.platform}</TableCell>
                        <TableCell className="text-sm text-slate-600">{row.recommended_field}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // Simple list view for preview/reference mode - only keywords
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {data.map((row, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-2 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900">{row.keyword}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data.length === 0 && !editable && (
        <div className="text-center py-12 text-slate-500">
          <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No keyword research data uploaded yet.</p>
        </div>
      )}
    </div>
  )
}
