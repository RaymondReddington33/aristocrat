# Configuración de Autenticación con Magic Link

## ✅ Implementación Completada

Se ha implementado autenticación con magic link usando Supabase Auth. Las siguientes funcionalidades están disponibles:

- ✅ Página de login (`/auth/login`)
- ✅ Callback para magic link (`/auth/callback`)
- ✅ Protección de rutas (`/admin` requiere autenticación)
- ✅ Middleware para verificar autenticación
- ✅ Navbar con estado de autenticación y logout
- ✅ Funciones de servidor para obtener usuario y logout

## 🔧 Configuración en Supabase

Para que la autenticación funcione correctamente, necesitas configurar las URLs de redirección en Supabase:

### 1. Ve al Dashboard de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **URL Configuration**

### 2. Configurar Site URL

- **Site URL**: Tu URL de producción
  - Producción: `https://aristocrat.oriolclaramunt.com`
  - Desarrollo local: `http://localhost:3000`

### 3. Configurar Redirect URLs

Añade las siguientes URLs en **Redirect URLs**:

**Producción:**
```
https://aristocrat.oriolclaramunt.com/auth/callback
```

**Desarrollo local:**
```
http://localhost:3000/auth/callback
```

**Para múltiples entornos:**
```
https://aristocrat.oriolclaramunt.com/auth/callback
http://localhost:3000/auth/callback
```

### 4. Configurar Email Templates (Opcional)

Puedes personalizar los emails de magic link en:
- **Authentication** → **Email Templates** → **Magic Link**

**Para personalizar el email con branding de Aristocrat:**
- Consulta el archivo `SUPABASE_EMAIL_TEMPLATE.md` para ver las plantillas HTML personalizadas
- Las plantillas están diseñadas para ser corporativas, sin menciones a Supabase
- Incluyen información sobre el acceso a la prueba técnica de Oriol Claramunt
- Todo el contenido está en inglés

## 🚀 Uso

### Para Usuarios

1. Visita `/auth/login`
2. Introduce tu email
3. Revisa tu correo y haz clic en el magic link
4. Serás redirigido automáticamente al admin panel (o la URL que intentabas acceder)

### Para Desarrolladores

#### Rutas Protegidas

La ruta `/admin` está protegida automáticamente. Si un usuario no autenticado intenta acceder, será redirigido a `/auth/login`.

#### Funciones Disponibles

```typescript
// En Server Components o Server Actions
import { getUser } from "@/app/actions"

const user = await getUser()
if (!user) {
  // Usuario no autenticado
}

// Para logout
import { signOut } from "@/app/actions"
await signOut()
```

#### En Client Components

```typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

// Para logout
await supabase.auth.signOut()
```

## 📝 Notas

- El middleware verifica la autenticación en cada request
- Las sesiones se mantienen mediante cookies
- Los magic links expiran después de 1 hora (configurable en Supabase)
- El email del usuario se muestra en el navbar cuando está autenticado

## 🔒 Seguridad

- Las rutas protegidas están verificadas tanto en el cliente como en el servidor
- El middleware previene acceso no autorizado a rutas protegidas
- Las sesiones se gestionan de forma segura mediante Supabase Auth
