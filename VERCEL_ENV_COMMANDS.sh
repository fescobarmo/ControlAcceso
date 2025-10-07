#!/bin/bash

# Script para agregar variables de entorno a Vercel Backend usando CLI
# Ejecutar desde la carpeta backend: cd backend && bash ../VERCEL_ENV_COMMANDS.sh

echo "🔧 Configurando variables de entorno en Vercel Backend..."
echo ""

# Variables de Base de Datos
echo "📊 Configurando variables de base de datos..."
echo "db.nwjyxllifotjqzvqhyyc.supabase.co" | vercel env add DB_HOST production
echo "5432" | vercel env add DB_PORT production
echo "postgres" | vercel env add DB_NAME production
echo "postgres" | vercel env add DB_USER production
echo "true" | vercel env add DB_SSL production

# JWT
echo ""
echo "🔐 Configurando JWT..."
echo "xD0HFzPITgKHcB6LCLLmV73HlllvnHWU8kZ0h0oLJFxSdL1x2e+XkICjY0D5Wd7piCmQ6vtGdKcA324q5EgyTQ==" | vercel env add JWT_SECRET production
echo "24h" | vercel env add JWT_EXPIRES_IN production

# CORS
echo ""
echo "🌐 Configurando CORS..."
echo "https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app" | vercel env add FRONTEND_URL production
echo "https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app" | vercel env add CORS_ORIGIN production

# Supabase URLs
echo ""
echo "🗄️ Configurando Supabase URLs..."
echo "https://nwjyxllifotjqzvqhyyc.supabase.co" | vercel env add SUPABASE_URL production

# Node Environment
echo ""
echo "⚙️ Configurando Node..."
echo "production" | vercel env add NODE_ENV production

echo ""
echo "✅ Variables básicas configuradas!"
echo ""
echo "⚠️  FALTAN 3 VARIABLES QUE DEBES AGREGAR MANUALMENTE:"
echo ""
echo "1. DB_PASSWORD"
echo "   vercel env add DB_PASSWORD production"
echo "   Valor: [tu password de Supabase]"
echo ""
echo "2. SUPABASE_ANON_KEY"
echo "   vercel env add SUPABASE_ANON_KEY production"
echo "   Valor: [de Supabase Settings → API → anon public]"
echo ""
echo "3. SUPABASE_SERVICE_KEY"
echo "   vercel env add SUPABASE_SERVICE_KEY production"
echo "   Valor: [de Supabase Settings → API → service_role]"
echo ""
echo "💡 Después de agregar estas 3 variables, ejecuta:"
echo "   vercel --prod"
echo ""
