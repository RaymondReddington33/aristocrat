"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectClientProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  trigger: React.ReactNode
}

/**
 * Client-side only Select wrapper to prevent hydration mismatches
 */
export function SelectClient({ value, onValueChange, placeholder, children, trigger }: SelectClientProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="inline-flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        {placeholder || "Loading..."}
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        {trigger || <SelectValue placeholder={placeholder} />}
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}
