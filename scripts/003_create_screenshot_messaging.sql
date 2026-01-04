-- Create app_screenshot_messaging table to store messaging strategy for screenshots
CREATE TABLE IF NOT EXISTS app_screenshot_messaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screenshot_id UUID REFERENCES app_screenshots(id) ON DELETE CASCADE,
  tagline TEXT,
  value_proposition TEXT,
  cta_text TEXT,
  ab_test_variant TEXT DEFAULT 'A', -- 'A' or 'B'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_screenshot_messaging_screenshot_id ON app_screenshot_messaging(screenshot_id);

-- Enable Row Level Security
ALTER TABLE app_screenshot_messaging ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a presentation tool)
CREATE POLICY "Allow public read access to app_screenshot_messaging" ON app_screenshot_messaging FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to app_screenshot_messaging" ON app_screenshot_messaging FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to app_screenshot_messaging" ON app_screenshot_messaging FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to app_screenshot_messaging" ON app_screenshot_messaging FOR DELETE USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_app_screenshot_messaging_updated_at BEFORE UPDATE ON app_screenshot_messaging
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
