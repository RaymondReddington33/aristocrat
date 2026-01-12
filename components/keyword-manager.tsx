"use client"

import { useState, useEffect, memo } from "react"
import { Plus, Upload, Download, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { KeywordTable } from "@/components/keyword-table"
import { useToast } from "@/hooks/use-toast"
import type { AppKeyword } from "@/lib/types"
import {
  getKeywords,
  saveKeyword,
  deleteKeyword,
  bulkImportKeywords,
  bulkDeleteKeywords,
  generateOptimizedKeywordSetsAction,
} from "@/app/actions"
import { exportKeywordsToCSV, exportOptimizedSetsToCSV, downloadCSV } from "@/lib/export-utils"
import { parseKeywordsFromCSV } from "@/lib/import-utils"
import { demoKeywords } from "@/lib/demo-keywords"
import { calculateKeywordPriority, recommendField } from "@/lib/keyword-optimizer"

interface KeywordManagerProps {
  appId: string | null
  initialKeywords?: AppKeyword[]
}

export const KeywordManager = memo(function KeywordManager({ appId, initialKeywords, appName }: KeywordManagerProps) {
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<AppKeyword[]>(initialKeywords || [])
  const [loading, setLoading] = useState(false)
  const [optimizedSets, setOptimizedSets] = useState<any>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDemoDialog, setShowDemoDialog] = useState(false)
  const [demoDialogDescription, setDemoDialogDescription] = useState("")
  const [newKeyword, setNewKeyword] = useState<Partial<AppKeyword>>({
    keyword: "",
    search_volume: 0,
    difficulty: 0,
    relevance_score: 0,
    category: "generic",
    priority: "medium",
    platform: "both",
    recommended_field: undefined,
  })

  // Initialize keywords from props if provided (pre-loaded server-side), otherwise load client-side
  useEffect(() => {
    if (initialKeywords) {
      setKeywords(initialKeywords)
      setLoading(false)
    } else if (appId) {
      // Only load client-side if not provided initially
      loadKeywords()
    }
  }, [appId, initialKeywords])

  const loadKeywords = async () => {
    if (!appId) return
    setLoading(true)
    try {
      const data = await getKeywords(appId)
      setKeywords(data)
    } catch (error) {
      console.error("Error loading keywords:", error)
      toast({
        title: "Error",
        description: "Failed to load keywords",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKeyword = async () => {
    if (!appId || !newKeyword.keyword) {
      toast({
        title: "Error",
        description: "Please fill in the keyword",
        variant: "destructive",
      })
      return
    }

    try {
      // Calculate priority automatically if not set or invalid
      let calculatedPriority = newKeyword.priority
      if (!calculatedPriority || !["high", "medium", "low"].includes(calculatedPriority)) {
        calculatedPriority = calculateKeywordPriority(newKeyword as any)
      }

      // Calculate recommended_field automatically if not set or invalid
      let calculatedRecommendedField = newKeyword.recommended_field
      if (!calculatedRecommendedField || !["title", "subtitle", "keywords", "description"].includes(calculatedRecommendedField)) {
        const targetPlatform = newKeyword.platform === "android" ? "android" : "ios"
        calculatedRecommendedField = recommendField(newKeyword as any, targetPlatform)
      }

      const result = await saveKeyword({
        ...newKeyword,
        priority: calculatedPriority,
        recommended_field: calculatedRecommendedField,
        app_data_id: appId,
      } as any)

      if (result.success) {
        toast({
          title: "Success",
          description: "Keyword saved successfully",
        })
        setShowAddDialog(false)
        setNewKeyword({
          keyword: "",
          search_volume: 0,
          difficulty: 0,
          relevance_score: 0,
          category: "generic",
          priority: "medium",
          platform: "both",
        })
        loadKeywords()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    setDeleteKeywordId(id)
  }

  const confirmDeleteKeyword = async () => {
    if (!deleteKeywordId) return

    try {
      const result = await deleteKeyword(deleteKeywordId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Keyword deleted successfully",
        })
        loadKeywords()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  const handleImportCSV = async (file: File) => {
    if (!appId) {
      toast({
        title: "Error",
        description: "Please save app data first",
        variant: "destructive",
      })
      return
    }

    try {
      const parsed = await parseKeywordsFromCSV(file, appName)
      
      if (!parsed || parsed.length === 0) {
        toast({
          title: "Error",
          description: "No valid keywords found in CSV file",
          variant: "destructive",
        })
        return
      }

      // Filter out duplicates based on existing keywords
      const existingKeywords = keywords.map(k => k.keyword.toLowerCase())
      const newKeywords = parsed.filter(k => !existingKeywords.includes(k.keyword.toLowerCase()))
      
      if (newKeywords.length === 0) {
        toast({
          title: "Info",
          description: "All keywords from CSV already exist",
          variant: "default",
        })
        setShowImportDialog(false)
        return
      }

      const keywordsWithAppId = newKeywords.map((k) => ({ 
        ...k, 
        app_data_id: appId,
        category: (k.category && ["branded", "generic", "competitor"].includes(k.category)) 
          ? k.category 
          : "generic",
        priority: (k.priority && ["high", "medium", "low"].includes(k.priority)) 
          ? k.priority 
          : "medium",
        platform: (k.platform && ["ios", "android", "both"].includes(k.platform)) 
          ? k.platform 
          : "both",
      }))

      const result = await bulkImportKeywords(keywordsWithAppId)

      if (result.success) {
        toast({
          title: "Success",
          description: `Imported ${result.count} keywords${newKeywords.length !== parsed.length ? ` (${parsed.length - newKeywords.length} duplicates skipped)` : ''}`,
        })
        setShowImportDialog(false)
        loadKeywords()
      } else {
        throw new Error(result.error || "Failed to import keywords")
      }
    } catch (error) {
      console.error("CSV import error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = () => {
    const csv = exportKeywordsToCSV(keywords)
    downloadCSV(csv, `keywords_${new Date().toISOString().split("T")[0]}.csv`)
    toast({
      title: "Success",
      description: "Keywords exported to CSV",
    })
  }

  const handleGenerateOptimizedSets = async () => {
    if (!appId) return

    try {
      const sets = await generateOptimizedKeywordSetsAction(appId)
      setOptimizedSets(sets)
      toast({
        title: "Success",
        description: "Optimized keyword sets generated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  const handleLoadDemoClick = async () => {
    if (!appId) {
      toast({
        title: "Error",
        description: "Please save app data first",
        variant: "destructive",
      })
      return
    }
    
    // Check existing keywords to set dialog description
    try {
      const existingKeywords = await getKeywords(appId)
      if (existingKeywords.length > 0) {
        setDemoDialogDescription(
          `You already have ${existingKeywords.length} keyword(s). Loading demo keywords will add them to your existing list. Continue?`
        )
      } else {
        setDemoDialogDescription("Load demo keywords? This will add sample keyword data to your app.")
      }
    } catch (error) {
      setDemoDialogDescription("Load demo keywords? This will add sample keyword data to your app.")
    }
    
    setShowDemoDialog(true)
  }

  const handleLoadDemo = async () => {
    setShowDemoDialog(false)
    
    if (!appId) return

    try {
      // Note: We already checked existing keywords in handleLoadDemoClick

      // Map demo keywords and ensure all required fields are present
      // Calculate priority and recommended_field automatically if not provided
      const keywordsWithAppId = demoKeywords.map((k) => {
        const keywordData: any = {
          keyword: k.keyword,
          search_volume: k.search_volume || 0,
          difficulty: k.difficulty || 0,
          relevance_score: k.relevance_score || 0,
          category: k.category || "generic",
          platform: k.platform || "both",
          brand: k.brand,
          chance: k.chance,
          kei: k.kei,
          results: k.results,
          maximum_reach: k.maximum_reach,
          conversion_rate: k.conversion_rate,
        }

        // Calculate priority automatically if not provided or invalid
        let calculatedPriority = k.priority
        if (!calculatedPriority || !["high", "medium", "low"].includes(calculatedPriority)) {
          calculatedPriority = calculateKeywordPriority(keywordData)
        }

        // Calculate recommended_field automatically if not provided or invalid
        let calculatedRecommendedField = k.recommended_field
        if (!calculatedRecommendedField || !["title", "subtitle", "keywords", "description"].includes(calculatedRecommendedField)) {
          const targetPlatform = keywordData.platform === "android" ? "android" : "ios"
          calculatedRecommendedField = recommendField(keywordData, targetPlatform)
        }

        return {
          app_data_id: appId,
          keyword: k.keyword,
          search_volume: keywordData.search_volume,
          difficulty: keywordData.difficulty,
          relevance_score: keywordData.relevance_score,
          category: keywordData.category,
          priority: calculatedPriority,
          platform: keywordData.platform,
          recommended_field: calculatedRecommendedField,
          brand: keywordData.brand,
          chance: keywordData.chance,
          kei: keywordData.kei,
          results: keywordData.results,
          maximum_reach: keywordData.maximum_reach,
          conversion_rate: keywordData.conversion_rate,
          sort_order: k.sort_order || 0,
        }
      })

      const result = await bulkImportKeywords(keywordsWithAppId)

      if (result.success) {
        toast({
          title: "Success",
          description: `Loaded ${result.count} demo keywords`,
        })
        loadKeywords()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load demo keywords",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading demo keywords:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    }
  }

  // Show loading only if no initial keywords provided and we're loading
  if (loading && !initialKeywords) {
    return (
      <div className="text-center p-8">
        <div className="text-slate-500">Loading keywords...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Keyword</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Keyword *</Label>
                  <Input
                    value={newKeyword.keyword || ""}
                    onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                    placeholder="e.g., casino, slots"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Search Volume</Label>
                    <Input
                      type="number"
                      value={newKeyword.search_volume || 0}
                      onChange={(e) =>
                        setNewKeyword({ ...newKeyword, search_volume: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Difficulty (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newKeyword.difficulty || 0}
                      onChange={(e) =>
                        setNewKeyword({ ...newKeyword, difficulty: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Relevance Score (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newKeyword.relevance_score || 0}
                      onChange={(e) =>
                        setNewKeyword({ ...newKeyword, relevance_score: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newKeyword.category}
                      onValueChange={(value: any) => setNewKeyword({ ...newKeyword, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="branded">Branded</SelectItem>
                        <SelectItem value="generic">Generic</SelectItem>
                        <SelectItem value="competitor">Competitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newKeyword.priority}
                      onValueChange={(value: any) => setNewKeyword({ ...newKeyword, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <Select
                      value={newKeyword.platform}
                      onValueChange={(value: any) => setNewKeyword({ ...newKeyword, platform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ios">iOS</SelectItem>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recommended Field</Label>
                    <Select
                      value={newKeyword.recommended_field || "auto"}
                      onValueChange={(value: any) =>
                        setNewKeyword({ ...newKeyword, recommended_field: value === "auto" ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="subtitle">Subtitle</SelectItem>
                        <SelectItem value="keywords">Keywords</SelectItem>
                        <SelectItem value="description">Description</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveKeyword}>Save Keyword</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Keywords from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleImportCSV(file)
                      }
                      // Reset input to allow re-uploading same file
                      e.target.value = ""
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-medium">Required columns:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Keyword (required)</li>
                    <li>Search Volume (optional, defaults to 0)</li>
                    <li>Difficulty (optional, defaults to 0)</li>
                    <li>Relevance Score (optional, defaults to 0)</li>
                    <li>Category: branded, generic, or competitor (optional, defaults to generic)</li>
                    <li>Priority: high, medium, or low (optional, defaults to medium)</li>
                    <li>Platform: ios, android, or both (optional, defaults to both)</li>
                    <li>Recommended Field: title, subtitle, keywords, or description (optional)</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" onClick={handleGenerateOptimizedSets}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Optimized Sets
          </Button>

          <Button variant="outline" onClick={handleLoadDemo}>
            Load Demo Keywords
          </Button>
        </div>
      </div>

      {/* Optimized Sets Display */}
      {optimizedSets && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Optimized Keyword Sets
            </CardTitle>
            <CardDescription>AI-generated optimized keyword sets for maximum visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">iOS Keywords</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Title:</span> {optimizedSets.ios.title.join(", ")}
                  </div>
                  <div>
                    <span className="font-medium">Subtitle:</span> {optimizedSets.ios.subtitle.join(", ")}
                  </div>
                  <div>
                    <span className="font-medium">Keywords Field ({optimizedSets.ios.keywordsField.length}/100 chars):</span>
                    <div className="mt-1 p-2 bg-white rounded border font-mono text-xs">
                      {optimizedSets.ios.keywordsField}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Android Keywords</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Title:</span> {optimizedSets.android.title.join(", ")}
                  </div>
                  <div>
                    <span className="font-medium">Short Description:</span> {optimizedSets.android.shortDescription.join(", ")}
                  </div>
                  <div>
                    <span className="font-medium">Full Description:</span> {optimizedSets.android.fullDescription.join(", ")}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = exportOptimizedSetsToCSV(optimizedSets)
                downloadCSV(csv, `optimized_keyword_sets_${new Date().toISOString().split("T")[0]}.csv`)
                toast({
                  title: "Success",
                  description: "Optimized sets exported to CSV",
                })
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Sets to CSV
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Keywords Table */}
      <KeywordTable
        keywords={keywords}
        editable={true}
        showFilters={true}
        onKeywordsDelete={async (keywordIds) => {
          try {
            const result = await bulkDeleteKeywords(keywordIds)
            if (result.success) {
              toast({
                title: "Success",
                description: `Deleted ${result.count} keyword(s)`,
              })
              loadKeywords()
            } else {
              throw new Error(result.error)
            }
          } catch (error) {
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : String(error),
              variant: "destructive",
            })
          }
        }}
        onKeywordsExport={(selectedKeywords) => {
          const csv = exportKeywordsToCSV(selectedKeywords)
          downloadCSV(csv, `selected_keywords_${new Date().toISOString().split("T")[0]}.csv`)
          toast({
            title: "Success",
            description: `Exported ${selectedKeywords.length} keyword(s) to CSV`,
          })
        }}
      />
    </div>
  )
})
