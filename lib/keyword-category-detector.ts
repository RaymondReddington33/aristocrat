/**
 * Detect keyword category (branded, generic, competitor) based on keyword text and app data
 */

/**
 * Common competitor brands in the casino/gaming industry
 */
const COMPETITOR_BRANDS = [
  "slotomania",
  "doubleu casino",
  "house of fun",
  "big fish casino",
  "chumba casino",
  "pch slots",
  "jackpot party",
  "myvegas",
  "zkynga",
  "pokerstars",
  "888 casino",
  "betway",
  "bet365",
  "casino royale",
  "ignition casino",
  "bovada",
  "cafe casino",
  "las atlantis",
  "red dog casino",
  "super slots",
  "riversweeps",
  "betmgm",
  "caesars",
  "draftkings",
  "fanduel",
  "winstar",
  "foxwoods",
  "mohegan",
  "borgata",
  "hard rock",
]

/**
 * Detect if a keyword is branded (contains app name or brand terms)
 */
function isBrandedKeyword(keyword: string, appName?: string): boolean {
  if (!keyword) return false
  
  const keywordLower = keyword.toLowerCase().trim()
  
  // If app name is provided, check if keyword contains app name or parts of it
  if (appName) {
    const appNameLower = appName.toLowerCase().trim()
    const appNameWords = appNameLower.split(/\s+/).filter(w => w.length > 2) // Words longer than 2 chars
    
    // Check if keyword contains the full app name
    if (keywordLower.includes(appNameLower)) {
      return true
    }
    
    // Check if keyword contains significant parts of the app name
    for (const word of appNameWords) {
      if (word.length > 3 && keywordLower.includes(word)) {
        // Only consider it branded if the word appears as a whole word
        const regex = new RegExp(`\\b${word}\\b`, 'i')
        if (regex.test(keyword)) {
          return true
        }
      }
    }
  }
  
  // Check for common branded patterns (app name + casino, app name + slots, etc.)
  const brandedPatterns = [
    /\b(royal|palace|spin|casino)\s+(royal|palace|spin|casino)\b/i,
    /\b(app name)\s+(casino|slots|games|poker)\b/i,
  ]
  
  // If brand field is true in AppTweak data, it's likely branded
  // This will be handled by the caller if brand field is available
  
  return false
}

/**
 * Detect if a keyword is a competitor brand
 */
function isCompetitorKeyword(keyword: string): boolean {
  if (!keyword) return false
  
  const keywordLower = keyword.toLowerCase().trim()
  
  // Check against known competitor brands
  for (const competitor of COMPETITOR_BRANDS) {
    if (keywordLower.includes(competitor)) {
      // Check if it's a whole word match or close match
      const regex = new RegExp(`\\b${competitor.replace(/\s+/g, '\\s+')}\\b`, 'i')
      if (regex.test(keyword)) {
        return true
      }
    }
  }
  
  // Check for competitor patterns (competitor name + casino, etc.)
  const competitorPatterns = [
    /\b(slotomania|doubleu|house of fun|big fish|chumba|pch|jackpot party|myvegas)\s+(casino|slots|games)?\b/i,
  ]
  
  for (const pattern of competitorPatterns) {
    if (pattern.test(keyword)) {
      return true
    }
  }
  
  return false
}

/**
 * Detect keyword category based on keyword text, app data, and AppTweak metrics
 * @param keyword - The keyword text
 * @param appName - Optional app name to detect branded keywords
 * @param brand - Optional boolean from AppTweak indicating if it's a brand keyword
 * @returns "branded" | "generic" | "competitor"
 */
export function detectKeywordCategory(
  keyword: string,
  appName?: string,
  brand?: boolean
): "branded" | "generic" | "competitor" {
  if (!keyword || !keyword.trim()) {
    return "generic"
  }
  
  // If AppTweak marks it as a brand, prioritize that
  if (brand === true) {
    return "branded"
  }
  
  // Check for competitor brands first
  if (isCompetitorKeyword(keyword)) {
    return "competitor"
  }
  
  // Check for branded keywords
  if (isBrandedKeyword(keyword, appName)) {
    return "branded"
  }
  
  // Default to generic
  return "generic"
}

/**
 * Enhanced detection that also considers keyword characteristics
 */
export function detectKeywordCategoryEnhanced(
  keyword: string,
  options?: {
    appName?: string
    brand?: boolean
    searchVolume?: number
    difficulty?: number
    relevanceScore?: number
  }
): "branded" | "generic" | "competitor" {
  const { appName, brand, searchVolume, difficulty, relevanceScore } = options || {}
  
  // Base detection
  let category = detectKeywordCategory(keyword, appName, brand)
  
  // Additional heuristics for branded keywords
  if (category === "generic") {
    // Very high relevance (>90) with low difficulty might indicate branded
    if (relevanceScore !== undefined && relevanceScore > 90 && difficulty !== undefined && difficulty < 50) {
      // Check if keyword contains common branded terms
      const keywordLower = keyword.toLowerCase()
      const brandedTerms = ["royal", "palace", "spin", "casino", "slots", "poker"]
      const hasBrandedTerm = brandedTerms.some(term => keywordLower.includes(term))
      
      if (hasBrandedTerm && appName) {
        const appNameWords = appName.toLowerCase().split(/\s+/).filter(w => w.length > 2)
        const hasAppWord = appNameWords.some(word => keywordLower.includes(word))
        if (hasAppWord) {
          category = "branded"
        }
      }
    }
  }
  
  return category
}
