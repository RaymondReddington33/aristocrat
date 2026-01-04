-- Add AppTweak metrics fields to app_keywords table
-- This script adds all the real AppTweak metrics fields

-- Add brand field (boolean)
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS brand BOOLEAN DEFAULT FALSE;

-- Add chance field (percentage 0-100)
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS chance DECIMAL(5, 2) DEFAULT 0.0;

-- Add KEI field (Keyword Efficiency Index)
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS kei DECIMAL(10, 2) DEFAULT 0.0;

-- Add results field (number of search results)
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS results INTEGER DEFAULT 0;

-- Add growth_yesterday field (percentage growth)
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS growth_yesterday DECIMAL(10, 2) DEFAULT 0.0;

-- Add monthly_downloads field
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS monthly_downloads INTEGER DEFAULT 0;

-- Add maximum_reach field
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS maximum_reach INTEGER DEFAULT 0;

-- Add conversion_rate field (percentage 0-100)
ALTER TABLE app_keywords 
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5, 2) DEFAULT 0.0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_app_keywords_brand ON app_keywords(brand);
CREATE INDEX IF NOT EXISTS idx_app_keywords_kei ON app_keywords(kei);
CREATE INDEX IF NOT EXISTS idx_app_keywords_monthly_downloads ON app_keywords(monthly_downloads);

-- Add comments for documentation
COMMENT ON COLUMN app_keywords.brand IS 'Indicates if the keyword is a brand name';
COMMENT ON COLUMN app_keywords.chance IS 'Percentage chance of ranking for this keyword (0-100)';
COMMENT ON COLUMN app_keywords.kei IS 'Keyword Efficiency Index - ratio of search volume to difficulty';
COMMENT ON COLUMN app_keywords.results IS 'Number of search results for this keyword';
COMMENT ON COLUMN app_keywords.growth_yesterday IS 'Percentage growth in search volume from yesterday';
COMMENT ON COLUMN app_keywords.monthly_downloads IS 'Estimated monthly downloads for apps ranking for this keyword';
COMMENT ON COLUMN app_keywords.maximum_reach IS 'Maximum potential reach for this keyword';
COMMENT ON COLUMN app_keywords.conversion_rate IS 'Conversion rate percentage for this keyword (0-100)';
