-- Script SQL para añadir la columna 'platform' a la tabla app_keywords
-- Ejecuta este script en Supabase SQL Editor si la columna no existe

-- Verificar y añadir la columna platform si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'app_keywords' 
    AND column_name = 'platform'
  ) THEN
    -- Añadir la columna platform con valor por defecto 'both'
    ALTER TABLE app_keywords 
    ADD COLUMN platform TEXT NOT NULL DEFAULT 'both';
    
    -- Añadir constraint para validar valores permitidos
    ALTER TABLE app_keywords 
    ADD CONSTRAINT app_keywords_platform_check 
    CHECK (platform IN ('ios', 'android', 'both'));
    
    -- Crear índice para mejorar el rendimiento
    CREATE INDEX IF NOT EXISTS idx_app_keywords_platform 
    ON app_keywords(platform);
    
    RAISE NOTICE 'Columna platform añadida correctamente';
  ELSE
    RAISE NOTICE 'La columna platform ya existe en la tabla';
  END IF;
END $$;

-- Asegurar que el constraint está correcto (actualizar si es necesario)
DO $$
BEGIN
  -- Eliminar constraint existente si existe
  ALTER TABLE app_keywords 
  DROP CONSTRAINT IF EXISTS app_keywords_platform_check;
  
  -- Añadir el constraint correcto
  ALTER TABLE app_keywords 
  ADD CONSTRAINT app_keywords_platform_check 
  CHECK (platform IN ('ios', 'android', 'both'));
END $$;

-- Asegurar que el índice existe
CREATE INDEX IF NOT EXISTS idx_app_keywords_platform ON app_keywords(platform);

-- Verificar que la columna fue creada correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'app_keywords' 
AND column_name = 'platform';
