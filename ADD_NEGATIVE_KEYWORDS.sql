-- Add negative_keywords column to app_data table
-- This column stores an array of negative keywords as JSONB

ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS negative_keywords JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN app_data.negative_keywords IS 'Array of negative keywords to exclude from targeting (stored as JSONB array of strings)';
