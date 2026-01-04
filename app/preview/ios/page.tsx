import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Star, Download, Share2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getScreenshots, getPreviewVideos } from "@/app/actions"

export default async function IOSPreview() {
  const supabase = await createClient()

  const { data: appData } = await supabase
    .from("app_data")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!appData) {
    redirect("/admin")
  }

  // Fetch all data in parallel for maximum performance
  const [screenshots, previewVideos] = await Promise.all([
    getScreenshots(appData.id, "ios"),
    getPreviewVideos(appData.id, "ios")
  ])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-blue-500 text-blue-500" : "fill-gray-300 text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between max-w-4xl">
          <Link href="/preview" className="text-blue-600 text-xs sm:text-sm font-medium">
            ← Back
          </Link>
          <span className="text-xs text-gray-500">iOS App Store Preview</span>
        </div>
      </div>

      {/* iOS App Store Layout */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        {/* Header Section */}
        <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
          <div className="flex-shrink-0">
            <img
              src={appData.app_icon_url || "/placeholder.svg?height=120&width=120"}
              alt="App icon"
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl shadow-md"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 truncate">
              {appData.ios_app_name || appData.app_name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">
              {appData.ios_subtitle || appData.app_subtitle}
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
              <span>{appData.category || "Productivity"}</span>
              <span>•</span>
              <span>{appData.age_rating || "4+"}</span>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 sm:px-8 h-8 sm:h-9 text-sm sm:text-base font-semibold">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                GET
              </Button>
              <button
                type="button"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 flex-shrink-0"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6 py-3 sm:py-4 border-y text-center">
          <div>
            <div className="text-gray-500 text-[10px] sm:text-xs mb-1">RATINGS</div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{appData.rating?.toFixed(1) || "0.0"}</span>
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-gray-400 text-gray-400" />
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">
              {appData.review_count?.toLocaleString() || "0"} Ratings
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] sm:text-xs mb-1">AGE</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{appData.age_rating || "4+"}</div>
            <div className="text-[10px] sm:text-xs text-gray-500">Years Old</div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] sm:text-xs mb-1">CHART</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">—</div>
            <div className="text-[10px] sm:text-xs text-gray-500 truncate">{appData.category || "Category"}</div>
          </div>
        </div>

        {/* What's New Section */}
        {appData.ios_whats_new && (
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">What's New</h2>
              <button type="button" className="text-xs text-gray-500">
                Version History
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{appData.ios_whats_new}</p>
          </div>
        )}

        {/* Screenshots Section */}
        {(screenshots.length > 0 || previewVideos.length > 0) && (
          <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Preview</h2>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4">
              {previewVideos.map((video) => (
                video.video_url && (
                  <div key={video.id} className="flex-shrink-0 relative group">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-36 h-72 sm:w-48 sm:h-96 rounded-xl sm:rounded-2xl border border-gray-300 object-cover"
                      />
                    ) : (
                      <div className="w-36 h-72 sm:w-48 sm:h-96 rounded-xl sm:rounded-2xl border border-gray-300 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs sm:text-sm">Video</span>
                      </div>
                    )}
                    <video
                      src={video.video_url}
                      className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl object-cover opacity-0 group-hover:opacity-100 transition-opacity"
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
                      className={`rounded-xl sm:rounded-2xl border border-gray-300 object-cover ${
                        screenshot.device_type === "ipad" ? "w-auto h-72 sm:h-96" : "w-36 h-72 sm:w-48 sm:h-96"
                      }`}
                    />
                  </div>
                )
              ))}
              {screenshots.length === 0 && previewVideos.length === 0 && (
                <div className="flex-shrink-0">
                  <div className="w-36 h-72 sm:w-48 sm:h-96 bg-gray-200 rounded-xl sm:rounded-2xl border border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-xs sm:text-sm">No previews yet</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description Section */}
        {appData.ios_description && (
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line">{appData.ios_description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Promotional Text Section */}
        {appData.ios_promotional_text && (
          <div className="mb-6 pb-6 border-b bg-blue-50 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Promotional Text</h2>
            <p className="text-sm text-gray-700">{appData.ios_promotional_text}</p>
          </div>
        )}

        {/* In-App Purchases Section */}
        {appData.has_in_app_purchases && appData.ios_in_app_purchases && (
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-3">In-App Purchases</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{appData.ios_in_app_purchases}</p>
            {appData.in_app_purchases_description && (
              <p className="text-sm text-gray-600 mt-2">{appData.in_app_purchases_description}</p>
            )}
          </div>
        )}

        {/* Ratings & Reviews */}
        <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ratings & Reviews</h2>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1">
                {appData.rating?.toFixed(1) || "0.0"}
              </div>
              <div className="flex gap-1 mb-1 justify-center">{renderStars(appData.rating || 0)}</div>
              <div className="text-xs text-gray-500">{appData.review_count?.toLocaleString() || "0"} Ratings</div>
            </div>
            <div className="flex-1 w-full">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <div className="flex gap-1">
                    {Array.from({ length: star }).map((_, i) => (
                      <Star key={i} className="h-2 w-2 fill-gray-400 text-gray-400" />
                    ))}
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${80 - star * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Developer</span>
              <span className="text-sm text-blue-600">Developer Name</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Size</span>
              <span className="text-sm text-gray-900">125.4 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Category</span>
              <span className="text-sm text-blue-600">{appData.category || "Productivity"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compatibility</span>
              <span className="text-sm text-gray-900">iPhone</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Languages</span>
              <span className="text-sm text-blue-600">English + 5 more</span>
            </div>
            {appData.has_in_app_purchases && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In-App Purchases</span>
                <span className="text-sm text-blue-600">Yes</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Age Rating</span>
              <span className="text-sm text-gray-900">{appData.age_rating || "4+"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-sm text-gray-900">{appData.price || "Free"}</span>
            </div>
          </div>
        </div>

        {/* App Privacy */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">App Privacy</h2>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            The developer has indicated that this app's privacy practices may include handling of data as described
            below.
          </p>
        </div>
      </div>
    </div>
  )
}
