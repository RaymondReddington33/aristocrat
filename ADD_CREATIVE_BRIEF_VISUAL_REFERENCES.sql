-- Add visual references field for Creative Brief
-- This stores JSON array of image URLs for visual reference gallery

ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_visual_references JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance (optional, but useful if querying by visual references)
CREATE INDEX IF NOT EXISTS idx_app_data_visual_references ON app_data USING GIN (creative_brief_visual_references);
