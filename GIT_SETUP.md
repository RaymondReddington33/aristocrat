# Configuración de Git y Despliegue

## Repositorio GitHub
**Remote URL**: `git@github.com:RaymondReddington33/aristocrat.git`

## Pasos para configurar Git y desplegar

### 1. Configurar Git y conectar con GitHub

Ejecuta este script desde tu terminal:

```bash
cd /Users/oriolclaramuntpascual/Desktop/Programacion2025/app-store-preview
bash setup-git-and-deploy.sh
```

O manualmente:

```bash
# Inicializar Git (si no está inicializado)
git init

# Añadir remote
git remote add origin git@github.com:RaymondReddington33/aristocrat.git

# Añadir todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: App Store Preview with Creative Brief, Keyword Research, and ASA Strategy"

# Configurar rama main
git branch -M main

# Subir a GitHub
git push -u origin main
```

### 2. Desplegar en Vercel

#### Opción A: Desde Dashboard (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Add New Project"**
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `aristocrat`
5. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Haz clic en **"Deploy"**

#### Opción B: Desde CLI

```bash
# Iniciar sesión (si no estás logueado)
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

### 3. Variables de Entorno en Vercel

Asegúrate de configurar estas variables en Vercel:

- **NEXT_PUBLIC_SUPABASE_URL**: Tu URL de Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Tu clave anónima de Supabase

Puedes encontrarlas en: **Supabase Dashboard → Settings → API**

---

## Comandos Rápidos

```bash
# Ver estado
git status

# Ver remote configurado
git remote -v

# Subir cambios
git add .
git commit -m "Descripción del cambio"
git push

# Desplegar en Vercel
vercel --prod
```
