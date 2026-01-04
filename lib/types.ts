export interface AppData {
  id: string
  created_at: string
  updated_at: string
  app_name: string
  app_subtitle?: string
  app_icon_url?: string

  // iOS Specific
  ios_app_name?: string
  ios_subtitle?: string
  ios_promotional_text?: string
  ios_description?: string
  ios_keywords?: string
  ios_whats_new?: string
  ios_support_url?: string
  ios_marketing_url?: string
  ios_privacy_url?: string

  // Android Specific
  android_app_name?: string
  android_short_description?: string
  android_full_description?: string
  android_promo_text?: string
  android_recent_changes?: string

  // Creative Brief - Task 2 Structure
  creative_brief_store_page_type?: "cpp" | "csl" | "default"
  creative_brief_target_market?: string
  creative_brief_primary_platform?: "ios" | "android" | "both"
  creative_brief_objective?: string
  creative_brief_creative_concept?: string
  creative_brief_target_audience?: string
  creative_brief_key_message?: string
  creative_brief_visual_style?: string
  creative_brief_brand_guidelines?: string
  creative_brief_visual_references?: string[] // Array of image URLs for visual reference gallery
  creative_brief_color_palette?: Array<{ name: string; hex: string; usage: string }> // Color palette with hex codes
  creative_brief_typography?: Array<{ name: string; font: string; size: string; weight: string; example: string }> // Typography styles
  creative_brief_competitor_analysis?: string
  creative_brief_screenshot_1_message?: string
  creative_brief_screenshot_2_message?: string
  creative_brief_screenshot_3_message?: string
  creative_brief_screenshot_4_message?: string
  creative_brief_screenshot_5_message?: string
  creative_brief_platform_considerations?: string
  creative_brief_asa_strategy?: string
  creative_brief_asa_keyword_groups?: Array<{
    id: string
    name: string
    keywords: string[]
    matchType: "exact" | "broad"
    cppEnabled: boolean
    cppId?: string
    dailyBudget?: number
    targetCPA?: number
  }>

  // Metadata
  category?: string
  price?: string
  rating?: number
  review_count?: number
  download_count?: string
  age_rating?: string

  // In-App Purchases
  has_in_app_purchases?: boolean
  in_app_purchases_description?: string
  ios_in_app_purchases?: string
  android_in_app_products?: string

  is_published: boolean
}

export interface AppScreenshot {
  id: string
  app_data_id: string
  platform: "ios" | "android"
  device_type: "iphone" | "ipad" | "android_phone" | "android_tablet"
  image_url: string
  title?: string
  description?: string
  sort_order: number
  created_at: string
}

export interface AppPreviewVideo {
  id: string
  app_data_id: string
  platform: "ios" | "android"
  video_url: string
  thumbnail_url?: string
  sort_order: number
  created_at: string
}

export interface AppKeyword {
  id: string
  app_data_id: string
  keyword: string
  search_volume: number // Volume - Estimated monthly search volume
  difficulty: number // 0.0 to 100.0 - Ranking difficulty score
  relevance_score: number // 0.0 to 100.0 - Relevancy Score
  category: "branded" | "generic" | "competitor"
  priority: "high" | "medium" | "low"
  platform: "ios" | "android" | "both"
  recommended_field?: "title" | "subtitle" | "keywords" | "description"
  // AppTweak Metrics
  brand?: boolean // Brand - Indicates if the keyword is a brand name
  chance?: number // Chance - Percentage chance of ranking for this keyword (0-100)
  kei?: number // KEI - Keyword Efficiency Index (ratio of search volume to difficulty)
  results?: number // Results - Number of search results for this keyword
  growth_yesterday?: number // Growth (Yesterday) - Percentage growth in search volume from yesterday
  monthly_downloads?: number // Monthly Downloads - Estimated monthly downloads for apps ranking for this keyword
  maximum_reach?: number // Maximum Reach - Maximum potential reach for this keyword
  conversion_rate?: number // Conversion Rate - Conversion rate percentage for this keyword (0-100)
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ScreenshotMessaging {
  id: string
  screenshot_id: string
  tagline?: string
  value_proposition?: string
  cta_text?: string
  ab_test_variant: "A" | "B"
  created_at: string
  updated_at: string
}
