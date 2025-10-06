# 🚀 Guía de Despliegue en Render.com

---

## 🎯 ¿Por Qué Render?

- ✅ **Gratis** para empezar (Free tier)
- ✅ Tu código funciona **SIN cambios**
- ✅ Setup en **5-10 minutos**
- ✅ Git push automático para desplegar
- ✅ SSL automático (HTTPS)
- ✅ Compatible con Sequelize + Supabase
- ✅ Servidor Node.js tradicional (no serverless)

---

## 📋 Pre-requisitos

1. ✅ Cuenta de GitHub (tu repositorio ya debe estar en GitHub)
2. ✅ Cuenta de Supabase configurada
3. ✅ Variables de entorno listas (DB_HOST, DB_PASSWORD, etc.)

---

## 🚀 Paso 1: Crear Cuenta en Render

1. Ve a: https://render.com
2. Click en **"Get Started"**
3. **"Sign in with GitHub"** (recomendado)
4. Autoriza Render para acceder a tus repositorios

---

## 🔧 Paso 2: Crear Web Service

1. En el Dashboard de Render, click en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio:
   - Click en **"Connect repository"**
   - Busca: `ControlAcceso` (o el nombre de tu repo)
   - Click en **"Connect"**

---

## ⚙️ Paso 3: Configurar el Servicio

### Configuración Básica

```
Name: controlacceso-backend
Region: Oregon (US West)
Branch: main
Root Directory: (dejar vacío)
Runtime: Node
```

### Build & Deploy

```
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

### Plan

```
Plan: Free
```

**⚠️ Importante**: El plan Free tiene:
- 750 horas/mes gratis
- 512 MB RAM
- Shared CPU
- Auto-sleep después de 15 min de inactividad
- SSL automático

---

## 🔐 Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega estas variables:

### Variables de Base de Datos (Supabase)

```
DB_HOST=db.nwjyxllifotjqzvqhyyc.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[tu-password-de-supabase]
DB_SSL=true
```

### Variables de JWT

```
JWT_SECRET=[genera con: openssl rand -base64 64]
JWT_EXPIRES_IN=24h
```

### Variables de CORS (Actualizar después del deploy)

```
FRONTEND_URL=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
CORS_ORIGIN=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
```

### Variables de Supabase

```
SUPABASE_URL=https://nwjyxllifotjqzvqhyyc.supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_KEY=[tu-service-key]
```

### Variable de Node

```
NODE_ENV=production
PORT=3001
```

---

## 🎉 Paso 5: Desplegar

1. Click en **"Create Web Service"**
2. Render empezará a:
   - Clonar tu repositorio
   - Instalar dependencias (`npm install`)
   - Iniciar el servidor (`npm start`)
3. Espera 2-3 minutos (primera vez)
4. Verás los logs en tiempo real

### Logs que Deberías Ver:

```
🚀 Iniciando aplicación...
📊 Probando conexión a la base de datos...
✅ Conexión exitosa a la base de datos PostgreSQL
🌱 Cargando datos iniciales...
🚀 Servidor corriendo en puerto 10000
```

---

## ✅ Paso 6: Verificar el Backend

Una vez desplegado, Render te dará una URL:

```
https://controlacceso-backend-xxxx.onrender.com
```

### Prueba el Health Endpoint:

```bash
curl https://controlacceso-backend-xxxx.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-06T20:30:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### Prueba el API Test:

```bash
curl https://controlacceso-backend-xxxx.onrender.com/api/test
```

---

## 🔗 Paso 7: Conectar Frontend con Backend

### Actualizar Variables de Vercel Frontend

1. Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings/environment-variables

2. **Edita** estas variables con la URL de Render:

```
REACT_APP_API_URL=https://controlacceso-backend-xxxx.onrender.com
REACT_APP_BACKEND_URL=https://controlacceso-backend-xxxx.onrender.com
```

3. **Re-deploy** el frontend:

```bash
cd frontend && vercel --prod --yes
```

### Actualizar Variables de Render Backend

1. En Render Dashboard → Tu servicio → Environment
2. **Edita** estas variables con la URL del frontend:

```
FRONTEND_URL=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
CORS_ORIGIN=https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
```

3. Render re-desplegará automáticamente

---

## 🧪 Paso 8: Probar el Login

1. Abre el frontend en el navegador
2. Abre las DevTools (F12) → Console
3. Intenta hacer login con las credenciales de Supabase
4. Deberías ver el login exitoso

**Usuario admin por defecto** (si ejecutaste el schema SQL):
```
Email: admin@controlacceso.com
Password: (el que definiste en el SQL)
```

---

## 🔄 Deploys Automáticos

Una vez configurado, cada vez que hagas:

```bash
git push origin main
```

Render automáticamente:
1. Detecta el cambio
2. Hace pull del código
3. Ejecuta `npm install`
4. Reinicia el servidor
5. ¡Deploy completo! 🎉

---

## 📊 Dashboard de Render

En el dashboard puedes:

- 📈 Ver logs en tiempo real
- 🔄 Ver historial de deploys
- 📊 Ver uso de recursos (CPU, memoria)
- ⚙️ Cambiar variables de entorno
- 🔄 Hacer rollback a versiones anteriores
- 📧 Configurar notificaciones

---

## 💰 Costos

**Plan Free:**
- ✅ $0/mes
- ✅ 750 horas/mes
- ✅ 512 MB RAM
- ⚠️ Auto-sleep después de 15 min sin uso (primer request tarda 30-60 segundos)

**Si necesitas más:**
- Starter: $7/mes (sin auto-sleep)
- Standard: $25/mes (más recursos)

---

## 🎯 Arquitectura Final

```
┌─────────────────┐
│  Usuario/App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Frontend       │─────▶│  Backend         │
│  (Vercel)       │      │  (Render.com)    │
│  React + MUI    │      │  Node.js + API   │
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Database       │
                         │  (Supabase)     │
                         │  PostgreSQL     │
                         └─────────────────┘

Todo gratis ($0/mes) ✨
```

---

## 🛠️ Troubleshooting

### "Application failed to respond"

**Causa:** El backend no inició correctamente.

**Solución:**
1. Verifica los logs en Render Dashboard
2. Asegúrate de que las variables de entorno estén correctas
3. Verifica la conexión a Supabase

### "Cannot connect to database"

**Causa:** Variables de DB incorrectas.

**Solución:**
1. Verifica `DB_HOST`, `DB_PASSWORD`
2. Asegúrate de que `DB_SSL=true`
3. Prueba la conexión localmente primero

### "CORS error" en el frontend

**Causa:** `CORS_ORIGIN` no incluye la URL del frontend.

**Solución:**
1. Actualiza `CORS_ORIGIN` en Render con la URL exacta del frontend
2. Re-deploya (automático al cambiar variables)

### El servicio se duerme (Free tier)

**Comportamiento normal** en el plan Free. Primeras peticiones tardan 30-60 segundos.

**Soluciones:**
- Upgrade a plan Starter ($7/mes) para no tener auto-sleep
- Usar un servicio de "keep-alive" (ping cada 10 minutos)

---

## 📚 Recursos

- **Dashboard de Render:** https://dashboard.render.com
- **Documentación oficial:** https://render.com/docs
- **Guía de Node.js:** https://render.com/docs/deploy-node-express-app
- **Variables de entorno:** https://render.com/docs/environment-variables

---

## ✅ Checklist Final

- [ ] Cuenta de Render creada y conectada a GitHub
- [ ] Web Service creado y configurado
- [ ] 14 variables de entorno agregadas
- [ ] Backend desplegado exitosamente
- [ ] `/health` responde correctamente
- [ ] Variables de frontend actualizadas con URL de Render
- [ ] Frontend re-desplegado
- [ ] Login funciona correctamente
- [ ] ¡Aplicación 100% funcional! 🎉

---

## 🚀 Comandos Rápidos

```bash
# Generar JWT Secret
openssl rand -base64 64

# Re-deploy frontend después de cambiar variables
cd frontend && vercel --prod --yes

# Ver logs en tiempo real (desde Render Dashboard)
# O usar Render CLI:
render logs controlacceso-backend --tail
```

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás:

- ✅ Frontend en Vercel
- ✅ Backend en Render
- ✅ Base de datos en Supabase
- ✅ Todo gratis
- ✅ SSL automático
- ✅ Deploy automático con Git
- ✅ Totalmente funcional

**Tu aplicación estará en producción y lista para usar.** 🚀

