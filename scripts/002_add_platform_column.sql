-- Add platform column to app_keywords table if it doesn't exist
-- This script is safe to run multiple times

-- First, check if column exists and add it if it doesn't
DO $$
BEGIN
  -- Check if the platform column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'app_keywords' 
    AND column_name = 'platform'
  ) THEN
    -- Add the platform column with default value 'both'
    ALTER TABLE app_keywords 
    ADD COLUMN platform TEXT NOT NULL DEFAULT 'both';
    
    -- Add check constraint
    ALTER TABLE app_keywords 
    ADD CONSTRAINT app_keywords_platform_check 
    CHECK (platform IN ('ios', 'android', 'both'));
    
    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_app_keywords_platform 
    ON app_keywords(platform);
    
    RAISE NOTICE 'Column platform added successfully';
  ELSE
    RAISE NOTICE 'Column platform already exists';
  END IF;
END $$;

-- If column already exists, ensure the constraint is correct
DO $$
BEGIN
  -- Drop existing constraint if it exists (to update it)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'app_keywords_platform_check'
  ) THEN
    ALTER TABLE app_keywords 
    DROP CONSTRAINT IF EXISTS app_keywords_platform_check;
  END IF;
  
  -- Add/update the constraint
  ALTER TABLE app_keywords 
  ADD CONSTRAINT app_keywords_platform_check 
  CHECK (platform IN ('ios', 'android', 'both'));
  
  RAISE NOTICE 'Platform constraint updated';
END $$;

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_app_keywords_platform ON app_keywords(platform);
