"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"

interface TypographyStyle {
  name: string
  font: string
  size: string
  weight: string
  example: string
}

interface TypographyDisplayProps {
  styles: TypographyStyle[]
  onChange: (styles: TypographyStyle[]) => void
  editable?: boolean
}

const FONT_OPTIONS = [
  "Playfair Display",
  "Merriweather",
  "Inter",
  "Manrope",
  "SF Pro",
  "Roboto",
  "Helvetica",
  "Arial",
  "Georgia",
  "Times New Roman",
]

const SIZE_OPTIONS = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px", "64px"]

const WEIGHT_OPTIONS = ["300", "400", "500", "600", "700", "800", "900"]

export function TypographyDisplay({ styles, onChange, editable = true }: TypographyDisplayProps) {
  const handleAddStyle = () => {
    onChange([
      ...styles,
      {
        name: "New Style",
        font: "Inter",
        size: "16px",
        weight: "400",
        example: "Sample text",
      },
    ])
  }

  const handleRemoveStyle = (index: number) => {
    onChange(styles.filter((_, i) => i !== index))
  }

  const handleStyleChange = (index: number, field: keyof TypographyStyle, value: string) => {
    const newStyles = [...styles]
    newStyles[index] = { ...newStyles[index], [field]: value }
    onChange(newStyles)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Typography System</CardTitle>
          {editable && (
            <Button type="button" variant="outline" size="sm" onClick={handleAddStyle}>
              <Plus className="h-4 w-4 mr-2" />
              Add Style
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {styles.map((style, index) => (
            <div key={index} className="border rounded-lg p-4 bg-slate-50">
              {editable ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Style {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStyle(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={style.name}
                      onChange={(e) => handleStyleChange(index, "name", e.target.value)}
                      placeholder="e.g., Headlines & Titles"
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Font</Label>
                      <Select value={style.font} onValueChange={(value) => handleStyleChange(index, "font", value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Size</Label>
                      <Select value={style.size} onValueChange={(value) => handleStyleChange(index, "size", value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Weight</Label>
                      <Select
                        value={style.weight}
                        onValueChange={(value) => handleStyleChange(index, "weight", value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEIGHT_OPTIONS.map((weight) => (
                            <SelectItem key={weight} value={weight}>
                              {weight}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Example Text</Label>
                    <Input
                      value={style.example}
                      onChange={(e) => handleStyleChange(index, "example", e.target.value)}
                      placeholder="Sample text to preview"
                      className="h-8"
                    />
                  </div>
                  <div className="border-t pt-3">
                    <Label className="text-xs text-slate-600 mb-2 block">Preview</Label>
                    <div
                      className="p-4 bg-white rounded border border-slate-200"
                      style={{
                        fontFamily: style.font,
                        fontSize: style.size,
                        fontWeight: style.weight,
                      }}
                    >
                      {style.example || "Sample text"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">{style.name}</Label>
                    <div className="text-xs text-slate-500 mt-1">
                      Font: {style.font} • Size: {style.size} • Weight: {style.weight}
                    </div>
                  </div>
                  <div
                    className="p-4 bg-white rounded border border-slate-200"
                    style={{
                      fontFamily: style.font,
                      fontSize: style.size,
                      fontWeight: style.weight,
                    }}
                  >
                    {style.example || "Sample text"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {styles.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No typography styles defined. Click "Add Style" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
