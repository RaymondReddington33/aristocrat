"use client"

import { Button } from "@/components/ui/button"
import { FileText, Share2, Download, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface ExportButtonsProps {
  appName?: string
}

export function ExportButtons({ appName = "Creative Brief" }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleExportPDF = () => {
    // Use browser's print to PDF functionality
    window.print()
  }

  const handleExportTXT = () => {
    // Get all text content from the page
    const content = document.querySelector('main') || document.body
    const textContent = content.innerText || content.textContent || ''
    
    // Create a blob and download
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${appName.replace(/\s+/g, '_')}_Creative_Brief.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Exported successfully",
      description: "Creative brief exported as TXT file",
    })
  }

  const handleShare = async () => {
    const url = window.location.href
    
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${appName} - Creative Brief`,
          text: `Check out this ASO/ASA Creative Brief for ${appName}`,
          url: url,
        })
        return
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Creative brief link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Error",
        description: "Failed to copy link. Please copy it manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <Button 
        variant="outline" 
        onClick={handleExportPDF}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export as PDF
      </Button>
      <Button 
        variant="outline" 
        onClick={handleExportTXT}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Export as TXT
      </Button>
      <Button 
        onClick={handleShare}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share Brief
          </>
        )}
      </Button>
    </div>
  )
}

