import type { AppData, AppKeyword } from "@/lib/types"

/**
 * Calculate individual keyword density for a specific keyword
 * Density = (Number of occurrences of this keyword / Total words in ASO fields) * 100
 */
export function calculateIndividualKeywordDensity(
  keyword: string,
  appData: AppData
): number {
  const keywordLower = keyword.toLowerCase().trim()

  // iOS ASO fields
  const iosFields = [
    appData.ios_app_name || "",
    appData.ios_subtitle || "",
    appData.ios_keywords || "",
    appData.ios_description || "",
  ].filter(Boolean)

  // Android ASO fields
  const androidFields = [
    appData.android_app_name || "",
    appData.android_short_description || "",
    appData.android_full_description || "",
  ].filter(Boolean)

  // Combine all fields
  const allFields = [...iosFields, ...androidFields]
  const allText = allFields.join(" ").toLowerCase()

  if (!allText.trim()) return 0

  // Count total words in ASO fields
  const normalizedText = allText.replace(/[^\w\s]/g, " ")
  const words = normalizedText.split(/\s+/).filter((w) => w.length > 0)
  const totalWords = words.length

  if (totalWords === 0) return 0

  // Count occurrences of this specific keyword (as whole word)
  const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
  const matches = allText.match(regex)
  const keywordOccurrences = matches ? matches.length : 0

  // Calculate density percentage
  const density = (keywordOccurrences / totalWords) * 100

  return Math.round(density * 10) / 10 // Round to 1 decimal place
}

/**
 * Calculate keyword density percentage across all ASO fields
 * Keyword density = (Number of keyword occurrences / Total words in ASO fields) * 100
 */
export function calculateKeywordDensity(
  keywords: AppKeyword[],
  appData: AppData
): { ios: number; android: number; overall: number } {
  // Extract keyword strings (lowercase for case-insensitive matching)
  const keywordStrings = keywords.map((k) => k.keyword.toLowerCase().trim())

  // iOS ASO fields
  const iosFields = [
    appData.ios_app_name || "",
    appData.ios_subtitle || "",
    appData.ios_keywords || "",
    appData.ios_description || "",
  ].filter(Boolean)

  // Android ASO fields
  const androidFields = [
    appData.android_app_name || "",
    appData.android_short_description || "",
    appData.android_full_description || "",
  ].filter(Boolean)

  // Combine all fields for overall calculation
  const allFields = [...iosFields, ...androidFields]

  // Helper function to count words and keyword occurrences in text
  function analyzeText(text: string): { totalWords: number; keywordOccurrences: number } {
    if (!text) return { totalWords: 0, keywordOccurrences: 0 }

    // Normalize text: lowercase, remove punctuation, split into words
    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, " ")
    const words = normalizedText.split(/\s+/).filter((w) => w.length > 0)
    const totalWords = words.length

    // Count keyword occurrences (each keyword can appear multiple times)
    let keywordOccurrences = 0
    for (const keyword of keywordStrings) {
      // Count occurrences of the keyword (as whole word)
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
      const matches = text.match(regex)
      if (matches) {
        keywordOccurrences += matches.length
      }
    }

    return { totalWords, keywordOccurrences }
  }

  // Calculate for iOS
  const iosAnalysis = iosFields.reduce(
    (acc, field) => {
      const analysis = analyzeText(field)
      return {
        totalWords: acc.totalWords + analysis.totalWords,
        keywordOccurrences: acc.keywordOccurrences + analysis.keywordOccurrences,
      }
    },
    { totalWords: 0, keywordOccurrences: 0 }
  )

  // Calculate for Android
  const androidAnalysis = androidFields.reduce(
    (acc, field) => {
      const analysis = analyzeText(field)
      return {
        totalWords: acc.totalWords + analysis.totalWords,
        keywordOccurrences: acc.keywordOccurrences + analysis.keywordOccurrences,
      }
    },
    { totalWords: 0, keywordOccurrences: 0 }
  )

  // Calculate for Overall
  const overallAnalysis = allFields.reduce(
    (acc, field) => {
      const analysis = analyzeText(field)
      return {
        totalWords: acc.totalWords + analysis.totalWords,
        keywordOccurrences: acc.keywordOccurrences + analysis.keywordOccurrences,
      }
    },
    { totalWords: 0, keywordOccurrences: 0 }
  )

  // Calculate percentages
  const iosDensity = iosAnalysis.totalWords > 0
    ? (iosAnalysis.keywordOccurrences / iosAnalysis.totalWords) * 100
    : 0

  const androidDensity = androidAnalysis.totalWords > 0
    ? (androidAnalysis.keywordOccurrences / androidAnalysis.totalWords) * 100
    : 0

  const overallDensity = overallAnalysis.totalWords > 0
    ? (overallAnalysis.keywordOccurrences / overallAnalysis.totalWords) * 100
    : 0

  return {
    ios: Math.round(iosDensity * 10) / 10, // Round to 1 decimal place
    android: Math.round(androidDensity * 10) / 10,
    overall: Math.round(overallDensity * 10) / 10,
  }
}
