"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, TrendingUp, Target, DollarSign, BarChart3, Copy, Check, ArrowRight, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface KeywordGroup {
  id: string
  name: string
  keywords: string[]
  matchType: "exact" | "broad"
  cppEnabled: boolean
  cppId?: string
  dailyBudget?: number
  targetCPA?: number
}

interface AppleSearchAdsConfigProps {
  keywordGroups?: KeywordGroup[]
  onKeywordGroupsChange?: (groups: KeywordGroup[]) => void
  editable?: boolean
  defaultCPPId?: string
}

export function AppleSearchAdsConfig({ 
  keywordGroups = [], 
  onKeywordGroupsChange,
  editable = true,
  defaultCPPId = "CPP-001"
}: AppleSearchAdsConfigProps) {
  const { toast } = useToast()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [localGroups, setLocalGroups] = useState<KeywordGroup[]>(keywordGroups)

  const handleAddGroup = () => {
    const newGroup: KeywordGroup = {
      id: `group-${Date.now()}`,
      name: "New Keyword Group",
      keywords: [],
      matchType: "exact",
      cppEnabled: true,
      cppId: defaultCPPId,
      dailyBudget: 50,
      targetCPA: 2.5,
    }
    const updated = [...localGroups, newGroup]
    setLocalGroups(updated)
    onKeywordGroupsChange?.(updated)
  }

  const handleRemoveGroup = (id: string) => {
    const updated = localGroups.filter(g => g.id !== id)
    setLocalGroups(updated)
    onKeywordGroupsChange?.(updated)
  }

  const handleGroupChange = (id: string, field: keyof KeywordGroup, value: any) => {
    const updated = localGroups.map(group => 
      group.id === id ? { ...group, [field]: value } : group
    )
    setLocalGroups(updated)
    onKeywordGroupsChange?.(updated)
  }

  const handleKeywordsChange = (id: string, keywords: string) => {
    const keywordsArray = keywords.split('\n').filter(k => k.trim().length > 0)
    handleGroupChange(id, "keywords", keywordsArray)
  }

  const copyKeywords = async (keywords: string[], index: number) => {
    const text = keywords.join(', ')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast({
        title: "Copied!",
        description: "Keywords copied to clipboard",
      })
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Default groups if none provided
  const displayGroups = localGroups.length > 0 ? localGroups : [
    {
      id: "default-1",
      name: "High Volume - Slots",
      keywords: ["slots", "casino slots", "slot games"],
      matchType: "exact" as const,
      cppEnabled: true,
      cppId: defaultCPPId,
      dailyBudget: 100,
      targetCPA: 2.0,
    },
    {
      id: "default-2",
      name: "Egyptian Theme - High Relevance",
      keywords: ["egypt slots", "pharaoh slots", "cleopatra slots", "fortune slots"],
      matchType: "exact" as const,
      cppEnabled: true,
      cppId: defaultCPPId,
      dailyBudget: 75,
      targetCPA: 1.8,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">Apple Search Ads Campaigns</h3>
          <p className="text-sm text-slate-600 mt-1">
            Configure keyword groups and assign Custom Product Pages (CPP) for optimal performance
          </p>
        </div>
        {editable && (
          <Button onClick={handleAddGroup} type="button" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Campaign
          </Button>
        )}
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {displayGroups.map((group, index) => (
          <Card key={group.id} className="border-2 border-slate-200 hover:border-blue-300 transition-colors">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    {editable ? (
                      <Input
                        value={group.name}
                        onChange={(e) => handleGroupChange(group.id, "name", e.target.value)}
                        className="text-lg font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                        placeholder="Campaign Name"
                      />
                    ) : (
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                    )}
                    <Badge variant={group.matchType === "exact" ? "default" : "secondary"} className="ml-2">
                      {group.matchType === "exact" ? "Exact Match" : "Broad Match"}
                    </Badge>
                  </div>
                  {group.cppEnabled && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium">CPP:</span>
                      {editable ? (
                        <Input
                          value={group.cppId || ""}
                          onChange={(e) => handleGroupChange(group.id, "cppId", e.target.value)}
                          className="w-32 h-7 text-xs font-mono"
                          placeholder="CPP-001"
                        />
                      ) : (
                        <span className="font-mono text-blue-600">{group.cppId || defaultCPPId}</span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  )}
                </div>
                {editable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveGroup(group.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Keywords */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Keywords ({group.keywords.length})
                    </Label>
                    {group.keywords.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyKeywords(group.keywords, index)}
                        className="h-7 text-xs"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {editable ? (
                    <Textarea
                      value={group.keywords.join('\n')}
                      onChange={(e) => handleKeywordsChange(group.id, e.target.value)}
                      placeholder="Enter keywords, one per line&#10;slots&#10;casino slots&#10;egypt slots"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {group.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      {group.keywords.length === 0 && (
                        <p className="text-sm text-slate-400 italic">No keywords defined</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Campaign Settings
                    </Label>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Match Type</Label>
                      {editable ? (
                        <Select
                          value={group.matchType}
                          onValueChange={(value: "exact" | "broad") => handleGroupChange(group.id, "matchType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exact">Exact Match</SelectItem>
                            <SelectItem value="broad">Broad Match</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant={group.matchType === "exact" ? "default" : "secondary"}>
                            {group.matchType === "exact" ? "Exact Match" : "Broad Match"}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600 flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
                        Daily Budget (USD)
                      </Label>
                      {editable ? (
                        <Input
                          type="number"
                          value={group.dailyBudget || ""}
                          onChange={(e) => handleGroupChange(group.id, "dailyBudget", parseFloat(e.target.value) || 0)}
                          placeholder="50.00"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-900">
                          ${group.dailyBudget?.toFixed(2) || "0.00"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Target CPA (USD)
                      </Label>
                      {editable ? (
                        <Input
                          type="number"
                          value={group.targetCPA || ""}
                          onChange={(e) => handleGroupChange(group.id, "targetCPA", parseFloat(e.target.value) || 0)}
                          placeholder="2.50"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-900">
                          ${group.targetCPA?.toFixed(2) || "0.00"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-600">Custom Product Page</Label>
                        {editable ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={group.cppEnabled}
                              onChange={(e) => handleGroupChange(group.id, "cppEnabled", e.target.checked)}
                              className="rounded border-slate-300"
                            />
                          </div>
                        ) : (
                          <Badge variant={group.cppEnabled ? "default" : "outline"}>
                            {group.cppEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        )}
                      </div>
                      {group.cppEnabled && editable && (
                        <Input
                          value={group.cppId || ""}
                          onChange={(e) => handleGroupChange(group.id, "cppId", e.target.value)}
                          placeholder="CPP-001"
                          className="text-xs font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics (Read-only display) */}
                  {!editable && group.keywords.length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                      <Label className="text-xs text-slate-600">Estimated Performance</Label>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-slate-500">Keyword Count</div>
                          <div className="font-semibold text-slate-900">{group.keywords.length}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Match Type</div>
                          <div className="font-semibold text-slate-900 capitalize">{group.matchType}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      {displayGroups.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-600 mb-1">Total Campaigns</div>
                <div className="text-2xl font-bold text-slate-900">{displayGroups.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">Total Keywords</div>
                <div className="text-2xl font-bold text-slate-900">
                  {displayGroups.reduce((sum, g) => sum + g.keywords.length, 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">Total Daily Budget</div>
                <div className="text-2xl font-bold text-slate-900">
                  ${displayGroups.reduce((sum, g) => sum + (g.dailyBudget || 0), 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">CPP Campaigns</div>
                <div className="text-2xl font-bold text-blue-600">
                  {displayGroups.filter(g => g.cppEnabled).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {displayGroups.length === 0 && editable && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-600 mb-2">No campaigns configured</h4>
            <p className="text-sm text-slate-500 mb-4">
              Create your first Apple Search Ads campaign to get started
            </p>
            <Button onClick={handleAddGroup} type="button">
              <Plus className="h-4 w-4 mr-2" />
              Create First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
