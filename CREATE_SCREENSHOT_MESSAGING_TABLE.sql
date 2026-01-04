-- Script SQL para crear la tabla app_screenshot_messaging
-- Ejecuta este script en Supabase SQL Editor

-- Crear tabla app_screenshot_messaging si no existe
CREATE TABLE IF NOT EXISTS app_screenshot_messaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screenshot_id UUID REFERENCES app_screenshots(id) ON DELETE CASCADE,
  tagline TEXT,
  value_proposition TEXT,
  cta_text TEXT,
  ab_test_variant TEXT DEFAULT 'A' CHECK (ab_test_variant IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_app_screenshot_messaging_screenshot_id 
ON app_screenshot_messaging(screenshot_id);

-- Habilitar Row Level Security
ALTER TABLE app_screenshot_messaging ENABLE ROW LEVEL SECURITY;

-- Crear políticas para acceso público (ya que es una herramienta de presentación)
CREATE POLICY "Allow public read access to app_screenshot_messaging" 
ON app_screenshot_messaging FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to app_screenshot_messaging" 
ON app_screenshot_messaging FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to app_screenshot_messaging" 
ON app_screenshot_messaging FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to app_screenshot_messaging" 
ON app_screenshot_messaging FOR DELETE USING (true);

-- Crear función para actualizar updated_at (si no existe ya)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_app_screenshot_messaging_updated_at ON app_screenshot_messaging;

CREATE TRIGGER update_app_screenshot_messaging_updated_at 
BEFORE UPDATE ON app_screenshot_messaging
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la tabla fue creada correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'app_screenshot_messaging'
ORDER BY ordinal_position;
