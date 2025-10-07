# Solución al Error de CORS en Vercel

## Problema Identificado

El error de CORS se debe a que:
1. Las variables de entorno no están configuradas correctamente en Vercel
2. El backend serverless no está recibiendo la configuración de CORS adecuada

## Variables de Entorno Requeridas en Vercel

Necesitas configurar estas variables en tu proyecto de Vercel (backend):

```bash
# Configuración de Base de Datos
DB_HOST=db.nwjyxllifotjqzvqhyyc.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_de_supabase
DB_SSL=true

# Configuración de JWT
JWT_SECRET=0+YHnyygCxOg/8J7kKx0OKC+r9sZIlYd0qZpqXxMI8M=
JWT_EXPIRES_IN=24h

# Configuración de CORS (MUY IMPORTANTE)
FRONTEND_URL=https://controlacceso-frontend.vercel.app
CORS_ORIGIN=https://controlacceso-frontend.vercel.app

# Configuración de Node
NODE_ENV=production
PORT=3001
```

## Comandos para Configurar Variables en Vercel

Ejecuta estos comandos en tu terminal (asegúrate de tener Vercel CLI instalado):

```bash
# Navegar al directorio del backend
cd backend

# Configurar variables de entorno
vercel env add DB_HOST
# Cuando te pregunte, ingresa: db.nwjyxllifotjqzvqhyyc.supabase.co

vercel env add DB_PORT
# Ingresa: 5432

vercel env add DB_NAME
# Ingresa: postgres

vercel env add DB_USER
# Ingresa: postgres

vercel env add DB_PASSWORD
# Ingresa tu password de Supabase

vercel env add DB_SSL
# Ingresa: true

vercel env add JWT_SECRET
# Ingresa: 0+YHnyygCxOg/8J7kKx0OKC+r9sZIlYd0qZpqXxMI8M=

vercel env add JWT_EXPIRES_IN
# Ingresa: 24h

vercel env add FRONTEND_URL
# Ingresa: https://controlacceso-frontend.vercel.app

vercel env add CORS_ORIGIN
# Ingresa: https://controlacceso-frontend.vercel.app

vercel env add NODE_ENV
# Ingresa: production
```

## Alternativa: Configurar desde el Dashboard de Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto del backend
3. Ve a Settings → Environment Variables
4. Agrega cada variable con su valor correspondiente

## Después de Configurar las Variables

1. Haz un nuevo deployment:
```bash
cd backend
vercel --prod
```

2. O simplemente haz push a GitHub para trigger el auto-deployment:
```bash
git add .
git commit -m "fix: Update CORS configuration"
git push origin main
```

## Verificación

Una vez configurado, puedes verificar que funciona:

1. Visita tu backend: https://tu-backend-url.vercel.app/health
2. Debería mostrar status "ok" y database "connected"
3. Prueba el endpoint de auth: https://tu-backend-url.vercel.app/api/auth (debería dar 404 para GET, pero no error de CORS)

## Notas Importantes

- El archivo `vercel.json` está configurado para usar `index-serverless.js`
- Este archivo tiene mejor manejo de CORS que el `index.js` regular
- Las variables de entorno son críticas para el funcionamiento en producción
- Nunca subas el archivo `.env` a GitHub por seguridad
