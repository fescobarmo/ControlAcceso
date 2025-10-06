# 🚀 Guía de Deploy a Vercel

Guía completa para desplegar tu aplicación ControlAcceso en Vercel (Frontend + Backend).

---

## 📋 Prerequisitos

### 1. Cuenta en Vercel
- Ve a [vercel.com](https://vercel.com)
- Crea una cuenta (gratis con GitHub)

### 2. Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 3. GitHub Secrets (para CI/CD)
Necesitarás configurar estos secrets en tu repositorio:

```
VERCEL_TOKEN             - Token de Vercel
VERCEL_ORG_ID           - ID de tu organización
VERCEL_PROJECT_ID_FRONTEND - ID del proyecto frontend
VERCEL_PROJECT_ID_BACKEND  - ID del proyecto backend
```

---

## 🎯 Métodos de Deploy

### Método 1: Script Interactivo (Recomendado)

```bash
npm run deploy:vercel
```

**Opciones disponibles:**
1. Deploy Frontend solamente
2. Deploy Backend solamente  
3. Deploy Frontend + Backend (Preview)
4. Deploy a Producción (Frontend + Backend)
5. Ver deployments actuales
6. Rollback a versión anterior

### Método 2: Manual con Vercel CLI

#### Frontend
```bash
cd frontend
vercel          # Deploy preview
vercel --prod   # Deploy producción
```

#### Backend
```bash
cd backend
vercel          # Deploy preview
vercel --prod   # Deploy producción
```

### Método 3: GitHub Actions (Automático)

Cada push a `main` o `develop` desplegará automáticamente:

```bash
git add .
git commit -m "Update: nuevo feature"
git push origin main
```

GitHub Actions ejecutará:
- ✅ Build del frontend
- ✅ Deploy a Vercel
- ✅ Build del backend
- ✅ Deploy a Vercel
- ✅ Health checks
- ✅ Notificaciones

---

## ⚙️ Configuración Inicial

### Paso 1: Configurar Frontend

```bash
cd frontend

# Primera vez: link con Vercel
vercel

# Responde las preguntas:
# Setup and deploy? Yes
# Which scope? [tu-usuario]
# Link to existing project? No
# Project name? controlacceso-frontend
# Directory? ./
# Override settings? No
```

### Paso 2: Configurar Backend

```bash
cd backend

# Primera vez: link con Vercel
vercel

# Responde las preguntas:
# Setup and deploy? Yes
# Which scope? [tu-usuario]  
# Link to existing project? No
# Project name? controlacceso-backend
# Directory? ./
# Override settings? No
```

### Paso 3: Configurar Variables de Entorno

#### En Vercel Dashboard

**Frontend** (`https://vercel.com/tu-usuario/controlacceso-frontend`)

Settings → Environment Variables:

```env
REACT_APP_API_URL=https://controlacceso-backend.vercel.app
REACT_APP_BACKEND_URL=https://controlacceso-backend.vercel.app
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend** (`https://vercel.com/tu-usuario/controlacceso-backend`)

Settings → Environment Variables:

```env
NODE_ENV=production
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_supabase
DB_SSL=true
JWT_SECRET=tu_jwt_secret_super_seguro
FRONTEND_URL=https://controlacceso-frontend.vercel.app
CORS_ORIGIN=https://controlacceso-frontend.vercel.app
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Via CLI

```bash
# Frontend
cd frontend
vercel env add REACT_APP_API_URL production
# Pega el valor cuando se solicite

# Backend
cd backend
vercel env add DB_PASSWORD production
# Pega el valor cuando se solicite
```

---

## 🔧 Configuración de GitHub Actions

### Paso 1: Obtener Tokens

#### Vercel Token
```bash
# 1. Ve a https://vercel.com/account/tokens
# 2. Create Token
# 3. Nombre: "GitHub Actions - ControlAcceso"
# 4. Scope: Full Account
# 5. Copia el token
```

#### Organization ID
```bash
# En tu terminal (con Vercel CLI instalado)
vercel whoami
# Copia el ID que aparece
```

#### Project IDs
```bash
# Frontend
cd frontend
cat .vercel/project.json
# Copia "projectId"

# Backend
cd backend
cat .vercel/project.json
# Copia "projectId"
```

### Paso 2: Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret

Agrega estos secrets:

```
VERCEL_TOKEN = [tu token de Vercel]
VERCEL_ORG_ID = [tu org ID]
VERCEL_PROJECT_ID_FRONTEND = [project ID del frontend]
VERCEL_PROJECT_ID_BACKEND = [project ID del backend]
```

### Paso 3: Verificar Workflow

El archivo `.github/workflows/deploy-vercel.yml` ya está configurado.

**Trigger automático:**
- Push a `main` → Deploy a producción
- Push a `develop` → Deploy preview
- Pull Request → Deploy preview + comentario en PR

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Frontend
cd frontend
vercel logs https://controlacceso-frontend.vercel.app

# Backend
cd backend
vercel logs https://controlacceso-backend.vercel.app
```

### Dashboard de Vercel

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Verás:
   - Deployments recientes
   - Analytics
   - Logs
   - Performance metrics

---

## 🔄 Rollback

### Via Script

```bash
npm run deploy:vercel
# Selecciona opción 6: Rollback
```

### Via CLI

```bash
# Ver deployments
cd frontend
vercel ls

# Promover un deployment anterior
vercel promote [URL-del-deployment-anterior]
```

### Via Dashboard

1. Ve a tu proyecto en Vercel
2. Deployments
3. Encuentra el deployment que funcionaba
4. Click en "..." → Promote to Production

---

## 🧪 Testing

### Health Checks

```bash
# Frontend
curl https://controlacceso-frontend.vercel.app

# Backend
curl https://controlacceso-backend.vercel.app/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2025-10-06T..."}
```

### Endpoints de API

```bash
# Test de login
curl -X POST https://controlacceso-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

---

## 🎯 Deploy Híbrido (Docker + Vercel)

### Mantener Docker mientras pruebas Vercel

```bash
# 1. Docker corriendo (actual)
docker-compose up -d

# 2. Deploy a Vercel (nuevo)
npm run deploy:vercel

# 3. Configurar load balancer (Cloudflare/Nginx)
# Ver ESTRATEGIA_HIBRIDA_DEPLOYMENT.md
```

### Load Balancing con Cloudflare

```javascript
// Cloudflare Worker
const dockerUrl = 'https://tu-servidor-docker.com';
const vercelUrl = 'https://controlacceso-backend.vercel.app';

// 20% a Vercel, 80% a Docker
const useVercel = Math.random() < 0.2;
const targetUrl = useVercel ? vercelUrl : dockerUrl;

// Proxy request
const response = await fetch(targetUrl + request.url);
```

---

## 💰 Costos

### Free Tier (Hobby)
- ✅ 100 GB bandwidth/mes
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Global CDN
- 💰 **Costo: $0/mes**

### Pro (si necesitas más)
- ✅ 1 TB bandwidth/mes
- ✅ Advanced analytics
- ✅ Team collaboration
- 💰 **Costo: $20/mes**

---

## 🚨 Solución de Problemas

### Error: "No se puede conectar a la BD"

**Causa:** Variables de entorno incorrectas

**Solución:**
```bash
# Verificar variables
vercel env ls

# Actualizar variable
vercel env rm DB_PASSWORD production
vercel env add DB_PASSWORD production
```

### Error: "Build failed"

**Causa:** Dependencias faltantes o código con errores

**Solución:**
```bash
# Probar build localmente
cd frontend
npm run build

cd backend
# Verificar que no haya errores de sintaxis
npm start
```

### Error: "Function timeout"

**Causa:** Vercel Functions tienen timeout de 10s (Hobby) o 60s (Pro)

**Solución:**
- Optimizar queries lentos
- Usar caching
- Upgrade a Pro si necesario

### Error: "CORS blocked"

**Causa:** CORS mal configurado

**Solución:**
```javascript
// backend/src/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## 📈 Optimizaciones

### 1. Edge Functions

Mover endpoints críticos a Edge:

```javascript
// vercel.json
{
  "functions": {
    "api/auth/login.js": {
      "runtime": "@vercel/node@2.0.0"
    }
  }
}
```

### 2. Caching

```javascript
// Agregar headers de cache
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

### 3. Image Optimization

```jsx
// Usar Vercel Image Optimization
import Image from 'next/image'; // Si migras a Next.js

// O configurar en vercel.json
{
  "images": {
    "domains": ["tu-dominio.com"]
  }
}
```

---

## ✅ Checklist de Deploy

### Pre-Deploy
- [ ] Proyecto funcionando localmente
- [ ] Tests pasando
- [ ] Variables de entorno configuradas
- [ ] Schema de Supabase ejecutado
- [ ] Vercel CLI instalado y autenticado

### Frontend
- [ ] `vercel.json` configurado
- [ ] Build exitoso localmente
- [ ] Variables de entorno en Vercel
- [ ] Deploy preview exitoso
- [ ] Testing en preview URL

### Backend
- [ ] `vercel.json` configurado
- [ ] Conexión a Supabase OK
- [ ] Variables de entorno en Vercel
- [ ] Deploy preview exitoso
- [ ] Health check pasando

### Producción
- [ ] Deploy a producción exitoso
- [ ] Health checks pasando
- [ ] Logs sin errores
- [ ] Frontend conecta con Backend
- [ ] Login funciona
- [ ] CRUD funciona

---

## 🎉 Siguiente Paso

**¿Listo para desplegar?**

```bash
# Opción 1: Script interactivo
npm run deploy:vercel

# Opción 2: Deploy rápido
cd frontend && vercel --prod
cd backend && vercel --prod

# Opción 3: Push a GitHub (CI/CD automático)
git push origin main
```

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/git)
- [Serverless Functions](https://vercel.com/docs/functions)

---

**¡Tu aplicación estará live en minutos!** 🚀

