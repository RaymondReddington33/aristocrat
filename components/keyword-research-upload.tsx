"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, Trash2, Download, AlertCircle } from "lucide-react"
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
  onChange: (data: KeywordResearchRow[]) => void
  editable?: boolean
}

export function KeywordResearchUpload({ data, onChange, editable = true }: KeywordResearchUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
        onChange(parsedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV file")
      }
    }
    reader.onerror = () => {
      setError("Failed to read file")
    }
    reader.readAsText(file)
  }, [parseCSV, onChange])

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
    onChange([])
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
          <label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <Button type="button" variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </span>
            </Button>
          </label>
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
                        {row.volume.toLocaleString()}
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
