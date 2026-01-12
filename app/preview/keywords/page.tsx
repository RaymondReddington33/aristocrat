import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeywordResearchSection } from "@/components/keyword-research-section"
import { KeywordResearchUpload } from "@/components/keyword-research-upload"
import { Search, FileSpreadsheet, Target } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getKeywords } from "@/app/actions"
import type { AppKeyword } from "@/lib/types"
import { getSelectedAppId, getAppDataOrLatest } from "@/lib/app-selection"

export default async function KeywordsPreview({ searchParams }: { searchParams?: { appId?: string } }) {
  // Get selected app ID from query param (from navbar), cookie, or use latest app
  const queryAppId = searchParams?.appId || null
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
          <Button asChild size="sm" variant="outline">
            <Link href="/admin">Edit Keywords</Link>
          </Button>
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Complete Keyword Research (Reference)</CardTitle>
                  <CardDescription>
                    Full keyword research data showing the analysis methodology and all researched keywords
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <KeywordResearchUpload
                data={keywordResearchData}
                onChange={() => {}}
                editable={false}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
