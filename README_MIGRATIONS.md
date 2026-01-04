# Database Migrations

Este proyecto requiere ejecutar scripts SQL en Supabase para crear las tablas necesarias.

## Pasos para crear las tablas

1. Ve a tu proyecto en Supabase Dashboard: https://supabase.com/dashboard
2. Navega a **SQL Editor**
3. Ejecuta los scripts en el siguiente orden:

### 1. Crear tablas principales (si aún no están creadas)
Ejecuta el contenido de `scripts/001_create_app_data_tables.sql`

### 2. Crear tabla de keywords
Ejecuta el contenido de `scripts/002_create_keywords_table.sql`

### 3. Crear tabla de screenshot messaging (opcional)
Ejecuta el contenido de `scripts/003_create_screenshot_messaging.sql`

## Script completo para Keywords

```sql
-- Create app_keywords table to store keyword research data
CREATE TABLE IF NOT EXISTS app_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_data_id UUID REFERENCES app_data(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  difficulty DECIMAL(3, 1) DEFAULT 0.0, -- 0.0 to 100.0
  relevance_score DECIMAL(3, 1) DEFAULT 0.0, -- 0.0 to 100.0
  category TEXT NOT NULL CHECK (category IN ('branded', 'generic', 'competitor')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'both')),
  recommended_field TEXT CHECK (recommended_field IN ('title', 'subtitle', 'keywords', 'description')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_keywords_app_data_id ON app_keywords(app_data_id);
CREATE INDEX IF NOT EXISTS idx_app_keywords_platform ON app_keywords(platform);
CREATE INDEX IF NOT EXISTS idx_app_keywords_category ON app_keywords(category);
CREATE INDEX IF NOT EXISTS idx_app_keywords_priority ON app_keywords(priority);

-- Enable Row Level Security
ALTER TABLE app_keywords ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a presentation tool)
CREATE POLICY "Allow public read access to app_keywords" ON app_keywords FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to app_keywords" ON app_keywords FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to app_keywords" ON app_keywords FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to app_keywords" ON app_keywords FOR DELETE USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_keywords_updated_at BEFORE UPDATE ON app_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Verificar que la tabla existe

Después de ejecutar el script, puedes verificar que la tabla fue creada correctamente ejecutando:

```sql
SELECT * FROM app_keywords LIMIT 1;
```

Si la consulta no da error, la tabla está creada correctamente.
