import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { LayoutClient } from "./layout-client"
import { FooterClient } from "./footer-client"
import "./globals.css"

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ASO/ASA Presentation Tool | Technical Test - Oriol Claramunt",
  description: "Professional demonstration platform for App Store and Google Play Store optimization. Technical test for ASO/ASA Manager at Product Madness.",
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <LayoutClient>{children}</LayoutClient>
        <FooterClient />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
