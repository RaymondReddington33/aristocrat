import type { AppKeyword } from "@/lib/types"
import { detectKeywordCategoryEnhanced } from "./keyword-category-detector"
import { calculateKeywordPriority, recommendField } from "./keyword-optimizer"

/**
 * Parse keywords from CSV file
 */
export async function parseKeywordsFromCSV(
  file: File,
  appName?: string
): Promise<Omit<AppKeyword, "id" | "created_at" | "updated_at">[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          reject(new Error("CSV file must have at least a header row and one data row"))
          return
        }

        // Parse header
        const headers = parseCSVLine(lines[0])
        const keywordIndex = headers.findIndex((h) => h.toLowerCase().includes("keyword"))
        const volumeIndex = headers.findIndex((h) => h.toLowerCase().includes("volume") || h.toLowerCase().includes("search"))
        const difficultyIndex = headers.findIndex((h) => h.toLowerCase().includes("difficulty"))
        const relevanceIndex = headers.findIndex((h) => h.toLowerCase().includes("relevance") || h.toLowerCase().includes("relevancy"))
        const categoryIndex = headers.findIndex((h) => h.toLowerCase().includes("category"))
        const priorityIndex = headers.findIndex((h) => h.toLowerCase().includes("priority"))
        const platformIndex = headers.findIndex((h) => h.toLowerCase().includes("platform"))
        const fieldIndex = headers.findIndex((h) => h.toLowerCase().includes("field") || h.toLowerCase().includes("recommended"))
        // AppTweak fields
        const brandIndex = headers.findIndex((h) => h.toLowerCase() === "brand")
        const chanceIndex = headers.findIndex((h) => h.toLowerCase().includes("chance"))
        const keiIndex = headers.findIndex((h) => h.toLowerCase() === "kei")
        const resultsIndex = headers.findIndex((h) => h.toLowerCase().includes("results"))
        const growthIndex = headers.findIndex((h) => h.toLowerCase().includes("growth"))
        const monthlyDownloadsIndex = headers.findIndex((h) => h.toLowerCase().includes("monthly downloads"))
        const maximumReachIndex = headers.findIndex((h) => h.toLowerCase().includes("maximum reach"))
        const conversionRateIndex = headers.findIndex((h) => h.toLowerCase().includes("conversion rate"))

        if (keywordIndex === -1) {
          reject(new Error("CSV must contain a 'Keyword' column"))
          return
        }

        // Parse data rows
        const keywords: Omit<AppKeyword, "id" | "created_at" | "updated_at">[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          const keyword = values[keywordIndex]?.trim()

          if (!keyword) continue

          // Parse brand (TRUE/FALSE string to boolean) - must be done before category detection
          const brandValue = brandIndex >= 0 ? values[brandIndex]?.trim().toUpperCase() : undefined
          const brand = brandValue === "TRUE" || brandValue === "1" || brandValue === "YES"

          // Parse metrics for category detection
          const searchVolume = volumeIndex >= 0 ? parseInt(values[volumeIndex]?.replace(/,/g, '') || "0", 10) || 0 : 0
          const difficulty = difficultyIndex >= 0 ? parseFloat(values[difficultyIndex] || "0") || 0 : 0
          const relevanceScore = relevanceIndex >= 0 ? parseFloat(values[relevanceIndex] || "0") || 0 : 0
          
          // Detect or validate category
          let categoryValue: string
          if (categoryIndex >= 0) {
            // Category provided in CSV, validate it
            const csvCategory = values[categoryIndex]?.toLowerCase().trim() || ""
            if (["branded", "generic", "competitor"].includes(csvCategory)) {
              categoryValue = csvCategory
            } else {
              // Invalid category in CSV, detect automatically
              categoryValue = detectKeywordCategoryEnhanced(keyword, {
                appName,
                brand,
                searchVolume,
                difficulty,
                relevanceScore,
              })
            }
          } else {
            // No category column, detect automatically
            categoryValue = detectKeywordCategoryEnhanced(keyword, {
              appName,
              brand,
              searchVolume,
              difficulty,
              relevanceScore,
            })
          }
          
          const validCategory = categoryValue as "branded" | "generic" | "competitor"

          // Validate platform
          const platformValue = platformIndex >= 0 ? values[platformIndex]?.toLowerCase().trim() : "both"
          const validPlatform = ["ios", "android", "both"].includes(platformValue) 
            ? platformValue 
            : "both"

          // Build keyword object for algorithm calculation
          const keywordData: any = {
            keyword,
            search_volume: volumeIndex >= 0 ? parseInt(values[volumeIndex]?.replace(/,/g, '') || "0", 10) || 0 : 0,
            difficulty: difficultyIndex >= 0 ? parseFloat(values[difficultyIndex] || "0") || 0 : 0,
            relevance_score: relevanceIndex >= 0 ? parseFloat(values[relevanceIndex] || "0") || 0 : 0,
            category: validCategory,
            platform: validPlatform,
            brand: brand,
            chance: chanceIndex >= 0 ? parseFloat(values[chanceIndex] || "0") || undefined : undefined,
            kei: keiIndex >= 0 ? parseFloat(values[keiIndex] || "0") || undefined : undefined,
            results: resultsIndex >= 0 ? parseInt(values[resultsIndex]?.replace(/,/g, '') || "0", 10) || undefined : undefined,
            maximum_reach: maximumReachIndex >= 0 ? parseInt(values[maximumReachIndex]?.replace(/,/g, '') || "0", 10) || undefined : undefined,
            conversion_rate: conversionRateIndex >= 0 ? parseFloat(values[conversionRateIndex] || "0") || undefined : undefined,
          }

          // Calculate priority automatically if not provided or invalid
          let calculatedPriority: "high" | "medium" | "low"
          const priorityValue = priorityIndex >= 0 ? values[priorityIndex]?.toLowerCase().trim() : ""
          if (["high", "medium", "low"].includes(priorityValue)) {
            // Use provided priority if valid
            calculatedPriority = priorityValue as "high" | "medium" | "low"
          } else {
            // Calculate priority automatically using the algorithm
            calculatedPriority = calculateKeywordPriority(keywordData)
          }

          // Calculate recommended_field automatically if not provided or invalid
          let calculatedRecommendedField: "title" | "subtitle" | "keywords" | "description" | undefined
          const fieldValue = fieldIndex >= 0 ? values[fieldIndex]?.toLowerCase().trim() : ""
          if (["title", "subtitle", "keywords", "description"].includes(fieldValue)) {
            // Use provided recommended_field if valid
            calculatedRecommendedField = fieldValue as "title" | "subtitle" | "keywords" | "description"
          } else {
            // Calculate recommended_field automatically based on platform
            // If platform is "both", use iOS as default (can be refined later)
            const targetPlatform = validPlatform === "android" ? "android" : "ios"
            calculatedRecommendedField = recommendField(keywordData, targetPlatform)
          }

          keywords.push({
            app_data_id: "", // Will be set by caller
            keyword,
            search_volume: keywordData.search_volume,
            difficulty: keywordData.difficulty,
            relevance_score: keywordData.relevance_score,
            category: validCategory as "branded" | "generic" | "competitor",
            priority: calculatedPriority,
            platform: validPlatform as "ios" | "android" | "both",
            recommended_field: calculatedRecommendedField,
            // AppTweak fields
            brand: brandIndex >= 0 ? brand : undefined,
            chance: chanceIndex >= 0 ? parseFloat(values[chanceIndex] || "0") || undefined : undefined,
            kei: keiIndex >= 0 ? parseFloat(values[keiIndex] || "0") || undefined : undefined,
            results: resultsIndex >= 0 ? parseInt(values[resultsIndex]?.replace(/,/g, '') || "0", 10) || undefined : undefined,
            growth_yesterday: growthIndex >= 0 ? parseFloat(values[growthIndex] || "0") || undefined : undefined,
            monthly_downloads: monthlyDownloadsIndex >= 0 ? parseInt(values[monthlyDownloadsIndex]?.replace(/,/g, '') || "0", 10) || undefined : undefined,
            maximum_reach: maximumReachIndex >= 0 ? parseInt(values[maximumReachIndex]?.replace(/,/g, '') || "0", 10) || undefined : undefined,
            conversion_rate: conversionRateIndex >= 0 ? parseFloat(values[conversionRateIndex] || "0") || undefined : undefined,
            sort_order: keywords.length,
          })
        }

        resolve(keywords)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Add last field
  result.push(current.trim())

  return result
}
