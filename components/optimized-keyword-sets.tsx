"use client"

import { useState } from "react"
import { Copy, Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { downloadCSV, exportOptimizedSetsToCSV } from "@/lib/export-utils"
import type { AppKeyword } from "@/lib/types"
import { generateOptimizedKeywordSets } from "@/lib/keyword-optimizer"

interface OptimizedSetsProps {
  keywords: AppKeyword[]
}

export function OptimizedSets({ keywords }: OptimizedSetsProps) {
  const { toast } = useToast()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const optimized = generateOptimizedKeywordSets(keywords)

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleExportAll = () => {
    const csv = exportOptimizedSetsToCSV(optimized)
    downloadCSV(csv, `optimized_keyword_sets_${new Date().toISOString().split("T")[0]}.csv`)
    toast({
      title: "Exported!",
      description: "All optimized sets exported to CSV",
    })
  }

  const KeywordCard = ({
    title,
    keywords: kwList,
    fieldName,
    maxChars,
    description,
  }: {
    title: string
    keywords: string[]
    fieldName: string
    maxChars?: number
    description?: string
  }) => {
    const text = kwList.join(", ")
    const charCount = text.length
    const isOverLimit = maxChars && charCount > maxChars

    return (
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && <CardDescription className="text-xs mt-1">{description}</CardDescription>}
            </div>
            <div className="flex gap-2">
              {maxChars && (
                <Badge variant="outline" className="text-xs">
                  {charCount}/{maxChars} chars
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(text, fieldName)}
                className="h-7 w-7 p-0"
              >
                {copiedField === fieldName ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-slate-50 rounded-lg border font-mono text-xs break-words">
            {text || <span className="text-slate-500">No keywords assigned</span>}
          </div>
          {isOverLimit && (
            <p className="text-xs text-slate-600 mt-2">Exceeds character limit</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Optimized Keyword Sets</h3>
          <p className="text-sm text-slate-600 mt-1">
            AI-generated keyword sets optimized for maximum visibility on each platform
          </p>
        </div>
        <Button variant="outline" onClick={handleExportAll}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* iOS Section */}
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          iOS App Store
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <KeywordCard
            title="Title Keywords"
            keywords={optimized.ios.title}
            fieldName="ios-title"
            description="High-priority branded keywords for app title"
          />
          <KeywordCard
            title="Subtitle Keywords"
            keywords={optimized.ios.subtitle}
            fieldName="ios-subtitle"
            maxChars={30}
            description="High-scoring keywords for subtitle (max 30 chars)"
          />
          <KeywordCard
            title="Keywords Field"
            keywords={optimized.ios.keywordsField.split(",").filter(Boolean)}
            fieldName="ios-keywords"
            maxChars={100}
            description="Comma-separated keywords for App Store Connect (max 100 chars)"
          />
          <KeywordCard
            title="Description Keywords"
            keywords={optimized.ios.description}
            fieldName="ios-description"
            description="Remaining keywords for app description"
          />
        </div>
      </div>

      {/* Android Section */}
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          Google Play Store
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <KeywordCard
            title="Title Keywords"
            keywords={optimized.android.title}
            fieldName="android-title"
            maxChars={50}
            description="High-priority keywords for app title (max 50 chars)"
          />
          <KeywordCard
            title="Short Description Keywords"
            keywords={optimized.android.shortDescription}
            fieldName="android-short"
            maxChars={80}
            description="Keywords for short description (max 80 chars)"
          />
          <KeywordCard
            title="Full Description Keywords"
            keywords={optimized.android.fullDescription}
            fieldName="android-full"
            description="Remaining keywords for full description"
          />
        </div>
      </div>
    </div>
  )
}
