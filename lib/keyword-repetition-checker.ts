/**
 * Keyword Repetition Checker - ASO 2026 Rules
 * 
 * Base rule: DO NOT repeat exact keywords between indexable fields
 * - iOS: Title, Subtitle, Keywords field
 * - Android: Title, Short Description, Long Description
 */

export interface KeywordRepetitionIssue {
  keyword: string
  fields: string[]
  severity: "error" | "warning"
  message: string
  recommendation?: string
}

export interface RepetitionCheckResult {
  platform: "ios" | "android"
  hasIssues: boolean
  issues: KeywordRepetitionIssue[]
  score: number // 0-100, lower = more issues
}

/**
 * Normalize keyword for comparison (lowercase, trim, handle plurals)
 */
function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().trim()
}

/**
 * Check if two keywords are the same (including singular/plural variations)
 * Apple considers singular/plural as equivalent
 */
function areKeywordsEquivalent(keyword1: string, keyword2: string): boolean {
  const normalized1 = normalizeKeyword(keyword1)
  const normalized2 = normalizeKeyword(keyword2)
  
  // Exact match
  if (normalized1 === normalized2) return true
  
  // Singular/plural variations (simple check)
  // Remove trailing 's' or 'es' and compare
  const singular1 = normalized1.replace(/(es|s)$/, '')
  const singular2 = normalized2.replace(/(es|s)$/, '')
  
  if (singular1 === singular2 && singular1.length > 0) return true
  
  return false
}

/**
 * Extract individual keywords from text (split by comma, space, or common separators)
 */
function extractKeywords(text: string): string[] {
  if (!text) return []
  
  // Split by comma, semicolon, or newline
  return text
    .split(/[,\s;]+/)
    .map(k => k.trim())
    .filter(k => k.length > 0)
}

/**
 * Check for keyword repetitions in iOS fields
 */
export function checkIOSRepetitions(data: {
  ios_app_name?: string
  ios_subtitle?: string
  ios_keywords?: string
}): RepetitionCheckResult {
  const issues: KeywordRepetitionIssue[] = []
  
  // Extract keywords from each field
  const titleKeywords = extractKeywords(data.ios_app_name || "")
  const subtitleKeywords = extractKeywords(data.ios_subtitle || "")
  const keywordsField = extractKeywords(data.ios_keywords || "")
  
  // Check for repetitions between Title and Subtitle
  for (const titleKw of titleKeywords) {
    for (const subtitleKw of subtitleKeywords) {
      if (areKeywordsEquivalent(titleKw, subtitleKw)) {
        issues.push({
          keyword: titleKw,
          fields: ["Title", "Subtitle"],
          severity: "error",
          message: `"${titleKw}" is repeated between Title and Subtitle`,
          recommendation: "Use semantic variations or synonyms instead of repeating the same word"
        })
      }
    }
  }
  
  // Check for repetitions between Title and Keywords field
  for (const titleKw of titleKeywords) {
    for (const kwField of keywordsField) {
      if (areKeywordsEquivalent(titleKw, kwField)) {
        issues.push({
          keyword: titleKw,
          fields: ["Title", "Keywords field"],
          severity: "error",
          message: `"${titleKw}" is repeated between Title and Keywords field`,
          recommendation: "Remove this keyword from the Keywords field and use semantic variations"
        })
      }
    }
  }
  
  // Check for repetitions between Subtitle and Keywords field
  for (const subtitleKw of subtitleKeywords) {
    for (const kwField of keywordsField) {
      if (areKeywordsEquivalent(subtitleKw, kwField)) {
        issues.push({
          keyword: subtitleKw,
          fields: ["Subtitle", "Keywords field"],
          severity: "error",
          message: `"${subtitleKw}" is repeated between Subtitle and Keywords field`,
          recommendation: "Remove this keyword from the Keywords field and use semantic variations"
        })
      }
    }
  }
  
  // Calculate score (100 = no issues, decrease by 10 for each issue)
  const score = Math.max(0, 100 - (issues.length * 10))
  
  return {
    platform: "ios",
    hasIssues: issues.length > 0,
    issues,
    score
  }
}

/**
 * Check for keyword repetitions in Android fields
 * Android allows some repetition but penalizes over-optimization (>2-3 times)
 */
export function checkAndroidRepetitions(data: {
  android_app_name?: string
  android_short_description?: string
  android_full_description?: string
}): RepetitionCheckResult {
  const issues: KeywordRepetitionIssue[] = []
  
  // Extract keywords from each field
  const titleKeywords = extractKeywords(data.android_app_name || "")
  const shortDescKeywords = extractKeywords(data.android_short_description || "")
  const longDescKeywords = extractKeywords(data.android_full_description || "")
  
  // Count keyword occurrences across all fields
  const keywordCounts = new Map<string, { count: number; fields: string[] }>()
  
  const allFields = [
    { keywords: titleKeywords, fieldName: "Title" },
    { keywords: shortDescKeywords, fieldName: "Short Description" },
    { keywords: longDescKeywords, fieldName: "Long Description" }
  ]
  
  for (const { keywords, fieldName } of allFields) {
    for (const kw of keywords) {
      const normalized = normalizeKeyword(kw)
      const existing = keywordCounts.get(normalized)
      
      if (existing) {
        existing.count++
        if (!existing.fields.includes(fieldName)) {
          existing.fields.push(fieldName)
        }
      } else {
        keywordCounts.set(normalized, { count: 1, fields: [fieldName] })
      }
    }
  }
  
  // Check for keywords repeated more than 2-3 times (over-optimization)
  for (const [keyword, { count, fields }] of keywordCounts.entries()) {
    if (count > 3) {
      issues.push({
        keyword,
        fields,
        severity: "error",
        message: `"${keyword}" appears ${count} times across multiple fields`,
        recommendation: "Reduce repetitions. Google Play penalizes keyword stuffing (maximum 2-3 repetitions)"
      })
    } else if (count > 2 && fields.length > 2) {
      issues.push({
        keyword,
        fields,
        severity: "warning",
        message: `"${keyword}" appears ${count} times in ${fields.length} different fields`,
        recommendation: "Consider using semantic variations to avoid over-optimization"
      })
    } else if (count === 2 && fields.length === 2) {
      // Check if it's repeated between critical fields (Title + Short Desc)
      if (fields.includes("Title") && fields.includes("Short Description")) {
        issues.push({
          keyword,
          fields,
          severity: "warning",
          message: `"${keyword}" is repeated between Title and Short Description`,
          recommendation: "Use semantic variations to maximize semantic coverage"
        })
      }
    }
  }
  
  // Calculate score (100 = no issues, decrease by 5 for warnings, 15 for errors)
  const errorCount = issues.filter(i => i.severity === "error").length
  const warningCount = issues.filter(i => i.severity === "warning").length
  const score = Math.max(0, 100 - (errorCount * 15) - (warningCount * 5))
  
  return {
    platform: "android",
    hasIssues: issues.length > 0,
    issues,
    score
  }
}

/**
 * Get overall ASO score and recommendations
 */
export function getASOScoreSummary(
  iosResult: RepetitionCheckResult,
  androidResult: RepetitionCheckResult
): {
  overallScore: number
  hasIssues: boolean
  recommendations: string[]
} {
  const overallScore = Math.round((iosResult.score + androidResult.score) / 2)
  const hasIssues = iosResult.hasIssues || androidResult.hasIssues
  
  const recommendations: string[] = []
  
  if (iosResult.hasIssues) {
    recommendations.push(`iOS: ${iosResult.issues.length} repetition issue(s) detected`)
  }
  
  if (androidResult.hasIssues) {
    recommendations.push(`Android: ${androidResult.issues.length} repetition issue(s) detected`)
  }
  
  if (!hasIssues) {
    recommendations.push("✅ No repetitions detected. Your ASO strategy is optimized according to 2026 rules")
  }
  
  return {
    overallScore,
    hasIssues,
    recommendations
  }
}
