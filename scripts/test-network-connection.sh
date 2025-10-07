#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║         🔍 VERIFICADOR DE CONEXIÓN FRONTEND ↔ BACKEND            ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"

FRONTEND_URL="https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app"
BACKEND_URL="https://controlacceso-backend-8ufipli82-fescobarmo-gmailcoms-projects.vercel.app"

echo ""
echo "🌐 VERIFICANDO FRONTEND..."
echo "   URL: $FRONTEND_URL"

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend accesible (HTTP $FRONTEND_STATUS)"
elif [ "$FRONTEND_STATUS" = "401" ]; then
    echo "   ❌ Frontend protegido (HTTP $FRONTEND_STATUS) - Desactivar Deployment Protection"
else
    echo "   ⚠️  Frontend estado: HTTP $FRONTEND_STATUS"
fi

echo ""
echo "🔧 VERIFICANDO BACKEND..."
echo "   URL: $BACKEND_URL"

BACKEND_HEALTH=$(curl -s "$BACKEND_URL/health" 2>/dev/null)
if echo "$BACKEND_HEALTH" | grep -q '"status":"ok"'; then
    echo "   ✅ Backend funcionando"
    
    # Verificar conexión a base de datos
    if echo "$BACKEND_HEALTH" | grep -q '"database":"connected"'; then
        echo "   ✅ Base de datos conectada"
    else
        echo "   ⚠️  Base de datos desconectada - Configurar variables DB"
    fi
else
    echo "   ❌ Backend no responde"
fi

echo ""
echo "🧪 PROBANDO LOGIN ENDPOINT..."

LOGIN_TEST=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"123456"}' 2>/dev/null)

if echo "$LOGIN_TEST" | grep -q "error"; then
    echo "   ✅ Login endpoint responde (con validación)"
elif echo "$LOGIN_TEST" | grep -q "message"; then
    echo "   ✅ Login endpoint funcional"
else
    echo "   ❌ Login endpoint no responde correctamente"
fi

echo ""
echo "🔍 VERIFICANDO CORS..."

CORS_TEST=$(curl -s -X OPTIONS "$BACKEND_URL/api/auth/login" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -I 2>/dev/null | grep -i "access-control")

if [ -n "$CORS_TEST" ]; then
    echo "   ✅ CORS configurado"
else
    echo "   ⚠️  CORS puede necesitar configuración"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 RESUMEN:"
echo "   Frontend: $([ "$FRONTEND_STATUS" = "200" ] && echo "✅ OK" || echo "❌ Necesita configuración")"
echo "   Backend:  $(echo "$BACKEND_HEALTH" | grep -q '"status":"ok"' && echo "✅ OK" || echo "❌ Problema")"
echo "   Database: $(echo "$BACKEND_HEALTH" | grep -q '"database":"connected"' && echo "✅ OK" || echo "❌ Desconectada")"
echo ""

if [ "$FRONTEND_STATUS" = "200" ] && echo "$BACKEND_HEALTH" | grep -q '"status":"ok"'; then
    echo "🎉 ¡Conexión lista! Puedes probar el login."
else
    echo "⚠️  Sigue los pasos de configuración antes de probar el login."
fi

echo ""
