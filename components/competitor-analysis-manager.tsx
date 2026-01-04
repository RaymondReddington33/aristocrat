"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ExternalLink, Link2, Image as ImageIcon, X, TrendingUp, TrendingDown, Target, Search, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export interface Competitor {
  id: string
  name: string
  appStoreUrl?: string
  playStoreUrl?: string
  iconUrl?: string
  strengths?: string[]
  weaknesses?: string[]
  ourAdvantage?: string
  keywords?: string[]
  notes?: string
}

interface CompetitorAnalysisManagerProps {
  competitors?: Competitor[]
  onChange?: (competitors: Competitor[]) => void
  editable?: boolean
}

export function CompetitorAnalysisManager({ 
  competitors = [], 
  onChange, 
  editable = true 
}: CompetitorAnalysisManagerProps) {
  const [localCompetitors, setLocalCompetitors] = useState<Competitor[]>(competitors)
  const { toast } = useToast()

  useEffect(() => {
    setLocalCompetitors(competitors)
  }, [competitors])

  const handleAddCompetitor = () => {
    const newCompetitor: Competitor = {
      id: crypto.randomUUID(),
      name: "",
      strengths: [],
      weaknesses: [],
      keywords: [],
      ourAdvantage: "",
      notes: "",
    }
    const updated = [...localCompetitors, newCompetitor]
    setLocalCompetitors(updated)
    onChange?.(updated)
  }

  const handleRemoveCompetitor = (id: string) => {
    const updated = localCompetitors.filter(c => c.id !== id)
    setLocalCompetitors(updated)
    onChange?.(updated)
  }

  const handleCompetitorChange = (id: string, field: keyof Competitor, value: any) => {
    const updated = localCompetitors.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    )
    setLocalCompetitors(updated)
    onChange?.(updated)
  }

  const handleArrayItemAdd = (id: string, field: "strengths" | "weaknesses" | "keywords", value: string) => {
    const competitor = localCompetitors.find(c => c.id === id)
    if (!competitor) return
    
    const currentArray = competitor[field] || []
    const updated = localCompetitors.map(c =>
      c.id === id ? { ...c, [field]: [...currentArray, value] } : c
    )
    setLocalCompetitors(updated)
    onChange?.(updated)
  }

  const handleArrayItemRemove = (id: string, field: "strengths" | "weaknesses" | "keywords", index: number) => {
    const competitor = localCompetitors.find(c => c.id === id)
    if (!competitor) return
    
    const currentArray = competitor[field] || []
    const updated = localCompetitors.map(c =>
      c.id === id ? { ...c, [field]: currentArray.filter((_, i) => i !== index) } : c
    )
    setLocalCompetitors(updated)
    onChange?.(updated)
  }

  const fetchAppIcon = async (url: string, competitorId: string) => {
    try {
      // Try to extract app ID from URL and fetch icon
      // This is a placeholder - you might want to use an API or scraper
      toast({
        title: "Icon fetch",
        description: "Manual icon URL entry recommended for best results",
      })
    } catch (error) {
      console.error("Error fetching icon:", error)
    }
  }

  if (!editable && localCompetitors.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {localCompetitors.map((competitor, index) => (
        <Card key={competitor.id} className="relative border-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon Preview/Upload */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {competitor.iconUrl ? (
                      <Image
                        src={competitor.iconUrl}
                        alt={competitor.name || "Competitor icon"}
                        width={80}
                        height={80}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  {editable && (
                    <div className="mt-2">
                      <Input
                        type="text"
                        placeholder="Icon URL"
                        value={competitor.iconUrl || ""}
                        onChange={(e) => handleCompetitorChange(competitor.id, "iconUrl", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  )}
                </div>

                {/* Name and URLs */}
                <div className="flex-1 min-w-0">
                  {editable ? (
                    <Input
                      placeholder="Competitor Name"
                      value={competitor.name}
                      onChange={(e) => handleCompetitorChange(competitor.id, "name", e.target.value)}
                      className="text-lg font-semibold mb-2"
                    />
                  ) : (
                    <CardTitle className="text-xl mb-2">{competitor.name || "Unnamed Competitor"}</CardTitle>
                  )}
                  
                  {editable && (
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-1 mb-1">
                          <Link2 className="h-3 w-3 text-slate-500" />
                          <Label className="text-xs text-slate-600">App Store</Label>
                        </div>
                        <Input
                          type="url"
                          placeholder="https://apps.apple.com/..."
                          value={competitor.appStoreUrl || ""}
                          onChange={(e) => handleCompetitorChange(competitor.id, "appStoreUrl", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-1 mb-1">
                          <Link2 className="h-3 w-3 text-slate-500" />
                          <Label className="text-xs text-slate-600">Play Store</Label>
                        </div>
                        <Input
                          type="url"
                          placeholder="https://play.google.com/..."
                          value={competitor.playStoreUrl || ""}
                          onChange={(e) => handleCompetitorChange(competitor.id, "playStoreUrl", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompetitor(competitor.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Links (read-only mode) */}
            {!editable && (competitor.appStoreUrl || competitor.playStoreUrl) && (
              <div className="flex gap-2 flex-wrap">
                {competitor.appStoreUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs"
                  >
                    <a href={competitor.appStoreUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      App Store
                    </a>
                  </Button>
                )}
                {competitor.playStoreUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs"
                  >
                    <a href={competitor.playStoreUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Play Store
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Keywords */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                Keywords
              </Label>
              {editable ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword"
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const value = e.currentTarget.value.trim()
                          if (value) {
                            handleArrayItemAdd(competitor.id, "keywords", value)
                            e.currentTarget.value = ""
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(competitor.keywords || []).map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          onClick={() => handleArrayItemRemove(competitor.id, "keywords", idx)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(competitor.keywords || []).map((keyword, idx) => (
                    <Badge key={idx} variant="secondary">{keyword}</Badge>
                  ))}
                  {(!competitor.keywords || competitor.keywords.length === 0) && (
                    <span className="text-sm text-slate-400">No keywords specified</span>
                  )}
                </div>
              )}
            </div>

            {/* Strengths */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2 text-green-700">
                <TrendingUp className="h-4 w-4" />
                Strengths
              </Label>
              {editable ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Add strength"
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          handleArrayItemAdd(competitor.id, "strengths", value)
                          e.currentTarget.value = ""
                        }
                      }
                    }}
                  />
                  <ul className="space-y-1">
                    {(competitor.strengths || []).map((strength, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">•</span>
                        <span className="flex-1">{strength}</span>
                        <button
                          onClick={() => handleArrayItemRemove(competitor.id, "strengths", idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className="space-y-1">
                  {(competitor.strengths || []).map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                  {(!competitor.strengths || competitor.strengths.length === 0) && (
                    <span className="text-sm text-slate-400">No strengths listed</span>
                  )}
                </ul>
              )}
            </div>

            {/* Weaknesses */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2 text-red-700">
                <TrendingDown className="h-4 w-4" />
                Weaknesses
              </Label>
              {editable ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Add weakness"
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          handleArrayItemAdd(competitor.id, "weaknesses", value)
                          e.currentTarget.value = ""
                        }
                      }
                    }}
                  />
                  <ul className="space-y-1">
                    {(competitor.weaknesses || []).map((weakness, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-red-600">•</span>
                        <span className="flex-1">{weakness}</span>
                        <button
                          onClick={() => handleArrayItemRemove(competitor.id, "weaknesses", idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className="space-y-1">
                  {(competitor.weaknesses || []).map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                  {(!competitor.weaknesses || competitor.weaknesses.length === 0) && (
                    <span className="text-sm text-slate-400">No weaknesses listed</span>
                  )}
                </ul>
              )}
            </div>

            {/* Our Advantage */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2 text-blue-700">
                <Target className="h-4 w-4" />
                Our Advantage
              </Label>
              {editable ? (
                <Textarea
                  placeholder="Describe our competitive advantage against this competitor..."
                  value={competitor.ourAdvantage || ""}
                  onChange={(e) => handleCompetitorChange(competitor.id, "ourAdvantage", e.target.value)}
                  className="text-sm min-h-[80px]"
                />
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {competitor.ourAdvantage || "No advantage specified"}
                </p>
              )}
            </div>

            {/* Notes */}
            {editable && (
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes
                </Label>
                <Textarea
                  placeholder="Additional notes about this competitor..."
                  value={competitor.notes || ""}
                  onChange={(e) => handleCompetitorChange(competitor.id, "notes", e.target.value)}
                  className="text-sm min-h-[60px]"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {editable && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddCompetitor}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      )}
    </div>
  )
}
