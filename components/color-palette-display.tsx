"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Color {
  name: string
  hex: string
  usage: string
}

interface ColorPaletteDisplayProps {
  colors: Color[]
  onChange: (colors: Color[]) => void
  editable?: boolean
}

export function ColorPaletteDisplay({ colors, onChange, editable = true }: ColorPaletteDisplayProps) {
  const { toast } = useToast()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleAddColor = () => {
    onChange([
      ...colors,
      {
        name: "New Color",
        hex: "#000000",
        usage: "Description",
      },
    ])
  }

  const handleRemoveColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index))
  }

  const handleColorChange = (index: number, field: keyof Color, value: string) => {
    const newColors = [...colors]
    newColors[index] = { ...newColors[index], [field]: value }
    onChange(newColors)
  }

  const copyToClipboard = async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedIndex(index)
      toast({
        title: "Copied!",
        description: `Color ${hex} copied to clipboard`,
      })
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Colour Palette</CardTitle>
          {editable && (
            <Button type="button" variant="outline" size="sm" onClick={handleAddColor}>
              <Plus className="h-4 w-4 mr-2" />
              Add Colour
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((color, index) => (
            <div key={index} className="relative group">
              <div
                className="h-24 rounded-lg border-2 border-slate-200 shadow-sm relative overflow-hidden cursor-pointer"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(color.hex, index)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{color.hex}</span>
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {editable ? (
                <div className="mt-2 space-y-2">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={color.name}
                      onChange={(e) => handleColorChange(index, "name", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Hex Code</Label>
                    <div className="flex gap-2">
                      <Input
                        value={color.hex}
                        onChange={(e) => handleColorChange(index, "hex", e.target.value)}
                        className="h-8 text-sm font-mono"
                      />
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => handleColorChange(index, "hex", e.target.value)}
                        className="h-8 w-12 cursor-pointer rounded border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Usage</Label>
                    <Input
                      value={color.usage}
                      onChange={(e) => handleColorChange(index, "usage", e.target.value)}
                      className="h-8 text-sm"
                      placeholder="e.g., Primary brand color"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveColor(index)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="font-semibold text-sm text-slate-900">{color.name}</div>
                  <div className="text-xs text-slate-600 mt-1">{color.usage}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        {colors.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No colours defined. Click "Add Colour" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
