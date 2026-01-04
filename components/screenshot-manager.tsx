"use client"

import { useState, useRef, memo } from "react"
import * as React from "react"
import { GripVertical, X, Eye, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import type { AppScreenshot, ScreenshotMessaging } from "@/lib/types"
import { getScreenshotMessaging, saveScreenshotMessaging, bulkImportScreenshotMessaging } from "@/app/actions"
import { ScreenshotMessagingForm } from "@/components/screenshot-messaging-form"
import { ScreenshotMessagingFormEnhanced } from "@/components/screenshot-messaging-form-enhanced"
import { demoScreenshotMessaging } from "@/lib/demo-screenshot-messaging"
import { useToast } from "@/hooks/use-toast"
import { Sparkles } from "lucide-react"

interface ScreenshotManagerProps {
  appId: string | null
  platform: "ios" | "android"
  screenshots: AppScreenshot[]
  onScreenshotsChange: (screenshots: AppScreenshot[]) => void
  onSave: (screenshot: { app_data_id: string; platform: string; device_type: string; image_url: string; sort_order: number }) => Promise<{ success: boolean }>
  onDelete: (id: string) => Promise<{ success: boolean }>
  onUpdateOrder: (id: string, sortOrder: number) => Promise<{ success: boolean }>
  onReload?: () => Promise<void>
}

export const ScreenshotManager = memo(function ScreenshotManager({
  appId,
  platform,
  screenshots,
  onScreenshotsChange,
  onSave,
  onDelete,
  onUpdateOrder,
  onReload,
}: ScreenshotManagerProps) {
  const { toast } = useToast()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editingMessaging, setEditingMessaging] = useState<string | null>(null)
  const [messagingData, setMessagingData] = useState<Record<string, ScreenshotMessaging | null>>({})
  const [deleteScreenshotId, setDeleteScreenshotId] = useState<string | null>(null)
  const [showDemoMessagingDialog, setShowDemoMessagingDialog] = useState(false)
  const [demoMessagingCount, setDemoMessagingCount] = useState(0)
  const dragOverIndexRef = useRef<number | null>(null)

  const [localScreenshots, setLocalScreenshots] = useState<AppScreenshot[]>(screenshots)

  // Update local screenshots when prop changes
  React.useEffect(() => {
    setLocalScreenshots([...screenshots].sort((a, b) => a.sort_order - b.sort_order))
  }, [screenshots])

  // Load messaging for screenshots
  React.useEffect(() => {
    const loadMessaging = async () => {
      const messagingPromises = localScreenshots.map(async (screenshot) => {
        const messaging = await getScreenshotMessaging(screenshot.id)
        return { screenshotId: screenshot.id, messaging }
      })
      const results = await Promise.all(messagingPromises)
      const messagingMap: Record<string, ScreenshotMessaging | null> = {}
      results.forEach(({ screenshotId, messaging }) => {
        messagingMap[screenshotId] = messaging
      })
      setMessagingData(messagingMap)
    }
    if (localScreenshots.length > 0) {
      loadMessaging()
    }
  }, [localScreenshots])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!appId) {
      toast({
        title: "Action Required",
        description: "Please save the app data first before uploading screenshots",
        variant: "destructive",
      })
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageUrl = reader.result as string
        
        // Detect device type from filename and image dimensions
        const fileName = file.name.toLowerCase()
        const isTabletByName = fileName.includes("tablet") || fileName.includes("ipad")
        
        // Also check image dimensions
        const img = new Image()
        img.onload = async () => {
          const isHorizontal = img.width > img.height
          const isTablet = isTabletByName || (isHorizontal && img.width > 1000)
          
          const deviceType = platform === "ios" 
            ? (isTablet ? "ipad" : "iphone")
            : (isTablet ? "android_tablet" : "android_phone")
          
          const result = await onSave({
            app_data_id: appId,
            platform,
            device_type: deviceType,
            image_url: imageUrl,
            sort_order: screenshots.length + i,
          })
          
          if (result.success) {
            // Reload screenshots after all files are processed
            if (i === files.length - 1) {
              setTimeout(() => {
                if (onReload) {
                  onReload()
                } else {
                  window.location.reload()
                }
              }, 500)
            }
          }
        }
        img.src = imageUrl
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    setIsDragging(true)
    dragOverIndexRef.current = null
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
    
    // Create invisible drag image
    const dragImage = document.createElement("div")
    dragImage.style.position = "absolute"
    dragImage.style.top = "-1000px"
    dragImage.style.width = "1px"
    dragImage.style.height = "1px"
    dragImage.style.opacity = "0"
    dragImage.style.pointerEvents = "none"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedIndex === null || draggedIndex === index) {
      return
    }

    // Only update if we're over a different item
    if (dragOverIndexRef.current !== index) {
      dragOverIndexRef.current = index
      
      const newScreenshots = [...localScreenshots]
      const draggedItem = newScreenshots[draggedIndex]
      
      // Remove from current position
      newScreenshots.splice(draggedIndex, 1)
      
      // Calculate new index
      const newIndex = draggedIndex < index ? index - 1 : index
      newScreenshots.splice(newIndex, 0, draggedItem)
      
      // Update sort orders
      const updatedScreenshots = newScreenshots.map((screenshot, idx) => ({
        ...screenshot,
        sort_order: idx
      }))
      
      setLocalScreenshots(updatedScreenshots)
      onScreenshotsChange(updatedScreenshots)
      setDraggedIndex(newIndex)
    }
    
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnd = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const finalIndex = draggedIndex
    const wasDragging = isDragging
    
    setDraggedIndex(null)
    setIsDragging(false)
    dragOverIndexRef.current = null
    
    if (finalIndex === null || !wasDragging) {
      return
    }
    
    // Get the final order from local state
    const finalOrder = [...localScreenshots].map((screenshot, idx) => ({
      ...screenshot,
      sort_order: idx
    }))
    
    // Save the new order to database
    try {
      const updatePromises = finalOrder.map((screenshot, idx) => {
        return onUpdateOrder(screenshot.id, idx)
      })
      
      const results = await Promise.all(updatePromises)
      const allSuccess = results.every(r => r.success)
      
      if (allSuccess) {
        // Update parent state
        onScreenshotsChange(finalOrder)
        setLocalScreenshots(finalOrder)
        
        // Reload screenshots if callback provided
        if (onReload) {
          await onReload()
        } else {
          setTimeout(() => {
            window.location.reload()
          }, 300)
        }
      } else {
        console.error("Some updates failed")
        if (onReload) {
          await onReload()
        } else {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("Error updating screenshot order:", error)
      if (onReload) {
        await onReload()
      } else {
        window.location.reload()
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const handleDelete = async (id: string) => {
    setDeleteScreenshotId(id)
  }

  const confirmDelete = async () => {
    if (deleteScreenshotId) {
      const result = await onDelete(deleteScreenshotId)
      if (result.success) {
        if (onReload) {
          await onReload()
        } else {
          window.location.reload()
        }
      }
      setDeleteScreenshotId(null)
    }
  }

  const handleLoadDemoMessaging = async () => {
    if (localScreenshots.length === 0) {
      toast({
        title: "Error",
        description: "Please upload screenshots first before loading demo messaging",
        variant: "destructive",
      })
      return
    }

    try {
      // Filter out screenshots that already have messaging
      const screenshotsWithoutMessaging = localScreenshots.filter(
        (screenshot) => !messagingData[screenshot.id]
      )

      if (screenshotsWithoutMessaging.length === 0) {
        toast({
          title: "Info",
          description: "All screenshots already have messaging. You can edit them individually.",
        })
        return
      }

      setDemoMessagingCount(screenshotsWithoutMessaging.length)
      setShowDemoMessagingDialog(true)
    } catch (error) {
      console.error("Error preparing demo messaging:", error)
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  const confirmLoadDemoMessaging = async () => {
    try {
      const screenshotsWithoutMessaging = localScreenshots.filter(
        (screenshot) => !messagingData[screenshot.id]
      )
      const screenshotIds = screenshotsWithoutMessaging.map((s) => s.id)
      const result = await bulkImportScreenshotMessaging(screenshotIds, demoScreenshotMessaging)

      if (result.success) {
        toast({
          title: "Success",
          description: `Loaded demo messaging for ${result.count} screenshot(s)`,
        })
        
        // Reload messaging data
        const messagingPromises = localScreenshots.map(async (screenshot) => {
          const messaging = await getScreenshotMessaging(screenshot.id)
          return { screenshotId: screenshot.id, messaging }
        })
        const results = await Promise.all(messagingPromises)
        const messagingMap: Record<string, ScreenshotMessaging | null> = {}
        results.forEach(({ screenshotId, messaging }) => {
          messagingMap[screenshotId] = messaging
        })
        setMessagingData(messagingMap)
        setShowDemoMessagingDialog(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error loading demo messaging:", error)
      toast({
        title: "Error",
        description: `Failed to load demo messaging: ${String(error)}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          {platform === "ios" ? "iOS" : "Android"} Screenshots
          <span className="text-xs text-slate-500 ml-2">(Supports iPhone/iPad and Phone/Tablet)</span>
        </Label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="cursor-pointer"
        />
        <p className="text-xs text-slate-500">
          Upload multiple screenshots. Include "tablet" or "ipad" in filename for horizontal/tablet screenshots.
        </p>
      </div>

      {localScreenshots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Manage Screenshots (Drag to reorder)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadDemoMessaging}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Load Demo Messaging
            </Button>
          </div>
          <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
            {localScreenshots.map((screenshot, index) => (
              <div
                key={screenshot.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={(e) => handleDragEnd(e)}
                onDrop={(e) => handleDrop(e)}
                className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 cursor-move hover:border-blue-300 hover:shadow-md transition-all select-none ${
                  draggedIndex === index ? "opacity-50 border-blue-500 scale-95" : "border-slate-200"
                } ${isDragging && draggedIndex !== null && draggedIndex !== index ? "border-dashed border-blue-300" : ""}`}
                style={{ 
                  userSelect: 'none', 
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  touchAction: 'none'
                }}
              >
                <GripVertical className="h-5 w-5 text-slate-400 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                <div className="flex-shrink-0 relative group">
                  <img
                    src={screenshot.image_url}
                    alt={`Screenshot ${index + 1}`}
                    className={`object-cover border-2 border-slate-200 rounded-lg shadow-sm ${
                      screenshot.device_type === "ipad" || screenshot.device_type === "android_tablet"
                        ? "w-24 h-14"
                        : "w-14 h-24"
                    }`}
                    draggable={false}
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(screenshot.image_url)}
                    className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {screenshot.device_type === "ipad" || screenshot.device_type === "android_tablet"
                      ? "📱 Tablet (Horizontal)"
                      : "📱 Phone (Vertical)"}
                  </div>
                  <div className="text-xs text-slate-500">Position: {screenshot.sort_order + 1} of {localScreenshots.length}</div>
                  {messagingData[screenshot.id]?.tagline && (
                    <div className="text-xs text-indigo-600 mt-1 font-medium">
                      "{messagingData[screenshot.id]?.tagline}"
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingMessaging(screenshot.id)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    title="Edit messaging"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewImage(screenshot.image_url)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(screenshot.id)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Screenshot Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex items-center justify-center p-4">
              <img
                src={previewImage}
                alt="Screenshot preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg border border-slate-200 shadow-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Messaging Dialog */}
      {editingMessaging && (
        <Dialog open={!!editingMessaging} onOpenChange={() => setEditingMessaging(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Screenshot Messaging</DialogTitle>
            </DialogHeader>
            <ScreenshotMessagingFormEnhanced
              screenshotId={editingMessaging}
              messaging={messagingData[editingMessaging] || null}
              onSave={async (data) => {
                const result = await saveScreenshotMessaging({
                  screenshot_id: editingMessaging,
                  ...data,
                })
                if (result.success) {
                  setMessagingData((prev) => ({
                    ...prev,
                    [editingMessaging]: { 
                      ...data, 
                      id: result.id!, 
                      screenshot_id: editingMessaging, 
                      created_at: new Date().toISOString(), 
                      updated_at: new Date().toISOString() 
                    } as ScreenshotMessaging,
                  }))
                  setEditingMessaging(null)
                }
              }}
              onCancel={() => setEditingMessaging(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Demo Messaging Confirmation Dialog */}
      <ConfirmDialog
        open={showDemoMessagingDialog}
        onOpenChange={setShowDemoMessagingDialog}
        onConfirm={confirmLoadDemoMessaging}
        title="Load Demo Messaging"
        description={`You are about to add demo messaging to ${demoMessagingCount} screenshot(s). Continue?`}
        confirmText="Load Demo Messaging"
        cancelText="Cancel"
      />
    </div>
  )
})
