#!/bin/bash

# =====================================================
# Script de Deploy a Vercel (Frontend + Backend)
# =====================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}║           🚀 DEPLOY A VERCEL - CONTROLACCESO                 ║${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no está instalado${NC}"
    echo ""
    read -p "¿Deseas instalarlo ahora? (s/n) " install_vercel
    if [ "$install_vercel" = "s" ] || [ "$install_vercel" = "S" ]; then
        echo -e "${BLUE}📦 Instalando Vercel CLI...${NC}"
        npm install -g vercel
        echo -e "${GREEN}✅ Vercel CLI instalado${NC}"
    else
        echo -e "${RED}❌ No se puede continuar sin Vercel CLI${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📋 Opciones de Deploy:${NC}"
echo ""
echo "  1. Deploy Frontend solamente"
echo "  2. Deploy Backend solamente"
echo "  3. Deploy Frontend + Backend (Full Stack)"
echo "  4. Deploy a Producción (Frontend + Backend)"
echo "  5. Ver deployments actuales"
echo "  6. Rollback a versión anterior"
echo ""
read -p "Selecciona una opción (1-6): " option

case $option in
    1)
        echo ""
        echo -e "${BLUE}🎨 Desplegando Frontend a Vercel...${NC}"
        cd frontend
        
        # Verificar si hay cambios sin commitear
        if [[ -n $(git status -s) ]]; then
            echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
            read -p "¿Continuar de todos modos? (s/n) " continue
            if [ "$continue" != "s" ] && [ "$continue" != "S" ]; then
                echo "Deploy cancelado"
                exit 0
            fi
        fi
        
        echo ""
        read -p "¿Desplegar a producción? (s/n) " to_prod
        
        if [ "$to_prod" = "s" ] || [ "$to_prod" = "S" ]; then
            echo -e "${GREEN}🚀 Desplegando a producción...${NC}"
            vercel --prod
        else
            echo -e "${YELLOW}🔍 Desplegando preview...${NC}"
            vercel
        fi
        
        echo ""
        echo -e "${GREEN}✅ Frontend desplegado exitosamente${NC}"
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}⚡ Desplegando Backend a Vercel...${NC}"
        cd backend
        
        if [[ -n $(git status -s) ]]; then
            echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
            read -p "¿Continuar de todos modos? (s/n) " continue
            if [ "$continue" != "s" ] && [ "$continue" != "S" ]; then
                echo "Deploy cancelado"
                exit 0
            fi
        fi
        
        echo ""
        read -p "¿Desplegar a producción? (s/n) " to_prod
        
        if [ "$to_prod" = "s" ] || [ "$to_prod" = "S" ]; then
            echo -e "${GREEN}🚀 Desplegando a producción...${NC}"
            vercel --prod
        else
            echo -e "${YELLOW}🔍 Desplegando preview...${NC}"
            vercel
        fi
        
        echo ""
        echo -e "${GREEN}✅ Backend desplegado exitosamente${NC}"
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}🔄 Desplegando Full Stack (Preview)...${NC}"
        
        # Deploy Frontend
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}1/2: Frontend${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        cd frontend
        FRONTEND_URL=$(vercel --yes 2>&1 | grep "https://" | tail -1)
        echo -e "${GREEN}✅ Frontend: $FRONTEND_URL${NC}"
        cd ..
        
        # Deploy Backend
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}2/2: Backend${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        cd backend
        BACKEND_URL=$(vercel --yes 2>&1 | grep "https://" | tail -1)
        echo -e "${GREEN}✅ Backend: $BACKEND_URL${NC}"
        cd ..
        
        echo ""
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              ✅ DEPLOY COMPLETO EXITOSO                       ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${BLUE}📱 URLs de Preview:${NC}"
        echo -e "   Frontend: ${CYAN}$FRONTEND_URL${NC}"
        echo -e "   Backend:  ${CYAN}$BACKEND_URL${NC}"
        echo ""
        echo -e "${YELLOW}💡 Recuerda actualizar las variables de entorno en Vercel Dashboard${NC}"
        ;;
        
    4)
        echo ""
        echo -e "${RED}⚠️  DEPLOY A PRODUCCIÓN${NC}"
        echo ""
        echo "Esto desplegará tu aplicación a producción."
        echo "Los usuarios verán estos cambios inmediatamente."
        echo ""
        read -p "¿Estás seguro? Escribe 'DEPLOY' para confirmar: " confirm
        
        if [ "$confirm" != "DEPLOY" ]; then
            echo -e "${YELLOW}Deploy cancelado${NC}"
            exit 0
        fi
        
        # Deploy Frontend
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}1/2: Frontend a Producción${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        cd frontend
        
        # Capturar output completo
        FRONTEND_OUTPUT=$(vercel --prod --yes 2>&1)
        FRONTEND_URL=$(echo "$FRONTEND_OUTPUT" | grep -o 'https://[^ ]*' | grep -v 'Inspect:' | tail -1)
        
        if [ -z "$FRONTEND_URL" ]; then
            echo -e "${YELLOW}⚠️  No se pudo capturar la URL automáticamente${NC}"
            echo -e "${BLUE}Output de Vercel:${NC}"
            echo "$FRONTEND_OUTPUT"
            read -p "Ingresa la URL del frontend manualmente: " FRONTEND_URL
        else
            echo -e "${GREEN}✅ Frontend: $FRONTEND_URL${NC}"
        fi
        cd ..
        
        # Deploy Backend
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}2/2: Backend a Producción${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        cd backend
        
        # Capturar output completo
        BACKEND_OUTPUT=$(vercel --prod --yes 2>&1)
        BACKEND_URL=$(echo "$BACKEND_OUTPUT" | grep -o 'https://[^ ]*' | grep -v 'Inspect:' | tail -1)
        
        if [ -z "$BACKEND_URL" ]; then
            echo -e "${YELLOW}⚠️  No se pudo capturar la URL automáticamente${NC}"
            echo -e "${BLUE}Output de Vercel:${NC}"
            echo "$BACKEND_OUTPUT"
            read -p "Ingresa la URL del backend manualmente: " BACKEND_URL
        else
            echo -e "${GREEN}✅ Backend: $BACKEND_URL${NC}"
        fi
        cd ..
        
        # Health Check
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}Health Check${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if [ -n "$FRONTEND_URL" ]; then
            echo "Verificando frontend: $FRONTEND_URL"
            FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
            if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "301" ] || [ "$FRONTEND_STATUS" = "302" ]; then
                echo -e "${GREEN}✅ Frontend OK (Status: $FRONTEND_STATUS)${NC}"
            else
                echo -e "${YELLOW}⚠️  Frontend status: $FRONTEND_STATUS (puede estar inicializando)${NC}"
            fi
        else
            echo -e "${RED}❌ No se pudo verificar frontend (URL vacía)${NC}"
        fi
        
        echo ""
        if [ -n "$BACKEND_URL" ]; then
            echo "Verificando backend: $BACKEND_URL/api/health"
            sleep 3  # Dar tiempo a que el backend se inicie
            BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null || echo "000")
            if [ "$BACKEND_STATUS" = "200" ]; then
                echo -e "${GREEN}✅ Backend OK (Status: $BACKEND_STATUS)${NC}"
            else
                echo -e "${YELLOW}⚠️  Backend status: $BACKEND_STATUS${NC}"
                echo -e "${YELLOW}   Nota: Las Vercel Functions pueden tardar unos segundos en iniciar${NC}"
                echo -e "${YELLOW}   Verifica manualmente: $BACKEND_URL/api/health${NC}"
            fi
        else
            echo -e "${RED}❌ No se pudo verificar backend (URL vacía)${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║          🎉 DEPLOY A PRODUCCIÓN COMPLETADO                    ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${BLUE}🌐 URLs de Producción:${NC}"
        echo -e "   Frontend: ${GREEN}$FRONTEND_URL${NC}"
        echo -e "   Backend:  ${GREEN}$BACKEND_URL${NC}"
        ;;
        
    5)
        echo ""
        echo -e "${BLUE}📊 Deployments Actuales:${NC}"
        echo ""
        echo -e "${CYAN}Frontend:${NC}"
        cd frontend
        vercel ls
        cd ..
        
        echo ""
        echo -e "${CYAN}Backend:${NC}"
        cd backend
        vercel ls
        cd ..
        ;;
        
    6)
        echo ""
        echo -e "${YELLOW}⏮️  Rollback a Versión Anterior${NC}"
        echo ""
        echo "1. Rollback Frontend"
        echo "2. Rollback Backend"
        echo "3. Rollback Ambos"
        echo ""
        read -p "Selecciona (1-3): " rollback_option
        
        case $rollback_option in
            1)
                cd frontend
                echo "Deployments disponibles:"
                vercel ls
                echo ""
                read -p "Ingresa la URL del deployment: " deploy_url
                vercel promote "$deploy_url"
                ;;
            2)
                cd backend
                echo "Deployments disponibles:"
                vercel ls
                echo ""
                read -p "Ingresa la URL del deployment: " deploy_url
                vercel promote "$deploy_url"
                ;;
            3)
                echo "Frontend:"
                cd frontend
                vercel ls
                read -p "URL del deployment de frontend: " frontend_deploy
                vercel promote "$frontend_deploy"
                cd ..
                
                echo "Backend:"
                cd backend
                vercel ls
                read -p "URL del deployment de backend: " backend_deploy
                vercel promote "$backend_deploy"
                ;;
        esac
        
        echo -e "${GREEN}✅ Rollback completado${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ ¡Deploy completado!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

