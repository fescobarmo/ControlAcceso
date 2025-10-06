# 🔐 Variables de Entorno para Vercel

Guía completa de todas las variables de entorno que debes configurar en Vercel para tu aplicación ControlAcceso.

---

## 📋 Resumen Rápido

### Frontend (React)
- **Proyecto**: `controlacceso-frontend`
- **Variables**: 4 variables
- **Sensibles**: 1 (SUPABASE_ANON_KEY)

### Backend (Node.js)
- **Proyecto**: `controlacceso-backend`
- **Variables**: 11 variables
- **Sensibles**: 4 (DB_PASSWORD, JWT_SECRET, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY)

---

## 🎨 Frontend - Variables de Entorno

### Ubicación en Vercel
```
https://vercel.com/tu-usuario/controlacceso-frontend
→ Settings → Environment Variables
```

### Variables Requeridas

```env
# ============================================
# API URLs
# ============================================

REACT_APP_API_URL
Valor: https://controlacceso-backend.vercel.app
Descripción: URL base de tu API backend
Entornos: Production, Preview, Development
Tipo: Plaintext

REACT_APP_BACKEND_URL
Valor: https://controlacceso-backend.vercel.app
Descripción: URL del backend (mismo que API_URL)
Entornos: Production, Preview, Development
Tipo: Plaintext

# ============================================
# Supabase
# ============================================

REACT_APP_SUPABASE_URL
Valor: https://xxxxxxxxxxxx.supabase.co
Descripción: URL de tu proyecto Supabase
¿Dónde obtenerlo?: Supabase → Settings → API → Project URL
Entornos: Production, Preview, Development
Tipo: Plaintext

REACT_APP_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
Descripción: Anon/Public key de Supabase
¿Dónde obtenerlo?: Supabase → Settings → API → anon public
Entornos: Production, Preview, Development
Tipo: Sensitive (⚠️ Sensible pero público)
```

### Cómo Agregar en Vercel Dashboard

1. Ve a tu proyecto frontend en Vercel
2. Settings → Environment Variables
3. Click "Add New"
4. Para cada variable:
   - **Key**: Nombre de la variable (ej: `REACT_APP_API_URL`)
   - **Value**: El valor correspondiente
   - **Environments**: Selecciona todos (Production, Preview, Development)
   - Click "Save"

### Comando CLI (Alternativa)

```bash
cd frontend

# API URL
vercel env add REACT_APP_API_URL production
# Cuando pregunte, ingresa: https://controlacceso-backend.vercel.app

vercel env add REACT_APP_BACKEND_URL production
# Cuando pregunte, ingresa: https://controlacceso-backend.vercel.app

vercel env add REACT_APP_SUPABASE_URL production
# Cuando pregunte, ingresa: https://xxxxxxxxxxxx.supabase.co

vercel env add REACT_APP_SUPABASE_ANON_KEY production
# Cuando pregunte, ingresa: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚡ Backend - Variables de Entorno

### Ubicación en Vercel
```
https://vercel.com/tu-usuario/controlacceso-backend
→ Settings → Environment Variables
```

### Variables Requeridas

```env
# ============================================
# NODE ENVIRONMENT
# ============================================

NODE_ENV
Valor: production
Descripción: Entorno de Node.js
Entornos: Production
Tipo: Plaintext

# ============================================
# DATABASE (Supabase PostgreSQL)
# ============================================

DB_HOST
Valor: db.xxxxxxxxxxxx.supabase.co
Descripción: Host de la base de datos Supabase
¿Dónde obtenerlo?: Supabase → Settings → Database → Host
Entornos: Production, Preview, Development
Tipo: Plaintext

DB_PORT
Valor: 5432
Descripción: Puerto de PostgreSQL
Entornos: Production, Preview, Development
Tipo: Plaintext

DB_NAME
Valor: postgres
Descripción: Nombre de la base de datos en Supabase
Entornos: Production, Preview, Development
Tipo: Plaintext

DB_USER
Valor: postgres
Descripción: Usuario de la base de datos
Entornos: Production, Preview, Development
Tipo: Plaintext

DB_PASSWORD
Valor: [tu-password-de-supabase]
Descripción: Contraseña de la base de datos
¿Dónde obtenerlo?: La que creaste al crear el proyecto Supabase
Entornos: Production, Preview, Development
Tipo: Secret (🔒 MUY SENSIBLE)

DB_SSL
Valor: true
Descripción: Habilitar SSL para conexión a DB
Entornos: Production, Preview, Development
Tipo: Plaintext

# ============================================
# JWT (Autenticación)
# ============================================

JWT_SECRET
Valor: [genera-un-string-aleatorio-muy-largo]
Descripción: Secret para firmar JWT tokens
¿Cómo generarlo?: openssl rand -base64 64
Entornos: Production, Preview, Development
Tipo: Secret (🔒 MUY SENSIBLE)

JWT_EXPIRES_IN
Valor: 24h
Descripción: Tiempo de expiración de tokens JWT
Entornos: Production, Preview, Development
Tipo: Plaintext

# ============================================
# CORS (Seguridad)
# ============================================

FRONTEND_URL
Valor: https://controlacceso-frontend.vercel.app
Descripción: URL de tu frontend para CORS
Entornos: Production
Tipo: Plaintext

CORS_ORIGIN
Valor: https://controlacceso-frontend.vercel.app
Descripción: Origen permitido para CORS
Entornos: Production
Tipo: Plaintext

# ============================================
# Supabase (Storage)
# ============================================

SUPABASE_URL
Valor: https://xxxxxxxxxxxx.supabase.co
Descripción: URL de tu proyecto Supabase
¿Dónde obtenerlo?: Supabase → Settings → API → Project URL
Entornos: Production, Preview, Development
Tipo: Plaintext

SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Descripción: Anon/Public key de Supabase
¿Dónde obtenerlo?: Supabase → Settings → API → anon public
Entornos: Production, Preview, Development
Tipo: Plaintext

SUPABASE_SERVICE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
Descripción: Service Role key (NUNCA expongas esto)
¿Dónde obtenerlo?: Supabase → Settings → API → service_role secret
Entornos: Production, Preview, Development
Tipo: Secret (🔒 EXTREMADAMENTE SENSIBLE)
```

### Cómo Agregar en Vercel Dashboard

1. Ve a tu proyecto backend en Vercel
2. Settings → Environment Variables
3. Click "Add New"
4. Para cada variable:
   - **Key**: Nombre de la variable
   - **Value**: El valor correspondiente
   - **Environments**: Selecciona los necesarios
   - Para variables sensibles, marca "Sensitive"
   - Click "Save"

### Comando CLI (Alternativa)

```bash
cd backend

# Variables básicas
vercel env add NODE_ENV production
# Valor: production

vercel env add DB_HOST production
# Valor: db.xxxxxxxxxxxx.supabase.co

vercel env add DB_PORT production
# Valor: 5432

vercel env add DB_NAME production
# Valor: postgres

vercel env add DB_USER production
# Valor: postgres

vercel env add DB_PASSWORD production
# Valor: [tu-password]

vercel env add DB_SSL production
# Valor: true

vercel env add JWT_SECRET production
# Valor: [string-aleatorio-largo]

vercel env add JWT_EXPIRES_IN production
# Valor: 24h

vercel env add FRONTEND_URL production
# Valor: https://controlacceso-frontend.vercel.app

vercel env add CORS_ORIGIN production
# Valor: https://controlacceso-frontend.vercel.app

vercel env add SUPABASE_URL production
# Valor: https://xxxxxxxxxxxx.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add SUPABASE_SERVICE_KEY production
# Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 Cómo Obtener las Credenciales

### 1. Credenciales de Supabase

```bash
# 1. Ve a https://app.supabase.com
# 2. Selecciona tu proyecto
# 3. Ve a Settings → API
# 4. Copia:
#    - Project URL → SUPABASE_URL
#    - anon public → SUPABASE_ANON_KEY
#    - service_role → SUPABASE_SERVICE_KEY

# 5. Ve a Settings → Database
# 6. Copia:
#    - Host → DB_HOST
```

### 2. Generar JWT_SECRET

```bash
# Opción 1: OpenSSL
openssl rand -base64 64

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Opción 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 3. URL del Backend

Después del primer deploy:
```bash
cd backend
vercel --prod

# Copia la URL que te da, algo como:
# https://controlacceso-backend-xxx.vercel.app
```

### 4. URL del Frontend

Después del primer deploy:
```bash
cd frontend
vercel --prod

# Copia la URL que te da, algo como:
# https://controlacceso-frontend-xxx.vercel.app
```

---

## 📝 Script de Configuración Rápida

Crea un archivo `setup-vercel-env.sh`:

```bash
#!/bin/bash

echo "🔐 Configurador de Variables de Entorno para Vercel"
echo ""

# Frontend
echo "📱 Configurando Frontend..."
cd frontend

read -p "URL del Backend en Vercel: " BACKEND_URL
vercel env add REACT_APP_API_URL production <<< "$BACKEND_URL"
vercel env add REACT_APP_BACKEND_URL production <<< "$BACKEND_URL"

read -p "Supabase URL: " SUPABASE_URL
vercel env add REACT_APP_SUPABASE_URL production <<< "$SUPABASE_URL"

read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
vercel env add REACT_APP_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"

cd ..

# Backend
echo ""
echo "⚡ Configurando Backend..."
cd backend

vercel env add NODE_ENV production <<< "production"

read -p "DB Host (Supabase): " DB_HOST
vercel env add DB_HOST production <<< "$DB_HOST"

vercel env add DB_PORT production <<< "5432"
vercel env add DB_NAME production <<< "postgres"
vercel env add DB_USER production <<< "postgres"

read -sp "DB Password: " DB_PASSWORD
echo ""
vercel env add DB_PASSWORD production <<< "$DB_PASSWORD"

vercel env add DB_SSL production <<< "true"

read -p "JWT Secret (genera uno con: openssl rand -base64 64): " JWT_SECRET
vercel env add JWT_SECRET production <<< "$JWT_SECRET"

vercel env add JWT_EXPIRES_IN production <<< "24h"

read -p "Frontend URL en Vercel: " FRONTEND_URL
vercel env add FRONTEND_URL production <<< "$FRONTEND_URL"
vercel env add CORS_ORIGIN production <<< "$FRONTEND_URL"

vercel env add SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"

read -p "Supabase Service Key: " SUPABASE_SERVICE_KEY
vercel env add SUPABASE_SERVICE_KEY production <<< "$SUPABASE_SERVICE_KEY"

cd ..

echo ""
echo "✅ Variables de entorno configuradas!"
```

---

## ✅ Checklist de Verificación

### Frontend
- [ ] REACT_APP_API_URL
- [ ] REACT_APP_BACKEND_URL
- [ ] REACT_APP_SUPABASE_URL
- [ ] REACT_APP_SUPABASE_ANON_KEY

### Backend
- [ ] NODE_ENV
- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_NAME
- [ ] DB_USER
- [ ] DB_PASSWORD
- [ ] DB_SSL
- [ ] JWT_SECRET
- [ ] JWT_EXPIRES_IN
- [ ] FRONTEND_URL
- [ ] CORS_ORIGIN
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_KEY

---

## 🧪 Verificar Configuración

Después de configurar las variables:

```bash
# Ver variables configuradas (sin valores sensibles)
cd frontend
vercel env ls

cd backend
vercel env ls

# Re-deploy para que las variables surtan efecto
cd frontend
vercel --prod

cd backend
vercel --prod
```

---

## ⚠️ Notas Importantes

### Sensibilidad de Variables

| Variable | Nivel | ¿Puede ser pública? |
|----------|-------|---------------------|
| `REACT_APP_*` | Público | ✅ Sí (se embebe en frontend) |
| `SUPABASE_ANON_KEY` | Bajo | ✅ Sí (diseñada para ser pública) |
| `DB_PASSWORD` | Alto | ❌ NO (solo backend) |
| `JWT_SECRET` | Alto | ❌ NO (solo backend) |
| `SUPABASE_SERVICE_KEY` | Crítico | ❌ NO (solo backend) |

### Entornos en Vercel

- **Production**: Variables para producción
- **Preview**: Variables para previews (PRs)
- **Development**: Variables para desarrollo local

**Recomendación**: Agrega todas las variables a todos los entornos.

### Orden de Configuración

1. ✅ Configura Supabase primero
2. ✅ Deploy backend (sin variables aún)
3. ✅ Copia URL del backend
4. ✅ Agrega variables al backend
5. ✅ Re-deploy backend
6. ✅ Agrega variables al frontend (con URL del backend)
7. ✅ Deploy frontend

---

## 🆘 Problemas Comunes

### "Cannot connect to database"
- Verifica `DB_HOST`, `DB_PASSWORD`, `DB_SSL=true`
- Asegúrate de que el schema esté ejecutado en Supabase

### "CORS error"
- Verifica que `FRONTEND_URL` y `CORS_ORIGIN` coincidan con la URL real del frontend
- No olvides el `https://`

### "JWT invalid"
- Verifica que `JWT_SECRET` sea el mismo en todos los entornos
- Debe ser un string largo y aleatorio

### "Environment variables not found"
- Después de agregar variables, debes re-deployar
- `vercel --prod` para aplicar cambios

---

## 📚 Recursos

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Settings](https://app.supabase.com)

---

**¿Listo para configurar?** Usa el script de setup o sigue la guía paso a paso.

