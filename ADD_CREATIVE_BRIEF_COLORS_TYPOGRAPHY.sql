-- Add color palette and typography fields for Creative Brief
-- These store structured data as JSONB for better querying and flexibility

ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_color_palette JSONB DEFAULT '[]'::jsonb;

ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_typography JSONB DEFAULT '[]'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_data_color_palette ON app_data USING GIN (creative_brief_color_palette);
CREATE INDEX IF NOT EXISTS idx_app_data_typography ON app_data USING GIN (creative_brief_typography);
