#!/bin/bash

# =======================================================
# Script de Ayuda para Supabase
# =======================================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🚀 AYUDA: SETUP DE SUPABASE                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

EOF

echo -e "${BLUE}📖 GUÍAS DISPONIBLES:${NC}"
echo ""
echo "   1. INICIO_RAPIDO_SUPABASE.md       - Setup rápido (15 min)"
echo "   2. GUIA_SUPABASE.md                - Guía completa"
echo "   3. ARQUITECTURA_SUPABASE.md        - Diagramas"
echo "   4. SUPABASE_SETUP_COMPLETO.md      - Referencia completa"
echo "   5. RESUMEN_SUPABASE.md             - Resumen visual"
echo ""

echo -e "${BLUE}🛠️  SCRIPTS DISPONIBLES:${NC}"
echo ""
echo "   • npm run setup-supabase          - Configurar todo"
echo "   • npm run test-connection         - Probar conexión"
echo "   • npm run migrate                 - Migrar DB"
echo ""
echo "   • ./scripts/setup-supabase.sh     - Setup interactivo"
echo "   • node scripts/test-supabase-connection.js"
echo "   • ./scripts/migrate-to-supabase.sh"
echo ""

echo -e "${BLUE}🎯 COMANDOS RÁPIDOS:${NC}"
echo ""
echo "   Ver guía rápida:"
echo "   → cat INICIO_RAPIDO_SUPABASE.md | less"
echo ""
echo "   Ver guía completa:"
echo "   → cat GUIA_SUPABASE.md | less"
echo ""
echo "   Configurar ahora:"
echo "   → npm run setup-supabase"
echo ""

echo -e "${BLUE}🆘 DIAGNÓSTICO:${NC}"
echo ""
echo "   Probar conexión a Supabase:"
echo "   → node scripts/test-supabase-connection.js"
echo ""
echo "   Ver variables de entorno:"
echo "   → cat backend/.env"
echo ""
echo "   Ver logs del backend:"
echo "   → tail -f backend/logs/app.log"
echo ""

echo -e "${BLUE}✨ INICIO RÁPIDO:${NC}"
echo ""
echo -e "${GREEN}   1. Crear proyecto en Supabase:${NC}"
echo "      https://supabase.com"
echo ""
echo -e "${GREEN}   2. Configurar credenciales:${NC}"
echo "      npm run setup-supabase"
echo ""
echo -e "${GREEN}   3. Verificar conexión:${NC}"
echo "      npm run test-connection"
echo ""
echo -e "${GREEN}   4. Iniciar aplicación:${NC}"
echo "      cd backend && npm start"
echo "      cd frontend && npm start  (en otra terminal)"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "¿Qué deseas hacer?"
echo ""
echo "   a) Ver guía de inicio rápido"
echo "   b) Configurar Supabase ahora"
echo "   c) Probar conexión"
echo "   d) Ver arquitectura"
echo "   e) Salir"
echo ""
read -p "Selecciona una opción (a-e): " choice

case $choice in
    a|A)
        echo ""
        echo -e "${GREEN}Mostrando guía de inicio rápido...${NC}"
        sleep 1
        cat INICIO_RAPIDO_SUPABASE.md | less
        ;;
    b|B)
        echo ""
        echo -e "${GREEN}Iniciando configuración de Supabase...${NC}"
        sleep 1
        ./scripts/setup-supabase.sh
        ;;
    c|C)
        echo ""
        echo -e "${GREEN}Probando conexión a Supabase...${NC}"
        sleep 1
        node scripts/test-supabase-connection.js
        ;;
    d|D)
        echo ""
        echo -e "${GREEN}Mostrando arquitectura...${NC}"
        sleep 1
        cat ARQUITECTURA_SUPABASE.md | less
        ;;
    e|E)
        echo ""
        echo -e "${GREEN}¡Hasta luego!${NC}"
        echo ""
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Opción no válida${NC}"
        echo ""
        exit 1
        ;;
esac

