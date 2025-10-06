# 🔓 Desactivar Protección de Vercel y Configurar Variables

## ❌ Problema Actual

El backend está protegido (HTTP 401) y no puede recibir peticiones del frontend.

---

## ✅ Solución Paso a Paso

### PASO 1: Desactivar Protección en Backend

1. Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-backend/settings/deployment-protection

2. En "Vercel Authentication":
   - **Desactiva** completamente la protección
   - Debe estar en **"None"** o **"Disabled"**

3. Guarda los cambios

### PASO 2: Desactivar Protección en Frontend

1. Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings/deployment-protection

2. En "Vercel Authentication":
   - **Desactiva** completamente la protección
   - Debe estar en **"None"** o **"Disabled"**

3. Guarda los cambios

### PASO 3: Configurar Variables de Entorno del Backend

Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-backend/settings/environment-variables

Agrega estas variables (todas en Production, Preview y Development):

```env
NODE_ENV=production

DB_HOST=db.nwjyxllifotjqzvqhyyc.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[tu-password-de-supabase]
DB_SSL=true

JWT_SECRET=[genera con: openssl rand -base64 64]
JWT_EXPIRES_IN=24h

FRONTEND_URL=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
CORS_ORIGIN=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app

SUPABASE_URL=https://nwjyxllifotjqzvqhyyc.supabase.co
SUPABASE_ANON_KEY=[tu-anon-key-de-supabase]
SUPABASE_SERVICE_KEY=[tu-service-key-de-supabase]
```

### PASO 4: Configurar Variables de Entorno del Frontend

Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings/environment-variables

Agrega estas variables (todas en Production, Preview y Development):

```env
REACT_APP_API_URL=https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app
REACT_APP_BACKEND_URL=https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app
REACT_APP_SUPABASE_URL=https://nwjyxllifotjqzvqhyyc.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[tu-anon-key-de-supabase]
```

### PASO 5: Re-deploy Ambos Proyectos

Después de configurar las variables, debes re-deployar:

```bash
cd backend && vercel --prod --yes
cd ../frontend && vercel --prod --yes
```

O desde el Dashboard:
1. Ve a cada proyecto → Deployments
2. Click en el último deployment → "..." → "Redeploy"

---

## 🧪 Verificación

### 1. Verificar que el backend responde sin autenticación

```bash
curl https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app/health
```

**Debe responder:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

**NO debe pedir autenticación (401).**

### 2. Verificar que el frontend carga

Abre: https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app

Debe mostrar la pantalla de login sin pedir autenticación de Vercel.

### 3. Probar login desde el frontend

1. Abre el frontend en el navegador
2. Abre las DevTools (F12) → Console
3. Intenta hacer login
4. Verifica que no haya errores CORS
5. Verifica que la petición llegue al backend

---

## 🔍 Troubleshooting

### El backend sigue pidiendo autenticación (401)

**Solución:**
1. Verifica que Deployment Protection esté en "None"
2. Re-deploya el backend: `cd backend && vercel --prod --yes`
3. Espera 1-2 minutos y prueba de nuevo

### Error de CORS en el navegador

```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solución:**
1. Verifica que `CORS_ORIGIN` en el backend incluya la URL del frontend
2. Verifica que `FRONTEND_URL` esté configurada
3. Re-deploya el backend

### Error de conexión a base de datos

```
{"error": "Database connection failed"}
```

**Solución:**
1. Verifica que `DB_HOST`, `DB_PASSWORD`, `DB_SSL=true` estén correctos
2. Verifica que el proyecto de Supabase esté activo
3. Prueba la conexión localmente:
```bash
psql "postgresql://postgres:[PASSWORD]@db.nwjyxllifotjqzvqhyyc.supabase.co:5432/postgres?sslmode=require"
```

### Frontend no se conecta al backend

**En DevTools Console, verifica:**
1. ¿Cuál es la URL que está intentando llamar?
2. ¿Hay errores de red?
3. ¿Hay errores de CORS?

**Solución:**
1. Verifica que `REACT_APP_API_URL` apunte al backend correcto
2. Re-deploya el frontend después de configurar las variables

---

## 📊 Comandos Útiles

### Ver logs del backend
```bash
vercel logs https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app --follow
```

### Ver variables configuradas
```bash
cd backend && vercel env ls
cd frontend && vercel env ls
```

### Generar JWT Secret
```bash
openssl rand -base64 64
```

---

## ⚠️ IMPORTANTE

1. **Desactivar protección** es necesario para que el backend sea accesible públicamente
2. **Configurar variables de entorno** es obligatorio para que funcione
3. **Re-deployar** después de cambiar variables es necesario para aplicar los cambios
4. La protección de Vercel es diferente a la autenticación de la aplicación (JWT)

---

## 🎯 Checklist

- [ ] Protección desactivada en Backend (Deployment Protection → None)
- [ ] Protección desactivada en Frontend (Deployment Protection → None)
- [ ] 14 variables configuradas en Backend
- [ ] 4 variables configuradas en Frontend
- [ ] Backend re-desplegado
- [ ] Frontend re-desplegado
- [ ] `/health` responde sin 401
- [ ] Frontend carga sin pedir autenticación
- [ ] Login funciona correctamente

---

## 🚀 Resumen de URLs

**Backend Settings:**
https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-backend/settings

**Frontend Settings:**
https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings

**Backend Deployment Protection:**
https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-backend/settings/deployment-protection

**Frontend Deployment Protection:**
https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings/deployment-protection

