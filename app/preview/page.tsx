import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLink } from "@/components/admin-link"
import { Apple, Smartphone, FileText, Settings, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function PreviewSelector() {
  const supabase = await createClient()

  const { data: appData } = await supabase
    .from("app_data")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const hasData = !!appData?.app_name

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-balance">
              Preview Your ASO/ASA Presentation
            </h1>
            <p className="text-base sm:text-lg text-slate-600 text-pretty px-2">
              View your app store listings as they would appear on iOS and Android
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button asChild variant="outline" className="w-full sm:w-auto bg-transparent">
                <Link href="/">Home</Link>
              </Button>
              <AdminLink href="/admin" variant="outline" className="w-full sm:w-auto bg-transparent">
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </AdminLink>
            </div>
          </div>

          {!hasData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-center">
              <p className="text-amber-800 text-sm">
                No app data found. Please contact the administrator to configure app details.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer group">
              <Link href="/preview/ios" prefetch={true} className="block">
                <CardHeader>
                  <Apple className="h-10 w-10 sm:h-12 sm:w-12 text-slate-700 mb-2 group-hover:text-blue-500 transition-colors" />
                  <CardTitle className="text-lg sm:text-xl">iOS App Store</CardTitle>
                  <CardDescription className="text-sm">
                    View your app listing as it appears on the Apple App Store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Authentic iOS design</li>
                    <li>• San Francisco font</li>
                    <li>• Apple UI elements</li>
                    <li>• Ratings & reviews</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-2 hover:border-green-600 transition-colors cursor-pointer group">
              <Link href="/preview/android" prefetch={true} className="block">
                <CardHeader>
                  <Smartphone className="h-10 w-10 sm:h-12 sm:w-12 text-slate-700 mb-2 group-hover:text-green-600 transition-colors" />
                  <CardTitle className="text-lg sm:text-xl">Google Play</CardTitle>
                  <CardDescription className="text-sm">
                    View your app listing as it appears on the Google Play Store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Material Design</li>
                    <li>• Roboto font family</li>
                    <li>• Google UI patterns</li>
                    <li>• Install metrics</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-2 hover:border-purple-500 transition-colors cursor-pointer group">
              <Link href="/preview/brief" className="block">
                <CardHeader>
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-slate-700 mb-2 group-hover:text-purple-500 transition-colors" />
                  <CardTitle className="text-lg sm:text-xl">Creative Brief</CardTitle>
                  <CardDescription className="text-sm">
                    View your comprehensive ASO/ASA strategy documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Target audience</li>
                    <li>• Key messaging</li>
                    <li>• Visual guidelines</li>
                    <li>• Competitor analysis</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-2 hover:border-indigo-500 transition-colors cursor-pointer group">
              <Link href="/preview/keywords" className="block">
                <CardHeader>
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 text-slate-700 mb-2 group-hover:text-indigo-500 transition-colors" />
                  <CardTitle className="text-lg sm:text-xl">Keyword Research</CardTitle>
                  <CardDescription className="text-sm">
                    Comprehensive keyword analysis and optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Keyword metrics</li>
                    <li>• Platform analysis</li>
                    <li>• Optimized sets</li>
                    <li>• Visualizations</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>
          </div>

          {hasData && appData && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 text-base sm:text-lg">Current App Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">App Name:</span>
                  <span className="ml-2 text-slate-900 font-medium break-words">{appData.app_name}</span>
                </div>
                <div>
                  <span className="text-slate-600">Category:</span>
                  <span className="ml-2 text-slate-900 font-medium">{appData.category || "Not set"}</span>
                </div>
                <div>
                  <span className="text-slate-600">Rating:</span>
                  <span className="ml-2 text-slate-900 font-medium">
                    {appData.rating?.toFixed(1) || "0.0"} ({appData.review_count || 0} reviews)
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Price:</span>
                  <span className="ml-2 text-slate-900 font-medium">{appData.price || "Free"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
