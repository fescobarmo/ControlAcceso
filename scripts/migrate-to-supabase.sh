#!/bin/bash

# =======================================================
# Script de Migración a Supabase
# =======================================================
# Este script migra tu base de datos local a Supabase
# =======================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Migración de Base de Datos a Supabase${NC}"
echo "=============================================="
echo ""

# Verificar que existe el archivo .env del backend
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ No se encontró backend/.env${NC}"
    echo ""
    echo "Ejecuta primero: ./scripts/setup-supabase.sh"
    echo ""
    exit 1
fi

# Cargar variables de entorno
source backend/.env

# Verificar credenciales
if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Faltan credenciales de Supabase en backend/.env${NC}"
    exit 1
fi

# Construir connection string
CONNECTION_STRING="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/postgres"

echo -e "${YELLOW}📋 Información de la conexión:${NC}"
echo "  Host: $DB_HOST"
echo "  Base de datos: postgres"
echo ""

# Verificar que psql esté instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql no está instalado${NC}"
    echo ""
    echo "Instálalo con:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql-client"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    echo ""
    echo -e "${YELLOW}Alternativa:${NC}"
    echo "Puedes ejecutar el schema manualmente:"
    echo "  1. Abre https://app.supabase.com"
    echo "  2. Ve a SQL Editor"
    echo "  3. Copia el contenido de database/schema.sql"
    echo "  4. Pégalo y ejecuta"
    echo ""
    exit 1
fi

# Probar conexión
echo -e "${YELLOW}🔍 Probando conexión a Supabase...${NC}"
if psql "$CONNECTION_STRING" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexión exitosa${NC}"
else
    echo -e "${RED}❌ No se pudo conectar a Supabase${NC}"
    echo ""
    echo "Verifica:"
    echo "  1. Que DB_HOST y DB_PASSWORD sean correctos en backend/.env"
    echo "  2. Que tu conexión a internet funcione"
    echo "  3. Que Supabase esté funcionando: https://status.supabase.com/"
    echo ""
    exit 1
fi
echo ""

# Advertencia
echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC}"
echo "Este script ejecutará el schema completo en Supabase."
echo "Si ya tienes datos, podrías perderlos."
echo ""
read -p "¿Deseas continuar? (escribe 'SI' para continuar): " confirm

if [ "$confirm" != "SI" ]; then
    echo ""
    echo "Migración cancelada."
    exit 0
fi
echo ""

# Hacer backup de la base de datos actual (si tiene datos)
echo -e "${YELLOW}📦 Creando backup de seguridad...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
if psql "$CONNECTION_STRING" -c "\dt" > /dev/null 2>&1; then
    pg_dump "$CONNECTION_STRING" > "$BACKUP_FILE" 2>/dev/null || true
    if [ -f "$BACKUP_FILE" ]; then
        echo -e "${GREEN}✅ Backup guardado en: $BACKUP_FILE${NC}"
    fi
fi
echo ""

# Ejecutar schema principal
echo -e "${YELLOW}📤 Ejecutando schema.sql...${NC}"
if psql "$CONNECTION_STRING" -f database/schema.sql; then
    echo -e "${GREEN}✅ Schema ejecutado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al ejecutar el schema${NC}"
    echo ""
    echo "Revisa los errores arriba e intenta ejecutar manualmente:"
    echo "  psql \"$CONNECTION_STRING\" -f database/schema.sql"
    echo ""
    exit 1
fi
echo ""

# Preguntar si quiere datos de prueba
echo "¿Deseas cargar datos de prueba? (s/n)"
read -p "> " load_seeds

if [ "$load_seeds" = "s" ] || [ "$load_seeds" = "S" ]; then
    echo ""
    echo -e "${YELLOW}📤 Cargando datos de prueba...${NC}"
    
    # Verificar si existen archivos de seeds
    if [ -f "backend/src/seeds/initialData.js" ]; then
        echo "Los seeds están en formato JavaScript."
        echo "Necesitas ejecutarlos desde Node.js:"
        echo ""
        echo "  cd backend"
        echo "  node src/seeds/initialData.js"
        echo ""
    fi
fi
echo ""

# Verificar migración
echo -e "${YELLOW}✅ Verificando migración...${NC}"
TABLE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Se crearon $TABLE_COUNT tablas${NC}"
    echo ""
    echo "Tablas creadas:"
    psql "$CONNECTION_STRING" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
else
    echo -e "${RED}❌ No se crearon tablas${NC}"
    exit 1
fi
echo ""

# Test de conexión con Node.js
echo -e "${YELLOW}🧪 Probando conexión desde Node.js...${NC}"
if [ -f "scripts/test-supabase-connection.js" ]; then
    node scripts/test-supabase-connection.js
else
    echo "Script de test no encontrado, saltando..."
fi
echo ""

# Resumen final
echo -e "${GREEN}🎉 ¡Migración completada exitosamente!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo "  1. Verifica los datos en Supabase Dashboard:"
echo "     https://app.supabase.com"
echo ""
echo "  2. Inicia el backend:"
echo "     cd backend && npm start"
echo ""
echo "  3. Inicia el frontend:"
echo "     cd frontend && npm start"
echo ""
echo "  4. Abre tu navegador en: http://localhost:3000"
echo ""
echo -e "${YELLOW}📚 Documentación:${NC} GUIA_SUPABASE.md"
echo ""

