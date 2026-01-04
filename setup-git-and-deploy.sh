#!/bin/bash

# Script para configurar Git y preparar para Vercel
# Ejecutar: bash setup-git-and-deploy.sh

set -e

echo "🚀 Configurando repositorio Git..."

# Inicializar Git (si no está inicializado)
if [ ! -d .git ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
fi

# Configurar remote
echo "🔗 Configurando remote..."
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:RaymondReddington33/aristocrat.git

# Verificar estado
echo "📊 Estado del repositorio:"
git status

# Añadir todos los archivos
echo "➕ Añadiendo archivos..."
git add .

# Hacer commit
echo "💾 Haciendo commit..."
git commit -m "Initial commit: App Store Preview with Creative Brief, Keyword Research, and ASA Strategy" || echo "⚠️  No hay cambios para commitear"

# Configurar rama main
echo "🌿 Configurando rama main..."
git branch -M main

# Mostrar remote configurado
echo "✅ Remote configurado:"
git remote -v

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📤 Para subir a GitHub, ejecuta:"
echo "   git push -u origin main"
echo ""
echo "🚀 Para desplegar en Vercel:"
echo "   vercel"
echo "   o ve a https://vercel.com y conecta el repositorio"
