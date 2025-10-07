#!/bin/bash

# Script para configurar variables de entorno en Vercel (Backend)
# Ejecutar desde el directorio raíz del proyecto

echo "🚀 Configurando variables de entorno para el backend en Vercel..."

# Cambiar al directorio del backend
cd backend

echo "📝 Configurando variables de base de datos..."
echo "db.nwjyxllifotjqzvqhyyc.supabase.co" | vercel env add DB_HOST production
echo "5432" | vercel env add DB_PORT production
echo "postgres" | vercel env add DB_NAME production
echo "postgres" | vercel env add DB_USER production
echo "true" | vercel env add DB_SSL production

echo "🔐 Configurando JWT..."
echo "0+YHnyygCxOg/8J7kKx0OKC+r9sZIlYd0qZpqXxMI8M=" | vercel env add JWT_SECRET production
echo "24h" | vercel env add JWT_EXPIRES_IN production

echo "🌐 Configurando CORS..."
echo "https://controlacceso-frontend.vercel.app" | vercel env add FRONTEND_URL production
echo "https://controlacceso-frontend.vercel.app" | vercel env add CORS_ORIGIN production

echo "⚙️ Configurando Node.js..."
echo "production" | vercel env add NODE_ENV production

echo "✅ Variables de entorno configuradas!"
echo "🚀 Ahora ejecuta: vercel --prod para hacer deployment"

# Regresar al directorio raíz
cd ..

echo "📋 Resumen de variables configuradas:"
echo "- DB_HOST: db.nwjyxllifotjqzvqhyyc.supabase.co"
echo "- DB_PORT: 5432"
echo "- DB_NAME: postgres"
echo "- DB_USER: postgres"
echo "- DB_SSL: true"
echo "- JWT_SECRET: [CONFIGURADO]"
echo "- JWT_EXPIRES_IN: 24h"
echo "- FRONTEND_URL: https://controlacceso-frontend.vercel.app"
echo "- CORS_ORIGIN: https://controlacceso-frontend.vercel.app"
echo "- NODE_ENV: production"

echo ""
echo "⚠️  IMPORTANTE: Necesitas configurar manualmente DB_PASSWORD con tu contraseña de Supabase"
echo "Ejecuta: cd backend && vercel env add DB_PASSWORD production"
