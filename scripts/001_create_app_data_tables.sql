-- Create app_data table to store all ASO/ASA information
CREATE TABLE IF NOT EXISTS app_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic App Info
  app_name TEXT NOT NULL,
  app_subtitle TEXT,
  app_icon_url TEXT,
  
  -- iOS Specific
  ios_app_name TEXT,
  ios_subtitle TEXT,
  ios_promotional_text TEXT,
  ios_description TEXT,
  ios_keywords TEXT,
  ios_whats_new TEXT,
  ios_support_url TEXT,
  ios_marketing_url TEXT,
  ios_privacy_url TEXT,
  
  -- Android Specific
  android_app_name TEXT,
  android_short_description TEXT,
  android_full_description TEXT,
  android_promo_text TEXT,
  android_recent_changes TEXT,
  
  -- Creative Brief
  creative_brief_target_audience TEXT,
  creative_brief_key_message TEXT,
  creative_brief_visual_style TEXT,
  creative_brief_brand_guidelines TEXT,
  creative_brief_competitor_analysis TEXT,
  
  -- Metadata
  category TEXT,
  price TEXT,
  rating DECIMAL(2, 1),
  review_count INTEGER,
  download_count TEXT,
  age_rating TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE
);

-- Create screenshots table
CREATE TABLE IF NOT EXISTS app_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_data_id UUID REFERENCES app_data(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'ios' or 'android'
  device_type TEXT NOT NULL, -- 'iphone', 'ipad', 'android_phone', 'android_tablet'
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preview_videos table
CREATE TABLE IF NOT EXISTS app_preview_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_data_id UUID REFERENCES app_data(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_screenshots_app_data_id ON app_screenshots(app_data_id);
CREATE INDEX IF NOT EXISTS idx_app_screenshots_platform ON app_screenshots(platform);
CREATE INDEX IF NOT EXISTS idx_app_preview_videos_app_data_id ON app_preview_videos(app_data_id);

-- Enable Row Level Security
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_preview_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a presentation tool)
CREATE POLICY "Allow public read access to app_data" ON app_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to app_data" ON app_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to app_data" ON app_data FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to app_data" ON app_data FOR DELETE USING (true);

CREATE POLICY "Allow public read access to app_screenshots" ON app_screenshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to app_screenshots" ON app_screenshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to app_screenshots" ON app_screenshots FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to app_screenshots" ON app_screenshots FOR DELETE USING (true);

CREATE POLICY "Allow public read access to app_preview_videos" ON app_preview_videos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to app_preview_videos" ON app_preview_videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to app_preview_videos" ON app_preview_videos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to app_preview_videos" ON app_preview_videos FOR DELETE USING (true);
