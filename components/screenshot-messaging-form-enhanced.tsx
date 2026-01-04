"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TestTube, Sparkles, TrendingUp } from "lucide-react"
import type { ScreenshotMessaging } from "@/lib/types"

interface ScreenshotMessagingFormEnhancedProps {
  screenshotId: string
  messaging: ScreenshotMessaging | null
  onSave: (data: Partial<ScreenshotMessaging>) => Promise<void>
  onCancel?: () => void
}

export function ScreenshotMessagingFormEnhanced({ 
  screenshotId, 
  messaging, 
  onSave, 
  onCancel 
}: ScreenshotMessagingFormEnhancedProps) {
  const [tagline, setTagline] = useState(messaging?.tagline || "")
  const [valueProposition, setValueProposition] = useState(messaging?.value_proposition || "")
  const [ctaText, setCtaText] = useState(messaging?.cta_text || "")
  const [abVariant, setAbVariant] = useState<"A" | "B">(messaging?.ab_test_variant || "A")
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"a" | "b">(messaging?.ab_test_variant === "B" ? "b" : "a")

  useEffect(() => {
    if (messaging) {
      setTagline(messaging.tagline || "")
      setValueProposition(messaging.value_proposition || "")
      setCtaText(messaging.cta_text || "")
      setAbVariant(messaging.ab_test_variant || "A")
      setActiveTab(messaging.ab_test_variant === "B" ? "b" : "a")
    }
  }, [messaging])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        tagline: tagline || undefined,
        value_proposition: valueProposition || undefined,
        cta_text: ctaText || undefined,
        ab_test_variant: abVariant,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTabChange = (value: string) => {
    const newVariant = value === "b" ? "B" : "A"
    setActiveTab(value as "a" | "b")
    setAbVariant(newVariant)
  }

  return (
    <div className="space-y-6">
      {/* A/B Test Selector */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            <Label className="text-base font-semibold text-slate-900">A/B Test Variant</Label>
          </div>
          <Badge variant={abVariant === "A" ? "default" : "secondary"} className="text-sm font-bold">
            Variant {abVariant}
          </Badge>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="a" className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${activeTab === "a" ? "bg-blue-600" : "bg-slate-300"}`} />
              Variant A
            </TabsTrigger>
            <TabsTrigger value="b" className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${activeTab === "b" ? "bg-purple-600" : "bg-slate-300"}`} />
              Variant B
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-slate-600 mt-2">
          Select which variant you're configuring. Use this to test different messaging approaches and track performance.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tagline" className="text-base font-semibold">Tagline</Label>
            <span className="text-xs text-slate-500">{tagline.length}/100 characters</span>
          </div>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g., Win Big Every Day!"
            maxLength={100}
            className="text-base"
          />
          <p className="text-xs text-slate-500">
            The main headline or hook for this screenshot
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="value_proposition" className="text-base font-semibold">Value Proposition</Label>
            <span className="text-xs text-slate-500">{valueProposition.length}/300 characters</span>
          </div>
          <Textarea
            id="value_proposition"
            value={valueProposition}
            onChange={(e) => setValueProposition(e.target.value)}
            placeholder="Describe the key value this screenshot communicates"
            rows={4}
            maxLength={300}
            className="text-base"
          />
          <p className="text-xs text-slate-500">
            What benefit or value does this screenshot highlight?
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="cta_text" className="text-base font-semibold">CTA Text</Label>
            <span className="text-xs text-slate-500">{ctaText.length}/50 characters</span>
          </div>
          <Input
            id="cta_text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="e.g., Play Now, Get Started, Download"
            maxLength={50}
            className="text-base font-medium"
          />
          <p className="text-xs text-slate-500">
            Call-to-action text to encourage user engagement
          </p>
        </div>
      </div>

      {/* Preview Card */}
      {(tagline || valueProposition || ctaText) && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Label className="text-sm font-semibold text-slate-700">Preview</Label>
          </div>
          <div className="space-y-2">
            {tagline && (
              <div className="text-lg font-bold text-slate-900">{tagline}</div>
            )}
            {valueProposition && (
              <div className="text-sm text-slate-700 leading-relaxed">{valueProposition}</div>
            )}
            {ctaText && (
              <div className="pt-2">
                <Badge variant="default" className="text-sm font-semibold px-4 py-1.5">
                  {ctaText}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving} type="button" className="gap-2">
          {saving ? (
            <>
              <TrendingUp className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Save Messaging
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
