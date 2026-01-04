"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface VisualReferencesUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function VisualReferencesUpload({ images, onImagesChange, maxImages = 10 }: VisualReferencesUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = maxImages - images.length
    
    if (remainingSlots <= 0) {
      return
    }

    const filesToProcess = files.slice(0, remainingSlots)

    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        onImagesChange([...images, imageUrl])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newImages = [...images]
    const [removed] = newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, removed)
    
    onImagesChange(newImages)
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Visual References</Label>
        <span className="text-xs text-slate-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Button */}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-slate-400 transition-colors cursor-pointer bg-slate-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-slate-400" />
            <div className="text-sm font-medium text-slate-700">
              Click to upload or drag and drop
            </div>
            <div className="text-xs text-slate-500">
              PNG, JPG, GIF up to 10MB (recommended: 800x600px or larger)
            </div>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className="group relative aspect-square rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-100 hover:border-slate-400 transition-all cursor-move"
            >
              <Image
                src={imageUrl}
                alt={`Visual reference ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized={imageUrl.startsWith('data:')}
                onClick={() => setPreviewIndex(index)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(index)
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Drag to reorder
              </div>
            </div>
          ))}
          
          {/* Add More Button */}
          {images.length < maxImages && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
            >
              <div className="text-center">
                <Plus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Add more</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Screen Preview Modal */}
      {previewIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewIndex(null)}
        >
          <button
            onClick={() => setPreviewIndex(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-7xl max-h-full">
            <Image
              src={images[previewIndex]}
              alt={`Visual reference ${previewIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-w-full max-h-[90vh] rounded-lg"
              unoptimized={images[previewIndex].startsWith('data:')}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            Image {previewIndex + 1} of {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
