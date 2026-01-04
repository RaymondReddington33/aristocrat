"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith("/auth")

  return (
    <>
      {!isAuthPage && <Navbar />}
      {children}
    </>
  )
}
