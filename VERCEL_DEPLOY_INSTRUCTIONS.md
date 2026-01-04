# Instrucciones para Desplegar en Vercel

## ✅ Preparación Completada

El proyecto está listo para desplegar. Se han creado:
- ✅ README.md con documentación
- ✅ DEPLOY.md con guía detallada
- ✅ .gitignore configurado correctamente
- ✅ next.config.mjs optimizado para Vercel

## 🚀 Opción 1: Desplegar desde Dashboard de Vercel (Recomendado)

### Paso 1: Subir código a GitHub (si no está ya)

```bash
# Verificar estado
git status

# Si hay cambios sin commitear
git add .
git commit -m "Prepare for Vercel deployment"

# Si no tienes remote configurado
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"** o **"New Project"**
3. Conecta tu cuenta de GitHub (si no está conectada)
4. Selecciona el repositorio `app-store-preview`
5. Vercel detectará automáticamente la configuración de Next.js

### Paso 3: Configurar Variables de Entorno

En la pantalla de configuración del proyecto, añade:

- **NEXT_PUBLIC_SUPABASE_URL**: Tu URL de Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Tu clave anónima de Supabase

Puedes encontrarlas en:
- Supabase Dashboard → Settings → API

### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (2-3 minutos)
3. ¡Listo! Tu app estará en `tu-proyecto.vercel.app`

---

## 🚀 Opción 2: Desplegar con Vercel CLI

```bash
# 1. Asegúrate de estar en el directorio del proyecto
cd /Users/oriolclaramuntpascual/Desktop/Programacion2025/app-store-preview

# 2. Inicia sesión en Vercel (si no estás logueado)
vercel login

# 3. Despliega (primera vez pedirá configuración)
vercel

# 4. Para producción
vercel --prod
```

Durante el despliegue, Vercel preguntará:
- **Set up and deploy?** → Y
- **Which scope?** → Tu usuario/organización
- **Link to existing project?** → N (primera vez)
- **Project name?** → app-store-preview (o el que quieras)
- **Directory?** → ./
- **Override settings?** → N

### Configurar Variables de Entorno con CLI

```bash
# Añadir variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Para producción
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

---

## ⚙️ Configuración Actual del Proyecto

### Build Settings (automáticos)
- **Framework**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (detectado automáticamente)

### Configuración en next.config.mjs
- ✅ Imágenes sin optimización (para Vercel)
- ✅ Server Actions con límite de 10mb
- ✅ TypeScript con ignoreBuildErrors (solo para desarrollo)

---

## 📋 Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas en Vercel
- [ ] Código subido a GitHub (si usas Opción 1)
- [ ] Base de datos Supabase configurada
- [ ] Scripts SQL ejecutados en Supabase (ver README_MIGRATIONS.md)

---

## 🔍 Verificar el Despliegue

Después del despliegue:

1. Visita la URL proporcionada por Vercel
2. Verifica que la página principal carga
3. Prueba acceder al panel de admin (`/admin`)
4. Verifica la conexión con Supabase

---

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Supabase + Vercel](https://supabase.com/docs/guides/hosting/vercel)

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
→ Asegúrate de haber configurado las variables de entorno en Vercel

### Error: "Build failed"
→ Revisa los logs de build en Vercel para más detalles

### Error: "Database connection failed"
→ Verifica que las credenciales de Supabase sean correctas y que RLS esté configurado
