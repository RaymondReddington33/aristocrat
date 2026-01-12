"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

// Helper function to compress image
const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface VisualReferencesUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function VisualReferencesUpload({ images, onImagesChange, maxImages = 10 }: VisualReferencesUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = maxImages - images.length
    
    if (remainingSlots <= 0) {
      return
    }

    const filesToProcess = files.slice(0, remainingSlots)
    const newImageUrls: string[] = []

    try {
      // Compress and process all images
      for (const file of filesToProcess) {
        // Check file size (max 10MB before compression)
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(2)}MB), compressing...`)
        }
        
        // Compress image to reduce base64 size
        const compressedImage = await compressImage(file, 1200, 1200, 0.75)
        newImageUrls.push(compressedImage)
      }

      // Update state with all compressed images at once
      onImagesChange([...images, ...newImageUrls])
    } catch (error) {
      console.error("Error processing images:", error)
      alert("Error processing images. Please try again with smaller files.")
    }

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

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFiles(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) return

    const filesToProcess = files.slice(0, remainingSlots)
    const newImageUrls: string[] = []

    try {
      for (const file of filesToProcess) {
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File ${file.name} is too large, compressing...`)
        }
        const compressedImage = await compressImage(file, 1200, 1200, 0.75)
        newImageUrls.push(compressedImage)
      }
      onImagesChange([...images, ...newImageUrls])
    } catch (error) {
      console.error("Error processing dropped images:", error)
      alert("Error processing images. Please try again with smaller files.")
    }
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
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            isDraggingFiles 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDraggingFiles(true)
          }}
          onDragLeave={() => setIsDraggingFiles(false)}
          onDrop={handleFileDrop}
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
