import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeywordResearchSection } from "@/components/keyword-research-section"
import { KeywordResearchUpload } from "@/components/keyword-research-upload"
import { AdminLink } from "@/components/admin-link"
import { Search, FileSpreadsheet, Target } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getKeywords } from "@/app/actions"
import type { AppKeyword } from "@/lib/types"
import { getSelectedAppId, getAppDataOrLatest } from "@/lib/app-selection"

export default async function KeywordsPreview({ searchParams }: { searchParams?: Promise<{ appId?: string }> }) {
  // Get selected app ID from query param (from navbar), cookie, or use latest app
  const params = await searchParams
  const queryAppId = params?.appId || null
  const cookieAppId = await getSelectedAppId()
  const selectedAppId = queryAppId || cookieAppId
  const appData = await getAppDataOrLatest(selectedAppId)

  if (!appData) {
    redirect("/admin")
  }

  const keywords: AppKeyword[] = await getKeywords(appData.id!)
  const keywordResearchData = Array.isArray(appData.keyword_research_data) ? appData.keyword_research_data : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Navigation */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div>
            <Link href="/preview" className="text-blue-600 text-sm font-medium">
              ← Back to previews
            </Link>
          </div>
          <AdminLink href="/admin" size="sm" variant="outline">
            Edit Keywords
          </AdminLink>
        </div>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Keyword Research & Optimization</h1>
          <p className="text-lg text-slate-600">Comprehensive keyword analysis and optimization for maximum visibility</p>
        </div>

        {/* Final Keywords Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Final Keywords (ASO Implementation)</CardTitle>
                <CardDescription>Selected keywords optimized for App Store and Google Play Store ranking</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <KeywordResearchSection keywords={keywords} appData={appData} />
          </CardContent>
        </Card>

        {/* Full Keyword Research Section */}
        {keywordResearchData.length > 0 && (
          <Card className="mt-8 border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100">
                  <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Complete Keyword Research (Reference)</CardTitle>
                  <CardDescription className="text-base">
                    Full keyword research data showing the analysis methodology and all {keywordResearchData.length} researched keywords
                  </CardDescription>
                </div>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6">
                <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
                  <p className="text-2xl font-bold text-purple-600">{keywordResearchData.length}</p>
                  <p className="text-sm text-slate-600">Total Keywords</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <KeywordResearchUpload
                data={keywordResearchData}
                editable={false}
              />
            </CardContent>
          </Card>
        )}

        {/* No Keyword Research Data Message */}
        {keywordResearchData.length === 0 && (
          <Card className="mt-8 border-dashed border-2 border-slate-300">
            <CardContent className="py-12 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No keyword research data uploaded yet.</p>
              <p className="text-sm text-slate-400 mt-2">
                The admin can upload a CSV with the complete keyword research in the Admin panel.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Negative Keywords Section */}
        {appData.negative_keywords && Array.isArray(appData.negative_keywords) && appData.negative_keywords.length > 0 && (
          <Card className="mt-8 border-2 border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100">
                  <Search className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Negative Keywords</CardTitle>
                  <CardDescription className="text-base">
                    Keywords to exclude from targeting - {appData.negative_keywords.length} negative keywords
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {appData.negative_keywords.map((keyword, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-2 bg-red-50 rounded-md border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-red-900">{keyword}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
