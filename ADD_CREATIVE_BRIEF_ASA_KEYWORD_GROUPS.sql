-- Add ASA keyword groups field for Creative Brief
-- This stores structured campaign data as JSONB array

ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_asa_keyword_groups JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_app_data_asa_keyword_groups ON app_data USING GIN (creative_brief_asa_keyword_groups);
