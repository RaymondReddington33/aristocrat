-- Migration: Add keyword_research_data column to app_data table
-- This column stores the full keyword research CSV data for reference
-- The data is stored as JSONB for efficient querying and display

ALTER TABLE app_data
ADD COLUMN IF NOT EXISTS keyword_research_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN app_data.keyword_research_data IS 'Full keyword research data from CSV import. Contains all researched keywords with metrics for reviewer reference.';
