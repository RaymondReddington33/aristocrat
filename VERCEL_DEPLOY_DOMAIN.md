# Configuración para Despliegue en Vercel con Dominio Personalizado

## Dominio: aristocrat.oriolclaramunt.com

## 🚀 Pasos para Desplegar

### 1. Push a GitHub

```bash
git push origin main
```

### 2. Configurar Proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Si el proyecto ya existe, ve a **Settings** → **Git**
3. Si es nuevo, importa el repositorio desde GitHub
4. El proyecto debería auto-detectar Next.js

### 3. Configurar Variables de Entorno en Vercel

Ve a **Settings** → **Environment Variables** y añade:

#### Production, Preview, y Development:
- `NEXT_PUBLIC_SUPABASE_URL` - Tu URL de Supabase (ej: `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Tu anon key de Supabase

### 4. Configurar Dominio Personalizado en Vercel

1. Ve a **Settings** → **Domains**
2. Añade el dominio: `aristocrat.oriolclaramunt.com`
3. Sigue las instrucciones de Vercel para configurar los DNS:
   - Si es un subdominio, necesitarás añadir un registro CNAME apuntando a Vercel
   - Vercel te proporcionará los valores exactos

### 5. ⚠️ IMPORTANTE: Configurar Supabase para el Nuevo Dominio

#### En Supabase Dashboard:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **URL Configuration**

#### Configurar Site URL:
```
https://aristocrat.oriolclaramunt.com
```

#### Configurar Redirect URLs:

Añade las siguientes URLs en **Redirect URLs** (puedes tener múltiples):

**Producción:**
```
https://aristocrat.oriolclaramunt.com/auth/callback
```

**Desarrollo local (opcional, para mantener):**
```
http://localhost:3000/auth/callback
```

**Para Vercel Preview (opcional, si quieres testear):**
```
https://tu-proyecto-vercel.vercel.app/auth/callback
```

#### Ejemplo completo de Redirect URLs:
```
https://aristocrat.oriolclaramunt.com/auth/callback
http://localhost:3000/auth/callback
```

### 6. Desplegar

1. Vercel desplegará automáticamente cuando hagas push a `main`
2. O puedes hacer un deploy manual desde el dashboard
3. Verifica que el dominio personalizado esté activo

### 7. Verificar que Todo Funciona

1. Visita `https://aristocrat.oriolclaramunt.com`
2. Deberías ser redirigido a `/auth/login`
3. Prueba el login con magic link
4. Verifica que el callback funcione correctamente

## ✅ Checklist Pre-Deployment

- [ ] Código commitado y pusheado a GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] Dominio personalizado configurado en Vercel
- [ ] DNS configurado correctamente
- [ ] Site URL actualizado en Supabase: `https://aristocrat.oriolclaramunt.com`
- [ ] Redirect URLs actualizadas en Supabase: `https://aristocrat.oriolclaramunt.com/auth/callback`
- [ ] Deploy realizado en Vercel
- [ ] Login con magic link probado y funcionando

## 📝 Notas

- El código usa `window.location.origin` para construir las URLs de redirección, por lo que funcionará automáticamente con cualquier dominio
- No es necesario cambiar código para el nuevo dominio
- Asegúrate de que el SSL/HTTPS esté habilitado en Vercel (debería ser automático)
- El dominio personalizado puede tardar unos minutos en propagarse
