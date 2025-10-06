# 🚀 Inicio Rápido - Deploy en Render (10 minutos)

---

## ⚡ Guía Express

### 📋 Lo que necesitas tener listo:

- ✅ Contraseña de Supabase
- ✅ Anon Key de Supabase (Settings → API → anon public)
- ✅ Service Key de Supabase (Settings → API → service_role)
- ✅ JWT_SECRET ya generado: `xD0HFzPITgKHcB6LCLLmV73HlllvnHWU8kZ0h0oLJFxSdL1x2e+XkICjY0D5Wd7piCmQ6vtGdKcA324q5EgyTQ==`

---

## 🏃 Paso 1: Subir a GitHub (30 segundos)

```bash
git add .
git commit -m "Add Render configuration for backend deployment"
git push origin main
```

✅ **Hecho**

---

## 🔐 Paso 2: Crear Cuenta en Render (1 minuto)

1. 🌐 Abre: **https://render.com**
2. 🔘 Click: **"Get Started"**
3. 🐙 Click: **"Sign in with GitHub"**
4. ✅ Autoriza Render para acceder a tus repos

✅ **Hecho**

---

## 🛠️ Paso 3: Crear Web Service (2 minutos)

En Render Dashboard:

1. 🔘 Click: **"New +" → "Web Service"**
2. 🔍 Busca: **"ControlAcceso"**
3. 🔗 Click: **"Connect"**
4. ⚙️ Configura:

```
Name: controlacceso-backend
Region: Oregon (US West)
Branch: main
Root Directory: [dejar vacío]
Runtime: Node

Build Command: cd backend && npm install
Start Command: cd backend && npm start

Plan: Free
```

5. ⏸️ **NO hagas click en "Create Web Service" todavía**

---

## 🔑 Paso 4: Variables de Entorno (3 minutos)

Scroll down a **"Environment Variables"** y agrega estas 14 variables:

### Base de Datos (Supabase)
```
DB_HOST = db.nwjyxllifotjqzvqhyyc.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = [TU_PASSWORD_DE_SUPABASE]
DB_SSL = true
```

### JWT
```
JWT_SECRET = xD0HFzPITgKHcB6LCLLmV73HlllvnHWU8kZ0h0oLJFxSdL1x2e+XkICjY0D5Wd7piCmQ6vtGdKcA324q5EgyTQ==
JWT_EXPIRES_IN = 24h
```

### CORS y Frontend
```
FRONTEND_URL = https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
CORS_ORIGIN = https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
```

### Supabase
```
SUPABASE_URL = https://nwjyxllifotjqzvqhyyc.supabase.co
SUPABASE_ANON_KEY = [TU_ANON_KEY_DE_SUPABASE]
SUPABASE_SERVICE_KEY = [TU_SERVICE_KEY_DE_SUPABASE]
```

### Node
```
NODE_ENV = production
PORT = 3001
```

✅ **Hecho**

---

## 🚀 Paso 5: Desplegar (2 minutos)

1. 🔘 Click: **"Create Web Service"**
2. ⏳ Espera 2-3 minutos mientras despliega
3. 👀 Observa los logs en tiempo real
4. ✅ Cuando veas: `🚀 Servidor corriendo en puerto 10000`

**Copia la URL que Render te da:**
```
https://controlacceso-backend-xxxx.onrender.com
```

✅ **Hecho**

---

## 🔗 Paso 6: Actualizar Frontend en Vercel (2 minutos)

1. Ve a: https://vercel.com/fescobarmo-gmailcoms-projects/controlacceso-frontend/settings/environment-variables

2. **Edita** estas 2 variables con la URL de Render:

```
REACT_APP_API_URL = https://controlacceso-backend-xxxx.onrender.com
REACT_APP_BACKEND_URL = https://controlacceso-backend-xxxx.onrender.com
```

3. Re-deploy desde terminal:

```bash
cd frontend
vercel --prod --yes
```

✅ **Hecho**

---

## 🧪 Paso 7: Probar (1 minuto)

### Verificar Backend

```bash
curl https://controlacceso-backend-xxxx.onrender.com/health
```

**Debería responder:**
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "production"
}
```

### Verificar Login

1. Abre: https://controlacceso-frontend-mbe5e334a-fescobarmo-gmailcoms-projects.vercel.app
2. Intenta hacer login con tus credenciales
3. ✅ **¡Debería funcionar!**

---

## 🎉 ¡LISTO!

Tu aplicación está 100% funcional en producción:

```
Frontend (Vercel) → Backend (Render) → Database (Supabase)
    ✓ Gratis          ✓ Gratis         ✓ Gratis
```

---

## 🔄 Deploys Automáticos

Ahora cada vez que hagas:

```bash
git push origin main
```

Render automáticamente:
- Detecta el cambio
- Hace pull del código
- Instala dependencias
- Reinicia el servidor
- ¡Deploy completo! 🚀

---

## ⚠️ Nota sobre el Plan Free de Render

El plan Free incluye **auto-sleep** después de 15 minutos sin uso:

- ✅ Primer request: 30-60 segundos (mientras se despierta)
- ✅ Requests siguientes: Instantáneos

Si necesitas que no se duerma: Upgrade a Starter ($7/mes)

---

## 🆘 ¿Problemas?

Ver guía completa: `cat GUIA_RENDER.md`

O ver logs en Render Dashboard → Tu servicio → Logs

---

## ✅ Checklist Final

- [ ] Código subido a GitHub
- [ ] Cuenta de Render creada
- [ ] Web Service configurado
- [ ] 14 variables agregadas
- [ ] Backend desplegado exitosamente
- [ ] `/health` responde OK
- [ ] Variables de frontend actualizadas
- [ ] Frontend re-desplegado
- [ ] Login funciona
- [ ] 🎉 ¡Todo listo!

