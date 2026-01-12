"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getEffectiveRole } from "@/lib/auth"

interface AdminLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function AdminLink({ href, children, className, variant = "outline", size = "sm" }: AdminLinkProps) {
  const [userRole, setUserRole] = useState<"test_owner" | "test_reviewer" | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const checkRole = async () => {
      try {
        // Check for supervisor session first
        const supervisorSession = document.cookie
          .split("; ")
          .find((row) => row.startsWith("supervisor_session="))
        
        if (supervisorSession && supervisorSession.includes("supervisor_")) {
          setUserRole("test_reviewer")
          return
        }
        
        // Otherwise check Supabase auth
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          const role = getEffectiveRole(user.email)
          setUserRole(role)
        }
      } catch (error) {
        console.error("Error checking role:", error)
        setUserRole("test_reviewer") // Default to reviewer for safety
      }
    }
    
    if (isMounted) {
      checkRole()
      
      // Listen for auth changes
      const supabase = createClient()
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        // Check supervisor session first
        const supervisorSession = document.cookie
          .split("; ")
          .find((row) => row.startsWith("supervisor_session="))
        
        if (supervisorSession && supervisorSession.includes("supervisor_")) {
          setUserRole("test_reviewer")
          return
        }
        
        const authUser = session?.user ? { email: session.user.email } : null
        if (authUser?.email) {
          setUserRole(getEffectiveRole(authUser.email))
        } else {
          setUserRole(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isMounted])

  // Don't render anything if user is test_reviewer
  // If not mounted yet, don't render (prevents flash)
  // If userRole is null (no user), also don't render (middleware will protect)
  if (!isMounted || userRole === "test_reviewer" || userRole === null) {
    return null
  }
  
  // Only render if user is test_owner
  if (userRole !== "test_owner") {
    return null
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  )
}
