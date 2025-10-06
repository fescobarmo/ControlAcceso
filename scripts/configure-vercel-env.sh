#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║      🔧 CONFIGURADOR DE VARIABLES DE ENTORNO - VERCEL        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Función para agregar variable
add_env_var() {
    local project=$1
    local key=$2
    local value=$3
    
    echo -e "${BLUE}Configurando $key...${NC}"
    echo "$value" | vercel env add "$key" production --cwd "$project" --yes 2>/dev/null || true
    echo "$value" | vercel env add "$key" preview --cwd "$project" --yes 2>/dev/null || true
    echo "$value" | vercel env add "$key" development --cwd "$project" --yes 2>/dev/null || true
}

# URLs de los deployments
FRONTEND_URL="https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app"
BACKEND_URL="https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 1: Recopilar Información${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Leer del .env local
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Encontrado archivo .env local"
    source backend/.env 2>/dev/null || true
fi

# Información de Supabase
echo -e "${BLUE}📊 Credenciales de Supabase:${NC}"
echo ""

read -p "Supabase Project URL (ej: https://xxx.supabase.co): " SUPABASE_URL
if [ -z "$SUPABASE_URL" ] && [ -n "$DB_HOST" ]; then
    SUPABASE_URL="https://${DB_HOST//db./}"
    SUPABASE_URL="${SUPABASE_URL//.supabase.co/.supabase.co}"
    echo -e "${GREEN}Usando de .env: $SUPABASE_URL${NC}"
fi

read -p "Supabase Anon/Public Key: " SUPABASE_ANON_KEY

read -p "Supabase Service Role Key (🔒 MUY SENSIBLE): " SUPABASE_SERVICE_KEY

# Base de datos
echo ""
echo -e "${BLUE}💾 Credenciales de Base de Datos:${NC}"
echo ""

read -p "DB Host [$DB_HOST]: " DB_HOST_INPUT
DB_HOST=${DB_HOST_INPUT:-$DB_HOST}

read -p "DB Password (🔒 SENSIBLE): " DB_PASSWORD

# JWT Secret
echo ""
echo -e "${BLUE}🔐 JWT Secret:${NC}"
echo ""
echo "Generando JWT Secret aleatorio..."
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
echo -e "${GREEN}✓ Generado${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 2: Configurar Variables del Backend${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd backend

# Variables del Backend
add_env_var "." "NODE_ENV" "production"
add_env_var "." "DB_HOST" "$DB_HOST"
add_env_var "." "DB_PORT" "5432"
add_env_var "." "DB_NAME" "postgres"
add_env_var "." "DB_USER" "postgres"
add_env_var "." "DB_PASSWORD" "$DB_PASSWORD"
add_env_var "." "DB_SSL" "true"
add_env_var "." "JWT_SECRET" "$JWT_SECRET"
add_env_var "." "JWT_EXPIRES_IN" "24h"
add_env_var "." "FRONTEND_URL" "$FRONTEND_URL"
add_env_var "." "CORS_ORIGIN" "$FRONTEND_URL"
add_env_var "." "SUPABASE_URL" "$SUPABASE_URL"
add_env_var "." "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_env_var "." "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY"

cd ..

echo ""
echo -e "${GREEN}✅ Variables del backend configuradas${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 3: Configurar Variables del Frontend${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd frontend

# Variables del Frontend
add_env_var "." "REACT_APP_API_URL" "$BACKEND_URL"
add_env_var "." "REACT_APP_BACKEND_URL" "$BACKEND_URL"
add_env_var "." "REACT_APP_SUPABASE_URL" "$SUPABASE_URL"
add_env_var "." "REACT_APP_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"

cd ..

echo ""
echo -e "${GREEN}✅ Variables del frontend configuradas${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}PASO 4: Re-desplegar Aplicaciones${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "¿Desplegar ahora? (s/n): " DEPLOY_NOW

if [ "$DEPLOY_NOW" = "s" ] || [ "$DEPLOY_NOW" = "S" ]; then
    echo ""
    echo -e "${BLUE}🚀 Desplegando backend...${NC}"
    cd backend
    vercel --prod --yes
    cd ..
    
    echo ""
    echo -e "${BLUE}🚀 Desplegando frontend...${NC}"
    cd frontend
    vercel --prod --yes
    cd ..
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ CONFIGURACIÓN COMPLETA                        ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🌐 URLs de Producción:${NC}"
    echo ""
    echo -e "   Frontend: ${BLUE}$FRONTEND_URL${NC}"
    echo -e "   Backend:  ${BLUE}$BACKEND_URL${NC}"
    echo ""
    echo -e "${GREEN}🧪 Verificar:${NC}"
    echo ""
    echo "   curl $BACKEND_URL/health"
    echo "   open $FRONTEND_URL"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Variables configuradas pero NO desplegadas${NC}"
    echo ""
    echo "Para desplegar manualmente:"
    echo ""
    echo "   cd backend && vercel --prod"
    echo "   cd frontend && vercel --prod"
    echo ""
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ ¡Proceso completado!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

