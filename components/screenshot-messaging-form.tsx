"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScreenshotMessaging } from "@/lib/types"

interface ScreenshotMessagingFormProps {
  screenshotId: string
  messaging: ScreenshotMessaging | null
  onSave: (data: Partial<ScreenshotMessaging>) => Promise<void>
  onCancel?: () => void
}

export function ScreenshotMessagingForm({ screenshotId, messaging, onSave, onCancel }: ScreenshotMessagingFormProps) {
  const [tagline, setTagline] = useState(messaging?.tagline || "")
  const [valueProposition, setValueProposition] = useState(messaging?.value_proposition || "")
  const [ctaText, setCtaText] = useState(messaging?.cta_text || "")
  const [abVariant, setAbVariant] = useState<"A" | "B">(messaging?.ab_test_variant || "A")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (messaging) {
      setTagline(messaging.tagline || "")
      setValueProposition(messaging.value_proposition || "")
      setCtaText(messaging.cta_text || "")
      setAbVariant(messaging.ab_test_variant || "A")
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g., Win Big Every Day!"
          maxLength={100}
        />
        <p className="text-xs text-slate-500">{tagline.length}/100 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value_proposition">Value Proposition</Label>
        <Textarea
          id="value_proposition"
          value={valueProposition}
          onChange={(e) => setValueProposition(e.target.value)}
          placeholder="Describe the key value this screenshot communicates"
          rows={3}
          maxLength={300}
        />
        <p className="text-xs text-slate-500">{valueProposition.length}/300 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta_text">CTA Text</Label>
        <Input
          id="cta_text"
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          placeholder="e.g., Play Now, Get Started, Download"
          maxLength={50}
        />
        <p className="text-xs text-slate-500">{ctaText.length}/50 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ab_variant">A/B Test Variant</Label>
        <Select value={abVariant} onValueChange={(value: "A" | "B") => setAbVariant(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Variant A</SelectItem>
            <SelectItem value="B">Variant B</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">Use this to track different messaging variations for A/B testing</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => onCancel?.()} type="button">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} type="button">
          {saving ? "Saving..." : "Save Messaging"}
        </Button>
      </div>
    </div>
  )
}
