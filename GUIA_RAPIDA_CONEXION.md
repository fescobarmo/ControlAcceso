# 🚀 Guía Rápida: Conectar Frontend + Backend + Supabase en Vercel

---

## 📋 Checklist de Información Necesaria

Antes de ejecutar el script, obtén esta información:

### 1. 🗄️ Credenciales de Supabase

Ve a: https://app.supabase.com → Tu proyecto

#### A. Project URL
```
Settings → API → Configuration → Project URL
```
**Formato:** `https://xxxxxxxxxxxx.supabase.co`

**Ejemplo:** `https://nwjyxllifotjqzvqhyyc.supabase.co`

#### B. Anon/Public Key
```
Settings → API → Project API keys → anon public
```
**Formato:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (muy largo)

**Nota:** Esta key es segura para usar en el frontend.

#### C. Service Role Key 🔒
```
Settings → API → Project API keys → service_role
```
**Formato:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (muy largo)

**⚠️ MUY IMPORTANTE:** Esta key es ULTRA SENSIBLE. NUNCA la expongas en el frontend.

#### D. Database Host
```
Settings → Database → Connection string → Host
```
**Formato:** `db.xxxxxxxxxxxx.supabase.co`

**Ejemplo:** `db.nwjyxllifotjqzvqhyyc.supabase.co`

#### E. Database Password
```
La contraseña que creaste cuando creaste el proyecto Supabase.

Si la olvidaste:
Settings → Database → Database Settings → Reset database password
```

---

## 🏃 Ejecutar el Script de Configuración

Una vez que tengas toda la información anterior:

```bash
./scripts/configure-vercel-env.sh
```

El script te pedirá:

1. ✅ **Supabase Project URL** - Pegar la URL del proyecto
2. ✅ **Supabase Anon Key** - Pegar la anon/public key
3. ✅ **Supabase Service Key** - Pegar la service_role key
4. ✅ **DB Host** - Se auto-detecta del .env, confirmar o cambiar
5. ✅ **DB Password** - Ingresar la contraseña de la base de datos
6. ✅ **JWT Secret** - Se genera automáticamente

Luego:
- Configura automáticamente TODAS las variables en Vercel
- Te pregunta si quieres desplegar inmediatamente
- Si dices "s", despliega frontend y backend automáticamente

---

## 🎯 Alternativa: Configuración Manual

Si prefieres configurar manualmente:

### Backend (14 variables)

Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-backend/settings/environment-variables

```env
NODE_ENV=production
DB_HOST=db.nwjyxllifotjqzvqhyyc.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[tu-password]
DB_SSL=true
JWT_SECRET=[genera con: openssl rand -base64 64]
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
CORS_ORIGIN=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
SUPABASE_URL=https://nwjyxllifotjqzvqhyyc.supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_KEY=[tu-service-key]
```

**⚠️ IMPORTANTE:** Selecciona "Production, Preview, Development" para cada variable.

### Frontend (4 variables)

Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings/environment-variables

```env
REACT_APP_API_URL=https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app
REACT_APP_BACKEND_URL=https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app
REACT_APP_SUPABASE_URL=https://nwjyxllifotjqzvqhyyc.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[tu-anon-key]
```

### Re-deploy

Después de agregar las variables:

```bash
cd backend && vercel --prod
cd frontend && vercel --prod
```

---

## ✅ Verificar que Todo Funciona

### 1. Verificar Backend

```bash
curl https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T18:30:00.000Z",
  "database": "connected"
}
```

Si falla, ver logs:
```bash
vercel logs https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app
```

### 2. Verificar Frontend

Abre en el navegador:
```
https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
```

Debe mostrar la pantalla de login.

### 3. Probar Login

Usa las credenciales de un usuario que hayas creado en Supabase.

Si el schema SQL se ejecutó correctamente, deberías tener el usuario admin:
- **Usuario:** `admin@controlacceso.com`
- **Contraseña:** (la que hayas definido en el script SQL, por defecto: `admin123`)

---

## 🔧 Troubleshooting

### Backend no conecta a la base de datos

**Error común:** `ENOTFOUND` o `Connection refused`

**Solución:**
1. Verifica que `DB_HOST` esté correcto
2. Verifica que `DB_SSL=true`
3. Verifica que el password sea correcto
4. Asegúrate que el proyecto de Supabase esté activo

```bash
# Probar conexión localmente
cd backend
node -e "const { Sequelize } = require('sequelize'); const seq = new Sequelize('postgres', 'postgres', 'TU_PASSWORD', { host: 'db.nwjyxllifotjqzvqhyyc.supabase.co', port: 5432, dialect: 'postgres', dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }); seq.authenticate().then(() => console.log('✅ Conectado')).catch(e => console.error('❌ Error:', e.message));"
```

### Frontend no se comunica con el backend

**Error común:** CORS error o Network error

**Solución:**
1. Verifica que `CORS_ORIGIN` incluya la URL del frontend
2. Verifica que `REACT_APP_API_URL` apunte al backend correcto
3. Abre las DevTools del navegador (F12) → Console para ver el error exacto

### Variables de entorno no se aplican

**Problema:** Agregaste variables pero no funcionan

**Solución:**
Las variables solo se aplican después de un nuevo deploy:
```bash
cd backend && vercel --prod
cd frontend && vercel --prod
```

### JWT Secret Error

**Error:** `jwt malformed` o `invalid token`

**Solución:**
1. Genera un nuevo JWT_SECRET:
   ```bash
   openssl rand -base64 64
   ```
2. Agrégalo en Vercel Backend settings
3. Re-deploy backend

### Supabase Schema no ejecutado

**Error:** Tablas no existen

**Solución:**
1. Ve a Supabase SQL Editor
2. Copia `database/supabase-schema.sql`
3. Ejecuta el script completo
4. Verifica que no haya errores en la ejecución

---

## 📊 Dashboard de Vercel

Gestiona todo desde:
```
https://vercel.com/fescobarmo-gmailcoms-projects
```

**Enlaces rápidos:**
- Backend Settings: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-backend/settings
- Frontend Settings: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings
- Backend Logs: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-backend/logs
- Frontend Logs: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/logs

---

## 🎉 Listo!

Una vez completado, tu aplicación estará 100% funcional en la nube con:

- ✅ Frontend desplegado en Vercel
- ✅ Backend desplegado en Vercel (Serverless Functions)
- ✅ Base de datos en Supabase (PostgreSQL)
- ✅ Storage en Supabase
- ✅ SSL automático
- ✅ CDN global
- ✅ Auto-scaling

---

## 📝 Resumen de Comandos

```bash
# 1. Configurar variables (automático)
./scripts/configure-vercel-env.sh

# 2. O desplegar manualmente
cd backend && vercel --prod
cd frontend && vercel --prod

# 3. Verificar
curl https://controlacceso-backend-jqwk0j2zd-fescobarmo-gmailcoms-projects.vercel.app/health
open https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app

# 4. Ver logs si hay problemas
vercel logs [url-del-deployment]
```

---

**¿Necesitas ayuda?** Revisa `VARIABLES_ENTORNO_VERCEL.md` para más detalles.

