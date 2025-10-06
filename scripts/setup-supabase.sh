#!/bin/bash

# =======================================================
# Script de Configuración para Supabase
# =======================================================
# Este script te ayuda a configurar las variables de
# entorno para conectarte a Supabase
# =======================================================

set -e

echo "🚀 Configuración de Supabase para ControlAcceso"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para solicitar input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$(echo -e ${YELLOW}$prompt ${NC}[${default_value}]: )" value
        value=${value:-$default_value}
    else
        read -p "$(echo -e ${YELLOW}$prompt: ${NC})" value
    fi
    
    echo "$value"
}

# Función para solicitar input seguro (password)
prompt_password() {
    local prompt="$1"
    read -sp "$(echo -e ${YELLOW}$prompt: ${NC})" value
    echo ""
    echo "$value"
}

echo "📋 Por favor, ingresa la información de tu proyecto Supabase"
echo "    (Puedes encontrarla en Settings > Database)"
echo ""

# Solicitar información
DB_HOST=$(prompt_input "Host de Supabase (ej: db.xxxxx.supabase.co)" "DB_HOST" "")
DB_PASSWORD=$(prompt_password "Password de la base de datos")
JWT_SECRET=$(prompt_input "JWT Secret (genera uno seguro)" "JWT_SECRET" "$(openssl rand -base64 32)")
FRONTEND_URL=$(prompt_input "URL del Frontend" "FRONTEND_URL" "http://localhost:3000")

echo ""
echo "📝 Creando archivo .env para el backend..."

# Crear archivo .env para el backend
cat > backend/.env << EOF
# ============================================
# CONFIGURACIÓN DE ENTORNO
# ============================================
NODE_ENV=development

# ============================================
# CONFIGURACIÓN DE SUPABASE
# ============================================
DB_HOST=${DB_HOST}
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=${DB_PASSWORD}
DB_SSL=true

# ============================================
# CONFIGURACIÓN DE JWT
# ============================================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h

# ============================================
# CONFIGURACIÓN DE CORS
# ============================================
FRONTEND_URL=${FRONTEND_URL}
CORS_ORIGIN=${FRONTEND_URL}

# ============================================
# PUERTO DEL BACKEND
# ============================================
PORT=3001
EOF

echo -e "${GREEN}✅ Archivo backend/.env creado exitosamente${NC}"
echo ""

# Crear archivo .env para el frontend
echo "📝 Creando archivo .env para el frontend..."

BACKEND_URL=$(prompt_input "URL del Backend" "BACKEND_URL" "http://localhost:3001")

cat > frontend/.env << EOF
# ============================================
# CONFIGURACIÓN DE LA API
# ============================================
REACT_APP_API_URL=${BACKEND_URL}
REACT_APP_BACKEND_URL=${BACKEND_URL}
EOF

echo -e "${GREEN}✅ Archivo frontend/.env creado exitosamente${NC}"
echo ""

# Preguntar si quiere migrar la base de datos
echo "🗄️  ¿Deseas migrar el schema a Supabase ahora? (s/n)"
read -p "> " migrate

if [ "$migrate" = "s" ] || [ "$migrate" = "S" ]; then
    echo ""
    echo "📤 Migrando schema a Supabase..."
    
    # Verificar si psql está instalado
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ psql no está instalado${NC}"
        echo "Instálalo con:"
        echo "  - macOS: brew install postgresql"
        echo "  - Ubuntu: sudo apt-get install postgresql-client"
        echo ""
        echo "O ejecuta el schema manualmente desde Supabase SQL Editor:"
        echo "  1. Abre https://app.supabase.com"
        echo "  2. Ve a SQL Editor"
        echo "  3. Copia y pega database/schema.sql"
        echo "  4. Ejecuta el script"
    else
        CONNECTION_STRING="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/postgres"
        
        echo "Ejecutando schema.sql..."
        if psql "$CONNECTION_STRING" -f database/schema.sql; then
            echo -e "${GREEN}✅ Schema migrado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al migrar el schema${NC}"
            echo "Intenta ejecutarlo manualmente desde Supabase SQL Editor"
        fi
    fi
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Instala dependencias:"
echo "     cd backend && npm install"
echo "     cd frontend && npm install"
echo ""
echo "  2. Inicia el backend:"
echo "     cd backend && npm start"
echo ""
echo "  3. Inicia el frontend:"
echo "     cd frontend && npm start"
echo ""
echo "  4. Abre tu navegador en: ${FRONTEND_URL}"
echo ""
echo "📚 Para más información, consulta: GUIA_SUPABASE.md"
echo ""

