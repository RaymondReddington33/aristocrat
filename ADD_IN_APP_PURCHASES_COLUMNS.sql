-- Add in-app purchases columns to app_data table

ALTER TABLE app_data 
ADD COLUMN IF NOT EXISTS has_in_app_purchases BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS in_app_purchases_description TEXT,
ADD COLUMN IF NOT EXISTS ios_in_app_purchases TEXT,
ADD COLUMN IF NOT EXISTS android_in_app_products TEXT;

-- Add comments for documentation
COMMENT ON COLUMN app_data.has_in_app_purchases IS 'Whether the app offers in-app purchases';
COMMENT ON COLUMN app_data.in_app_purchases_description IS 'General description of in-app purchases';
COMMENT ON COLUMN app_data.ios_in_app_purchases IS 'List of iOS in-app purchases/products';
COMMENT ON COLUMN app_data.android_in_app_products IS 'List of Android in-app products';
