import type { AppKeyword } from "@/lib/types"

/**
 * Export keywords to CSV format
 */
export function exportKeywordsToCSV(keywords: AppKeyword[]): string {
  const headers = [
    "Keyword",
    "Brand",
    "Category",
    "Relevancy Score",
    "Volume",
    "Difficulty",
    "Chance",
    "KEI",
    "Results",
    "Maximum Reach",
    "Priority",
    "Platform",
    "Recommended Field",
  ]

  const rows = keywords.map((k) => [
    k.keyword,
    k.brand ? "TRUE" : "FALSE",
    k.category,
    k.relevance_score.toString(),
    k.search_volume.toString(),
    k.difficulty.toString(),
    (k.chance ?? "").toString(),
    (k.kei ?? "").toString(),
    (k.results ?? "").toString(),
    (k.maximum_reach ?? "").toString(),
    k.priority,
    k.platform,
    k.recommended_field || "",
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  return csvContent
}

/**
 * Export keywords to Excel-compatible CSV (with .xlsx extension suggestion)
 */
export function exportKeywordsToExcel(keywords: AppKeyword[]): string {
  // Same as CSV but can be saved with .xlsx extension
  return exportKeywordsToCSV(keywords)
}

/**
 * Export optimized keyword sets to CSV
 */
export function exportOptimizedSetsToCSV(sets: {
  ios: {
    title: string[]
    subtitle: string[]
    keywordsField: string
    description: string[]
  }
  android: {
    title: string[]
    shortDescription: string[]
    fullDescription: string[]
  }
}): string {
  const rows: string[][] = []

  // iOS Section
  rows.push(["iOS Keywords"])
  rows.push(["Field", "Keywords"])
  rows.push(["Title", sets.ios.title.join(", ")])
  rows.push(["Subtitle", sets.ios.subtitle.join(", ")])
  rows.push(["Keywords Field (100 chars)", sets.ios.keywordsField])
  rows.push(["Description Keywords", sets.ios.description.join(", ")])

  rows.push([]) // Empty row

  // Android Section
  rows.push(["Android Keywords"])
  rows.push(["Field", "Keywords"])
  rows.push(["Title", sets.android.title.join(", ")])
  rows.push(["Short Description", sets.android.shortDescription.join(", ")])
  rows.push(["Full Description", sets.android.fullDescription.join(", ")])

  const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")

  return csvContent
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
