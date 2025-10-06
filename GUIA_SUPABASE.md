# 🚀 Guía de Despliegue en Supabase

Esta guía te ayudará a migrar y desplegar tu aplicación ControlAcceso usando Supabase como backend.

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Configurar Supabase](#paso-1-configurar-supabase)
3. [Migrar la Base de Datos](#paso-2-migrar-la-base-de-datos)
4. [Configurar el Backend](#paso-3-configurar-el-backend)
5. [Desplegar el Backend](#paso-4-desplegar-el-backend)
6. [Desplegar el Frontend](#paso-5-desplegar-el-frontend)
7. [Verificación y Pruebas](#paso-6-verificación-y-pruebas)
8. [Solución de Problemas](#solución-de-problemas)

## 🎯 Visión General

### Arquitectura en Supabase

```
┌─────────────────────┐
│   Frontend (React)  │ ──► Vercel/Netlify
└─────────────────────┘
          │
          ↓
┌─────────────────────┐
│  Backend (Node.js)  │ ──► Railway/Render/Fly.io
└─────────────────────┘
          │
          ↓
┌─────────────────────┐
│  Supabase (PgSQL)   │ ──► Base de Datos + Auth
└─────────────────────┘
```

### ¿Qué es Supabase?

Supabase es una alternativa open-source a Firebase que proporciona:
- ✅ Base de datos PostgreSQL gestionada
- ✅ Autenticación integrada
- ✅ API RESTful automática
- ✅ Realtime subscriptions
- ✅ Storage para archivos
- ✅ Row Level Security (RLS)

## 📝 Paso 1: Configurar Supabase

### 1.1. Crear Cuenta y Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub/Google/Email
4. Crea un nuevo proyecto:
   - **Name**: `controlacceso`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a tus usuarios
   - **Pricing Plan**: Free (para empezar)

### 1.2. Obtener Credenciales

Una vez creado el proyecto, ve a **Settings** → **Database**:

```env
# Información que necesitarás:
Host: db.xxxxxxxxxxxx.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [la que creaste]
```

También en **Settings** → **API**:

```env
Project URL: https://xxxxxxxxxxxx.supabase.co
Project API Key (anon): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: Guarda el **Service Role Key** de forma segura, NO lo expongas en el frontend.

## 🗄️ Paso 2: Migrar la Base de Datos

### 2.1. Conectarse a Supabase

Puedes ejecutar el schema SQL directamente desde Supabase:

1. Ve a **SQL Editor** en tu proyecto Supabase
2. Crea un nuevo query
3. Copia y pega el contenido de `database/schema.sql`
4. Ejecuta el script

### 2.2. Ejecutar desde la Terminal (Alternativa)

```bash
# Instalar cliente PostgreSQL si no lo tienes
brew install postgresql  # macOS
# sudo apt-get install postgresql-client  # Linux

# Conectarse a Supabase
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres"

# Una vez conectado, ejecutar:
\i database/schema.sql
```

### 2.3. Verificar la Migración

En el **SQL Editor** de Supabase, ejecuta:

```sql
-- Verificar que las tablas se crearon correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar roles iniciales
SELECT * FROM roles;

-- Verificar perfiles
SELECT * FROM perfiles;
```

### 2.4. Insertar Datos Iniciales (Opcional)

Si tienes datos de prueba, ejecútalos:

```bash
# Desde la terminal
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres" \
  -f database/seeds/initialData.sql
```

O copia el contenido en el **SQL Editor** de Supabase.

## ⚙️ Paso 3: Configurar el Backend

### 3.1. Actualizar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```bash
cd backend
touch .env
```

Contenido del archivo `.env`:

```env
# ============================================
# CONFIGURACIÓN DE ENTORNO
# ============================================
NODE_ENV=production

# ============================================
# CONFIGURACIÓN DE SUPABASE
# ============================================
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_de_supabase_aqui
DB_SSL=true

# ============================================
# CONFIGURACIÓN DE JWT
# ============================================
JWT_SECRET=tu_jwt_secret_super_seguro_cambialo_en_produccion
JWT_EXPIRES_IN=24h

# ============================================
# CONFIGURACIÓN DE CORS
# ============================================
FRONTEND_URL=https://tu-frontend.vercel.app
CORS_ORIGIN=https://tu-frontend.vercel.app

# ============================================
# PUERTO DEL BACKEND
# ============================================
PORT=3001
```

### 3.2. Verificar Configuración de Sequelize

El archivo `backend/src/config/database.js` ya está configurado para usar SSL, solo asegúrate de que `DB_SSL=true` en tu `.env`.

### 3.3. Probar Conexión Localmente

```bash
cd backend
npm install
npm start
```

Deberías ver:
```
✅ Conexión a la base de datos establecida correctamente.
🚀 Servidor corriendo en puerto 3001
```

## 🚢 Paso 4: Desplegar el Backend

Tienes varias opciones para desplegar el backend. Aquí te muestro las más populares:

### Opción A: Railway 🚂 (Recomendado)

#### 4.1. Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con GitHub
3. Crea un nuevo proyecto: "New Project" → "Deploy from GitHub repo"

#### 4.2. Configurar el Despliegue

1. Selecciona tu repositorio `ControlAcceso`
2. Railway detectará automáticamente que es un proyecto Node.js
3. Configura el **Root Directory**: `backend`
4. Configura las **Variables de Entorno**:

```env
NODE_ENV=production
PORT=3001
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_SSL=true
JWT_SECRET=tu_jwt_secret_aqui
FRONTEND_URL=https://tu-frontend.vercel.app
CORS_ORIGIN=https://tu-frontend.vercel.app
```

5. Railway generará una URL pública: `https://controlacceso-backend-production.up.railway.app`

#### 4.3. Configurar Start Command

Si es necesario, especifica el comando de inicio:
- **Start Command**: `npm start`

### Opción B: Render 🎨

#### 4.1. Crear Cuenta en Render

1. Ve a [render.com](https://render.com)
2. Inicia sesión con GitHub
3. New → Web Service

#### 4.2. Configurar el Servicio

- **Repository**: Selecciona `ControlAcceso`
- **Name**: `controlacceso-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

#### 4.3. Variables de Entorno

Agrega las mismas variables que en Railway.

### Opción C: Fly.io ✈️

```bash
# Instalar flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Navegar al backend
cd backend

# Inicializar
flyctl launch

# Configurar variables
flyctl secrets set DB_HOST=db.xxxxxxxxxxxx.supabase.co
flyctl secrets set DB_PASSWORD=tu_password_aqui
flyctl secrets set JWT_SECRET=tu_secret_aqui
# ... resto de variables

# Desplegar
flyctl deploy
```

## 🎨 Paso 5: Desplegar el Frontend

### Opción A: Vercel 🔺 (Recomendado para React)

#### 5.1. Preparar el Frontend

Actualiza el archivo `.env` en `frontend/`:

```env
REACT_APP_API_URL=https://controlacceso-backend-production.up.railway.app
REACT_APP_BACKEND_URL=https://controlacceso-backend-production.up.railway.app
```

#### 5.2. Desplegar en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Navegar al frontend
cd frontend

# Desplegar
vercel

# Seguir las instrucciones:
# - Link to existing project? No
# - Project name: controlacceso-frontend
# - Directory: frontend
# - Build command: npm run build
# - Output directory: build
```

#### 5.3. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Agrega:
   ```
   REACT_APP_API_URL = https://tu-backend.railway.app
   REACT_APP_BACKEND_URL = https://tu-backend.railway.app
   ```
4. Redeploy el proyecto

### Opción B: Netlify 🌐

#### 5.1. Crear `netlify.toml`

En la raíz del frontend:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  REACT_APP_API_URL = "https://tu-backend.railway.app"
```

#### 5.2. Desplegar

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Navegar al frontend
cd frontend

# Desplegar
netlify deploy --prod
```

### Opción C: Supabase Hosting

Supabase no ofrece hosting de frontend por defecto, pero puedes usar Vercel o Netlify como se mostró arriba.

## ✅ Paso 6: Verificación y Pruebas

### 6.1. Verificar Backend

```bash
# Health check
curl https://tu-backend.railway.app/health

# Test de login (una vez tengas un usuario)
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

### 6.2. Verificar Frontend

1. Abre tu frontend: `https://tu-frontend.vercel.app`
2. Intenta hacer login
3. Verifica que puedas acceder al dashboard

### 6.3. Verificar Conexión a Supabase

En el **SQL Editor** de Supabase:

```sql
-- Ver logs de acceso recientes
SELECT * FROM logs_acceso 
ORDER BY fecha_hora DESC 
LIMIT 10;

-- Ver usuarios activos
SELECT id, username, email, estado 
FROM usuarios 
WHERE is_active = true;
```

### 6.4. Monitorear Logs

**Railway:**
- Ve a tu proyecto → Deployments → View Logs

**Render:**
- Ve a tu servicio → Logs

**Supabase:**
- Database → Logs
- Monitoring → Query Performance

## 🛠️ Solución de Problemas

### Error: "Connection refused" o "ECONNREFUSED"

**Causa**: El backend no puede conectarse a Supabase.

**Solución**:
1. Verifica las credenciales en `.env`
2. Asegúrate de que `DB_SSL=true`
3. Verifica que tu IP no esté bloqueada en Supabase (Settings → Database → Connection Pooling)

### Error: "CORS policy blocked"

**Causa**: El backend no permite peticiones del frontend.

**Solución**:
```javascript
// En backend/src/index.js, verifica:
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Error: "JWT malformed" o problemas de autenticación

**Causa**: El token JWT no se está generando correctamente.

**Solución**:
1. Verifica que `JWT_SECRET` esté configurado en el backend
2. Verifica que el frontend esté enviando el token en los headers:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

### Base de datos muy lenta

**Causa**: El plan gratuito de Supabase tiene limitaciones.

**Solución**:
1. Optimiza tus queries
2. Agrega índices a columnas frecuentemente consultadas
3. Considera actualizar al plan Pro de Supabase

### Límite de conexiones alcanzado

**Causa**: Demasiadas conexiones simultáneas a PostgreSQL.

**Solución**:
```javascript
// En backend/src/config/database.js, ajusta el pool:
pool: {
  max: 5,      // Reducir en plan gratuito
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

## 📊 Mejores Prácticas

### 1. Seguridad

```sql
-- Habilitar Row Level Security (RLS) en Supabase
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso
CREATE POLICY "Usuarios pueden ver su propia información"
  ON usuarios FOR SELECT
  USING (auth.uid() = uuid);
```

### 2. Backups

Supabase hace backups automáticos, pero puedes hacer manuales:

```bash
# Backup manual
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres" \
  > backup_$(date +%Y%m%d).sql
```

### 3. Monitoreo

- Configura alertas en Railway/Render para downtime
- Usa Supabase Dashboard para monitorear queries lentas
- Implementa logging en tu backend

### 4. Variables de Entorno

- NUNCA comitees archivos `.env` al repositorio
- Usa los gestores de secretos de cada plataforma
- Rota tus secretos periódicamente

## 🎉 ¡Felicidades!

Tu aplicación ControlAcceso ahora está desplegada en Supabase. 

### URLs Finales:
- **Frontend**: `https://tu-frontend.vercel.app`
- **Backend**: `https://tu-backend.railway.app`
- **Base de Datos**: Supabase Dashboard

### Próximos Pasos:
1. Configura un dominio personalizado
2. Implementa SSL/HTTPS (automático en Vercel/Railway)
3. Configura backups automáticos
4. Implementa monitoreo y alertas
5. Optimiza el rendimiento

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Railway](https://docs.railway.app)
- [Guía de Vercel](https://vercel.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en cada plataforma
2. Verifica las variables de entorno
3. Prueba la conexión a Supabase localmente primero
4. Consulta la sección de Solución de Problemas

---

**¡Éxito con tu despliegue!** 🚀

