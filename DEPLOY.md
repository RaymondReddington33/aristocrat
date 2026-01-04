# Guía de Despliegue en Vercel

## Pasos para desplegar en Vercel

### 1. Preparar el repositorio Git (si no está inicializado)

```bash
# Inicializar Git
git init

# Añadir todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: App Store Preview app"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 2. Variables de Entorno Requeridas

Necesitarás configurar estas variables en Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` - URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase

### 3. Desplegar en Vercel

#### Opción A: Desde el Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Añade las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Haz clic en "Deploy"

#### Opción B: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Hacer login
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

### 4. Configuración de Build

Vercel detectará automáticamente que es un proyecto Next.js y usará:
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (se detecta automáticamente por `pnpm-lock.yaml`)

### 5. Verificar el Despliegue

Después del despliegue:
1. Verifica que la aplicación cargue correctamente
2. Asegúrate de que las variables de entorno estén configuradas
3. Prueba la conexión con Supabase desde la app desplegada

### 6. Configuración Adicional (Opcional)

Si necesitas configuraciones adicionales, puedes crear un `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

## Notas Importantes

- ✅ El proyecto ya está configurado para Vercel (Next.js)
- ✅ Las imágenes están configuradas como `unoptimized: true` en `next.config.mjs`
- ✅ El tamaño máximo de Server Actions está configurado a 10mb
- ⚠️ Asegúrate de que las tablas de Supabase estén creadas antes del despliegue
- ⚠️ Revisa los scripts SQL en la carpeta `scripts/` y `*.sql` en la raíz

## Migraciones de Base de Datos

Antes de usar la aplicación en producción, ejecuta estos scripts SQL en Supabase:

1. `scripts/001_create_app_data_tables.sql`
2. `scripts/002_add_platform_column.sql`
3. `scripts/002_create_keywords_table.sql`
4. `scripts/003_create_screenshot_messaging.sql`
5. `ADD_CREATIVE_BRIEF_FIELDS.sql`
6. `ADD_CREATIVE_BRIEF_VISUAL_REFERENCES.sql`
7. `ADD_CREATIVE_BRIEF_COLORS_TYPOGRAPHY.sql`
8. `ADD_CREATIVE_BRIEF_ASA_KEYWORD_GROUPS.sql`
9. `UPDATE_CREATIVE_BRIEF_COMPETITOR_ANALYSIS.sql`
