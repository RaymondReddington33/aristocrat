-- Update creative_brief_competitor_analysis from text to JSONB array
-- This allows storing structured competitor data with icons, URLs, keywords, etc.

-- First, alter the column type
ALTER TABLE app_data 
ALTER COLUMN creative_brief_competitor_analysis TYPE JSONB USING 
  CASE 
    WHEN creative_brief_competitor_analysis IS NULL THEN NULL
    WHEN creative_brief_competitor_analysis = '' THEN '[]'::JSONB
    ELSE jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'name', 'Legacy Competitor',
        'notes', creative_brief_competitor_analysis
      )
    )
  END;

-- Add a comment to document the structure
COMMENT ON COLUMN app_data.creative_brief_competitor_analysis IS 
'JSONB array of competitor objects. Each object should have: id (string), name (string), appStoreUrl (string, optional), playStoreUrl (string, optional), iconUrl (string, optional), strengths (string array, optional), weaknesses (string array, optional), ourAdvantage (string, optional), keywords (string array, optional), notes (string, optional)';
