-- Add Cross-Locations Strategy field for Creative Brief
-- This stores the strategy for multi-market/cross-location campaigns

ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS creative_brief_cross_locations_strategy TEXT;

-- Add comment for documentation
COMMENT ON COLUMN app_data.creative_brief_cross_locations_strategy IS 'Cross-locations/multi-market strategy for international campaigns';
