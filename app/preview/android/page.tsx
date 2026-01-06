import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Star, Share, Info, Shield, ChevronRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getScreenshots, getPreviewVideos } from "@/app/actions"
import { getSelectedAppId, getAppDataOrLatest } from "@/lib/app-selection"

export default async function AndroidPreview({ searchParams }: { searchParams?: { appId?: string } }) {
  // Get selected app ID from query param (from navbar), cookie, or use latest app
  const queryAppId = searchParams?.appId || null
  const cookieAppId = await getSelectedAppId()
  const selectedAppId = queryAppId || cookieAppId
  const appData = await getAppDataOrLatest(selectedAppId)

  if (!appData) {
    redirect("/admin")
  }

  // Fetch all data in parallel for maximum performance
  const [screenshots, previewVideos] = await Promise.all([
    getScreenshots(appData.id, "android"),
    getPreviewVideos(appData.id, "android")
  ])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-green-600 text-green-600" : "fill-gray-300 text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between max-w-4xl">
          <Link href="/preview" className="text-green-700 text-xs sm:text-sm font-medium">
            ← Back
          </Link>
          <span className="text-xs text-gray-500">Google Play Preview</span>
        </div>
      </div>

      {/* Google Play Store Layout */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        {/* Header Section */}
        <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-shrink-0">
            <img
              src={appData.app_icon_url || "/placeholder.svg?height=96&width=96"}
              alt="App icon"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl shadow-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-normal text-gray-900 mb-1 truncate">
              {appData.android_app_name || appData.app_name}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700 mb-1 flex-wrap">
              <span className="font-medium">Developer Name</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{appData.category || "Productivity"}</span>
            </div>
            <div className="flex items-center gap-1 mb-1 text-xs sm:text-sm flex-wrap">
              <span className="text-gray-600">Contains ads</span>
              {appData.has_in_app_purchases && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">In-app purchases</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating Bar */}
        <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6 py-3 sm:py-4 border-y overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-900">{appData.rating?.toFixed(1) || "0.0"}</span>
                <Star className="h-3 w-3 fill-gray-600 text-gray-600" />
              </div>
              <div className="text-xs text-gray-600">{appData.review_count?.toLocaleString() || "0"}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200 flex-shrink-0" />
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="text-sm font-medium text-gray-900">{appData.download_count || "10K+"}</div>
            <div className="text-xs text-gray-600 whitespace-nowrap">Downloads</div>
          </div>
          <div className="h-8 w-px bg-gray-200 flex-shrink-0" />
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center mb-1">
              <Info className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-xs text-gray-600 whitespace-nowrap">{appData.age_rating || "Rated for 3+"}</div>
          </div>
        </div>

        {/* Install Button */}
        <div className="mb-4 sm:mb-6">
          <Button className="w-full bg-green-700 hover:bg-green-800 text-white h-10 sm:h-11 text-sm sm:text-base font-medium rounded-lg">
            Install
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">This app is available for your device</p>
        </div>

        {/* Screenshots Section */}
        {(screenshots.length > 0 || previewVideos.length > 0) && (
          <div className="mb-6 sm:mb-8">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4">
              {previewVideos.map((video) => (
                video.video_url && (
                  <div key={video.id} className="flex-shrink-0 relative group">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-36 h-64 sm:w-44 sm:h-80 rounded-lg border border-gray-300 object-cover"
                      />
                    ) : (
                      <div className="w-36 h-64 sm:w-44 sm:h-80 rounded-lg border border-gray-300 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs sm:text-sm">Video</span>
                      </div>
                    )}
                    <video
                      src={video.video_url}
                      className="absolute inset-0 w-full h-full rounded-lg object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                      controls
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              ))}
              {screenshots.map((screenshot) => (
                screenshot.image_url && (
                  <div key={screenshot.id} className="flex-shrink-0">
                    <img
                      src={screenshot.image_url}
                      alt={screenshot.title || `Screenshot ${screenshot.sort_order + 1}`}
                      className={`rounded-lg border border-gray-300 object-cover ${
                        screenshot.device_type === "android_tablet" ? "w-auto h-64 sm:h-80" : "w-36 h-64 sm:w-44 sm:h-80"
                      }`}
                    />
                  </div>
                )
              ))}
              {screenshots.length === 0 && previewVideos.length === 0 && (
                <div className="flex-shrink-0">
                  <div className="w-36 h-64 sm:w-44 sm:h-80 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-xs sm:text-sm">No previews yet</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promotional Text */}
        {appData.android_promo_text && (
          <div className="mb-6 pb-6 border-b bg-green-50 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Promotional Text</h2>
            <p className="text-sm text-gray-700">{appData.android_promo_text}</p>
          </div>
        )}

        {/* About this app */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">About this app</h2>
          <div className="flex items-start gap-2 mb-4">
            <Share className="h-5 w-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-700 line-clamp-3">
                {appData.android_short_description || appData.app_subtitle || "App description"}
              </p>
            </div>
          </div>
          {appData.android_full_description && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">{appData.android_full_description}</p>
            </div>
          )}
          <button type="button" className="text-sm text-green-700 font-medium">
            Read more
          </button>
        </div>

        {/* In-App Products Section */}
        {appData.has_in_app_purchases && appData.android_in_app_products && (
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-4">In-App Products</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{appData.android_in_app_products}</p>
            {appData.in_app_purchases_description && (
              <p className="text-sm text-gray-600 mt-2">{appData.in_app_purchases_description}</p>
            )}
          </div>
        )}

        {/* Ratings and reviews */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-medium text-gray-900">Ratings and reviews</h2>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-4 sm:mb-6">
            <div className="flex flex-col items-center">
              <div className="text-4xl sm:text-5xl font-normal text-gray-900 mb-2">
                {appData.rating?.toFixed(1) || "0.0"}
              </div>
              <div className="flex gap-1 mb-2">{renderStars(appData.rating || 0)}</div>
              <div className="text-xs text-gray-600">{appData.review_count?.toLocaleString() || "0"}</div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-600 w-3">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${Math.max(10, 90 - star * 15)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's new */}
        {appData.android_recent_changes && (
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-medium text-gray-900">What's new</h2>
              <button type="button" className="text-sm text-green-700">
                See more
              </button>
            </div>
            <p className="text-sm text-gray-700 line-clamp-4">{appData.android_recent_changes}</p>
            <p className="text-xs text-gray-500 mt-2">Updated 3 days ago</p>
          </div>
        )}

        {/* App support */}
        <div className="mb-8 pb-8 border-b">
          <h2 className="text-xl font-medium text-gray-900 mb-4">App support</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Developer contact</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Privacy policy</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Data safety */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900">Data safety</h2>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Shield className="h-6 w-6 text-gray-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 mb-2">
                Safety starts with understanding how developers collect and share your data. Data privacy and security
                practices may vary based on your use, region and age.
              </p>
              <button type="button" className="text-sm text-green-700 font-medium">
                See details
              </button>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mb-6 sm:mb-8 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Updated on</div>
              <div className="text-gray-900 text-xs sm:text-sm">15 Jan 2025</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Size</div>
              <div className="text-gray-900 text-xs sm:text-sm">Varies with device</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Installs</div>
              <div className="text-gray-900 text-xs sm:text-sm">{appData.download_count || "10,000+"}+</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Current version</div>
              <div className="text-gray-900 text-xs sm:text-sm">1.0.0</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Requires Android</div>
              <div className="text-gray-900 text-xs sm:text-sm">5.0 and up</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Content rating</div>
              <div className="text-gray-900 text-xs sm:text-sm">{appData.age_rating || "Rated for 3+"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
