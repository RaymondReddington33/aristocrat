-- Add new Creative Brief fields for Task 2 structure
-- This script adds fields for: Store Page Type, Objective, Creative Concept, Screenshot Messages, ASA Considerations

-- Store Page Type (CPP, CSL, or Default)
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_store_page_type TEXT CHECK (creative_brief_store_page_type IN ('cpp', 'csl', 'default'));

-- Objective
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_objective TEXT;

-- Creative Concept (Core Message)
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_creative_concept TEXT;

-- Screenshot Messages (for up to 5 screenshots)
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_screenshot_1_message TEXT;
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_screenshot_2_message TEXT;
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_screenshot_3_message TEXT;
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_screenshot_4_message TEXT;
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_screenshot_5_message TEXT;

-- Platform-Specific Considerations
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_platform_considerations TEXT;

-- Apple Search Ads (ASA) Strategy
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_asa_strategy TEXT;

-- Target Market
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_target_market TEXT;

-- Primary Platform
ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_primary_platform TEXT CHECK (creative_brief_primary_platform IN ('ios', 'android', 'both'));
