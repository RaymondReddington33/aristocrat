import type { AppKeyword } from "@/lib/types"

/**
 * Calculate comprehensive keyword score using multiple metrics
 * This score is used for ranking and prioritization
 */
export function calculateKeywordScore(keyword: AppKeyword): number {
  // Normalize volume to 0-100 scale (assuming max volume of 500000)
  const normalizedVolume = Math.min((keyword.search_volume / 500000) * 100, 100)
  
  // Base score: volume (30%) + relevance (30%) - difficulty (20%)
  let score = (normalizedVolume * 0.3) + (keyword.relevance_score * 0.3) - (keyword.difficulty * 0.2)
  
  // Bonus for KEI if available (higher KEI = better efficiency)
  if (keyword.kei !== undefined && keyword.kei !== null) {
    const normalizedKEI = Math.min((keyword.kei / 100) * 10, 10) // Max 10 points
    score += normalizedKEI * 0.1
  }
  
  // Bonus for high conversion rate
  if (keyword.conversion_rate !== undefined && keyword.conversion_rate !== null) {
    score += (keyword.conversion_rate / 100) * 10 * 0.1 // Max 10% boost
  }
  
  // Bonus for positive growth trend
  if (keyword.growth_yesterday !== undefined && keyword.growth_yesterday !== null && keyword.growth_yesterday > 0) {
    const growthBonus = Math.min(keyword.growth_yesterday / 10, 5) // Max 5 points
    score += growthBonus * 0.1
  }
  
  // Bonus for high chance of ranking
  if (keyword.chance !== undefined && keyword.chance !== null) {
    score += (keyword.chance / 100) * 5 * 0.1 // Max 5 points
  }
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate keyword priority based on comprehensive ASO best practices
 * Uses multiple factors: volume, difficulty, relevance, KEI, conversion, growth, category
 */
export function calculateKeywordPriority(keyword: AppKeyword): "high" | "medium" | "low" {
  const score = calculateKeywordScore(keyword)
  
  // Category multipliers (branded keywords get priority boost)
  let categoryMultiplier = 1.0
  if (keyword.category === "branded") {
    categoryMultiplier = 1.3 // 30% boost for branded keywords
  } else if (keyword.category === "competitor") {
    categoryMultiplier = 0.9 // Slightly lower for competitor keywords
  }
  
  // Brand boost (if marked as brand)
  if (keyword.brand === true) {
    categoryMultiplier *= 1.2 // Additional 20% boost
  }
  
  // Additional rules for edge cases (checked before score-based logic)
  
  // High priority for branded keywords with decent metrics
  if (keyword.category === "branded" && keyword.relevance_score >= 70 && keyword.difficulty <= 60) {
    return "high"
  }
  
  // High priority for high-volume, medium-difficulty keywords
  if (keyword.search_volume >= 10000 && keyword.difficulty <= 50 && keyword.relevance_score >= 60) {
    return "high"
  }
  
  // High priority for excellent KEI (>50) with good relevance
  if (keyword.kei !== undefined && keyword.kei >= 50 && keyword.relevance_score >= 70) {
    return "high"
  }
  
  // Low priority for very difficult keywords (>80) unless they have exceptional volume/relevance
  if (keyword.difficulty > 80 && keyword.search_volume < 5000 && keyword.relevance_score < 70) {
    return "low"
  }
  
  // Low priority for very low volume (<100) unless highly relevant
  if (keyword.search_volume < 100 && keyword.relevance_score < 80) {
    return "low"
  }
  
  // Use the adjusted score for final determination
  const adjustedScore = score * categoryMultiplier
  
  // Priority thresholds (adjusted for category)
  // High: Top 25% of potential keywords
  // Medium: Middle 50% of potential keywords
  // Low: Bottom 25% of potential keywords
  if (adjustedScore >= 70) {
    return "high"
  } else if (adjustedScore >= 40) {
    return "medium"
  } else {
    return "low"
  }
}

/**
 * Recommend the best field for a keyword based on ASO best practices
 * iOS: Title (30 chars), Subtitle (30 chars), Keywords (100 chars), Description (4000 chars)
 * Android: Title (50 chars), Short Description (80 chars), Full Description (4000 chars)
 */
export function recommendField(keyword: AppKeyword, platform: "ios" | "android"): "title" | "subtitle" | "keywords" | "description" {
  const score = calculateKeywordScore(keyword)
  const priority = keyword.priority || calculateKeywordPriority(keyword)
  
  if (platform === "ios") {
    // iOS App Store optimization rules
    
    // Title (30 chars max) - Most valuable placement
    // Rules for Title:
    // 1. Branded keywords (always high priority)
    // 2. High priority keywords with excellent scores (>75)
    // 3. High volume (>5000) + high relevance (>80) + medium-low difficulty (<60)
    if (
      keyword.category === "branded" ||
      (priority === "high" && score > 75) ||
      (keyword.search_volume >= 5000 && keyword.relevance_score >= 80 && keyword.difficulty < 60)
    ) {
      return "title"
    }
    
    // Subtitle (30 chars max) - Second most valuable
    // Rules for Subtitle:
    // 1. High priority keywords with good scores (>65)
    // 2. High KEI (>40) with good relevance (>70)
    // 3. High conversion rate (>5%) with decent volume
    if (
      (priority === "high" && score > 65) ||
      (keyword.kei !== undefined && keyword.kei > 40 && keyword.relevance_score > 70) ||
      (keyword.conversion_rate !== undefined && keyword.conversion_rate > 5 && keyword.search_volume > 1000)
    ) {
      return "subtitle"
    }
    
    // Keywords field (100 chars max) - Third priority
    // Rules for Keywords:
    // 1. Medium-high priority keywords
    // 2. Good scores (>50) but not excellent enough for title/subtitle
    // 3. Medium volume (1000-10000) with good relevance
    if (
      priority === "medium" ||
      (score > 50 && score <= 65) ||
      (keyword.search_volume >= 1000 && keyword.search_volume < 10000 && keyword.relevance_score >= 60)
    ) {
      return "keywords"
    }
    
    // Description - Everything else
    // Lower priority keywords, long-tail keywords, supportive keywords
    return "description"
    
  } else {
    // Android Google Play optimization rules
    
    // Title (50 chars max) - Most valuable placement
    // Rules for Title:
    // 1. Branded keywords (always)
    // 2. High priority with excellent scores (>70)
    // 3. Very high volume (>10000) + high relevance (>75) + low-medium difficulty (<55)
    if (
      keyword.category === "branded" ||
      (priority === "high" && score > 70) ||
      (keyword.search_volume >= 10000 && keyword.relevance_score >= 75 && keyword.difficulty < 55)
    ) {
      return "title"
    }
    
    // Short Description (80 chars max) - Second most valuable
    // Rules for Short Description:
    // 1. High priority keywords with good scores (>55)
    // 2. High volume (>3000) with good relevance (>65)
    // 3. High conversion rate (>4%) or high KEI (>35)
    if (
      (priority === "high" && score > 55) ||
      (keyword.search_volume >= 3000 && keyword.relevance_score >= 65) ||
      (keyword.conversion_rate !== undefined && keyword.conversion_rate > 4) ||
      (keyword.kei !== undefined && keyword.kei > 35 && keyword.relevance_score > 65)
    ) {
      return "description" // For Android, description means short description in context
    }
    
    // Full Description - Everything else
    // Lower priority keywords, long-tail keywords, supportive keywords
    // Note: Android doesn't have a separate "keywords" field like iOS
    // So we return "description" for both short and full descriptions
    // The optimization functions will handle the distinction
    return "description"
  }
}

/**
 * Optimize iOS keywords to fit in 100 character limit
 * Prioritizes high-scoring keywords and ensures branded terms are included
 */
export function optimizeIOSKeywords(keywords: AppKeyword[]): {
  title: string[]
  subtitle: string[]
  keywordsField: string // Comma-separated, max 100 chars
  description: string[]
} {
  // Sort by score descending, with priority boost
  const sorted = [...keywords]
    .filter(k => k.platform === "ios" || k.platform === "both")
    .map(k => ({ 
      ...k, 
      score: calculateKeywordScore(k),
      priority: k.priority || calculateKeywordPriority(k)
    }))
    .sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      // Then by score
      return b.score - a.score
    })

  const title: string[] = []
  const subtitle: string[] = []
  const keywordsField: string[] = []
  const description: string[] = []

  // Title: Branded + top high-priority keywords (max 30 chars)
  let titleLength = 0
  for (const k of sorted) {
    if (titleLength >= 30) break
    
    const recommended = recommendField(k, "ios")
    if (recommended === "title") {
      const keywordWithSpace = titleLength === 0 ? k.keyword : ` ${k.keyword}`
      if (titleLength + keywordWithSpace.length <= 30) {
        title.push(k.keyword)
        titleLength += keywordWithSpace.length
      }
    }
  }

  // Keywords field: High-priority keywords that fit (max 100 chars)
  let keywordsLength = 0
  for (const k of sorted) {
    if (title.includes(k.keyword)) continue
    
    const recommended = recommendField(k, "ios")
    if (recommended === "keywords") {
      const keywordWithComma = keywordsLength === 0 ? k.keyword : `,${k.keyword}`
      if (keywordsLength + keywordWithComma.length <= 100) {
        keywordsField.push(k.keyword)
        keywordsLength += keywordWithComma.length
      }
    }
  }

  // Subtitle: High-scoring keywords that didn't fit in title/keywords (max 30 chars)
  let subtitleLength = 0
  for (const k of sorted) {
    if (title.includes(k.keyword) || keywordsField.includes(k.keyword)) continue
    
    const recommended = recommendField(k, "ios")
    if (recommended === "subtitle") {
      const keywordWithSpace = subtitleLength === 0 ? k.keyword : ` ${k.keyword}`
      if (subtitleLength + keywordWithSpace.length <= 30) {
        subtitle.push(k.keyword)
        subtitleLength += keywordWithSpace.length
      }
    }
  }

  // Description: All remaining keywords
  sorted.forEach(k => {
    if (!title.includes(k.keyword) && !subtitle.includes(k.keyword) && !keywordsField.includes(k.keyword)) {
      description.push(k.keyword)
    }
  })

  return {
    title,
    subtitle,
    keywordsField: keywordsField.join(","),
    description
  }
}

/**
 * Optimize Android keywords for title and descriptions
 */
export function optimizeAndroidKeywords(keywords: AppKeyword[]): {
  title: string[] // Max 50 chars
  shortDescription: string[] // Max 80 chars
  fullDescription: string[]
} {
  // Sort by score descending, with priority boost
  const sorted = [...keywords]
    .filter(k => k.platform === "android" || k.platform === "both")
    .map(k => ({ 
      ...k, 
      score: calculateKeywordScore(k),
      priority: k.priority || calculateKeywordPriority(k)
    }))
    .sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      // Then by score
      return b.score - a.score
    })

  const title: string[] = []
  const shortDescription: string[] = []
  const fullDescription: string[] = []

  // Title: Branded + top high-priority keywords (max 50 chars)
  let titleLength = 0
  for (const k of sorted) {
    if (titleLength >= 50) break
    
    const recommended = recommendField(k, "android")
    if (recommended === "title") {
      const keywordWithSpace = titleLength === 0 ? k.keyword : ` ${k.keyword}`
      if (titleLength + keywordWithSpace.length <= 50) {
        title.push(k.keyword)
        titleLength += keywordWithSpace.length
      }
    }
  }

  // Short description: High-priority keywords (max 80 chars)
  let shortDescLength = 0
  for (const k of sorted) {
    if (title.includes(k.keyword)) continue
    
    const recommended = recommendField(k, "android")
    if (recommended === "description" && k.priority === "high") {
      const keywordWithSpace = shortDescLength === 0 ? k.keyword : ` ${k.keyword}`
      if (shortDescLength + keywordWithSpace.length <= 80) {
        shortDescription.push(k.keyword)
        shortDescLength += keywordWithSpace.length
      }
    }
  }

  // Full description: All remaining keywords
  sorted.forEach(k => {
    if (!title.includes(k.keyword) && !shortDescription.includes(k.keyword)) {
      fullDescription.push(k.keyword)
    }
  })

  return {
    title,
    shortDescription,
    fullDescription
  }
}

/**
 * Generate optimized keyword sets for both platforms
 */
export function generateOptimizedKeywordSets(keywords: AppKeyword[]): {
  ios: ReturnType<typeof optimizeIOSKeywords>
  android: ReturnType<typeof optimizeAndroidKeywords>
} {
  return {
    ios: optimizeIOSKeywords(keywords),
    android: optimizeAndroidKeywords(keywords)
  }
}
