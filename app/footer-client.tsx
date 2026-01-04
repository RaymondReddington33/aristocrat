"use client"

import { usePathname } from "next/navigation"

export function FooterClient() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage) return null

  return (
    <footer className="relative overflow-hidden">
      {/* Banner Background Image */}
      <div className="relative z-0 w-full">
        <img 
          src="/images/banner.png" 
          alt="Aristocrat Product Madness Banner"
          className="w-full h-auto object-contain object-center"
        />
        {/* Fallback gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-purple-600/20 pointer-events-none" />
      </div>
      
      {/* Subtle overlay only at edges for better text readability without hiding center logos */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-purple-900/40 via-transparent via-transparent to-purple-900/40 pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-purple-900/15 via-transparent to-transparent pointer-events-none" />
      
      {/* Content with proper spacing to avoid logo areas */}
      <div className="absolute inset-0 z-[2] container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Left: Empty space */}
            <div className="order-2 lg:order-1"></div>
            
            {/* Center: Banner Logos Area - Keep this area completely clear for logos */}
            <div className="flex-1 flex items-center justify-center min-h-[100px] lg:min-h-[140px] order-1 lg:order-2 px-4">
              {/* Logos from banner will show through here - no text overlay */}
              <div className="w-full h-full flex items-center justify-center">
                {/* Reserved space - banner logos visible here */}
              </div>
            </div>
            
            {/* Right: Company Info - positioned to avoid right logos */}
            <div className="text-center lg:text-right order-3">
              <p className="text-xs text-white/85 mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                Technical Test for
              </p>
              <p className="text-sm sm:text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                Aristocrat
              </p>
              <p className="text-xs sm:text-sm font-semibold text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                Product Madness
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Black line with text - full width */}
      <div className="w-full py-3 px-4 sm:px-6 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-t border-gray-800">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <span className="text-xs sm:text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
              ASO/ASA Manager Technical Test
            </span>
            <span className="hidden sm:inline text-white/50">|</span>
            <span className="text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
              Made with <span className="text-red-300">♥</span> by <span className="font-semibold">Oriol Claramunt Pascual</span>
            </span>
            <span className="hidden sm:inline text-white/50">|</span>
            <span className="text-xs text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
              Barcelona, Spain 2026 • 32 years old
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
