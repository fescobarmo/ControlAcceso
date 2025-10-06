# ✅ Setup Completo para Supabase

## 📦 Archivos Creados

Se han creado los siguientes archivos para facilitar el despliegue en Supabase:

### 📖 Documentación

1. **`GUIA_SUPABASE.md`**
   - Guía completa y detallada de migración
   - Instrucciones paso a paso
   - Solución de problemas
   - Mejores prácticas
   - Múltiples opciones de despliegue

2. **`INICIO_RAPIDO_SUPABASE.md`**
   - Guía de inicio rápido (15 minutos)
   - Pasos condensados
   - Checklist de verificación
   - Credenciales por defecto
   - Troubleshooting básico

3. **`ARQUITECTURA_SUPABASE.md`**
   - Diagramas de arquitectura
   - Flujo de datos
   - Componentes del sistema
   - Comparativas (PostgreSQL local vs Supabase vs Firebase)
   - Estrategias de escalabilidad
   - Monitoreo y métricas

### 🛠️ Scripts de Configuración

4. **`scripts/setup-supabase.sh`**
   - Script interactivo de configuración
   - Solicita credenciales de Supabase
   - Genera archivos `.env` automáticamente
   - Opción de migrar schema directamente
   ```bash
   chmod +x scripts/setup-supabase.sh
   ./scripts/setup-supabase.sh
   ```

5. **`scripts/test-supabase-connection.js`**
   - Script de prueba de conexión
   - Verifica credenciales
   - Lista tablas existentes
   - Muestra estadísticas
   - Diagnóstico de errores
   ```bash
   node scripts/test-supabase-connection.js
   ```

6. **`scripts/migrate-to-supabase.sh`**
   - Script de migración automatizada
   - Crea backup antes de migrar
   - Ejecuta schema.sql
   - Verifica migración
   - Opción de datos de prueba
   ```bash
   chmod +x scripts/migrate-to-supabase.sh
   ./scripts/migrate-to-supabase.sh
   ```

### ⚙️ Configuración

7. **`package.json` (actualizado)**
   - Scripts npm para facilitar uso:
     - `npm run setup-supabase`
     - `npm run test-connection`
     - `npm run migrate`
   - Dependencias agregadas (pg)

8. **`README.md` (actualizado)**
   - Sección de Supabase agregada
   - Opción 1: Supabase (Recomendado)
   - Opción 2: Docker (Local)
   - Referencias a las guías

## 🚀 Cómo Usar

### Método 1: Automático (Recomendado)

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Ejecutar setup interactivo
npm run setup-supabase

# 3. Verificar conexión
npm run test-connection

# 4. Iniciar backend
cd backend && npm install && npm start

# 5. Iniciar frontend (en otra terminal)
cd frontend && npm install && npm start
```

### Método 2: Manual

#### Paso 1: Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda las credenciales

#### Paso 2: Configurar variables de entorno

**backend/.env:**
```env
NODE_ENV=development
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_SSL=true
JWT_SECRET=tu_jwt_secret_aqui
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

**frontend/.env:**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_BACKEND_URL=http://localhost:3001
```

#### Paso 3: Migrar base de datos

Opción A: Desde terminal
```bash
psql "postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres" \
  -f database/schema.sql
```

Opción B: Desde Supabase Dashboard
1. Abre SQL Editor en Supabase
2. Copia y pega `database/schema.sql`
3. Ejecuta

#### Paso 4: Verificar y arrancar
```bash
# Verificar conexión
node scripts/test-supabase-connection.js

# Iniciar backend
cd backend && npm start

# Iniciar frontend
cd frontend && npm start
```

## 📋 Checklist Pre-Despliegue

### Base de Datos
- [ ] Proyecto creado en Supabase
- [ ] Schema migrado correctamente
- [ ] Datos iniciales cargados (roles, perfiles)
- [ ] Usuario admin creado

### Backend
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (`npm install`)
- [ ] Conexión a Supabase verificada
- [ ] Servidor arranca sin errores
- [ ] Health check responde: `curl http://localhost:3001/health`

### Frontend
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (`npm install`)
- [ ] Build exitoso
- [ ] Login funciona
- [ ] Dashboard carga correctamente

### Seguridad
- [ ] JWT_SECRET es único y seguro
- [ ] DB_PASSWORD es fuerte
- [ ] CORS configurado correctamente
- [ ] SSL habilitado (DB_SSL=true)

## 🌐 Despliegue a Producción

### Backend → Railway

```bash
# 1. Crear proyecto en Railway
# 2. Conectar repositorio GitHub
# 3. Configurar root directory: backend
# 4. Agregar variables de entorno (usar valores de producción)
# 5. Deploy automático
```

Variables de entorno para producción:
```env
NODE_ENV=production
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_SSL=true
DB_PASSWORD=<password-produccion>
JWT_SECRET=<secreto-produccion>
FRONTEND_URL=https://tu-frontend.vercel.app
CORS_ORIGIN=https://tu-frontend.vercel.app
```

### Frontend → Vercel

```bash
# Desde la carpeta frontend
cd frontend
npm install -g vercel
vercel

# Configurar variables en Vercel Dashboard
REACT_APP_API_URL=https://tu-backend.railway.app
REACT_APP_BACKEND_URL=https://tu-backend.railway.app
```

## 🔧 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Setup | `npm run setup-supabase` | Configuración interactiva |
| Test | `npm run test-connection` | Probar conexión a Supabase |
| Migrate | `npm run migrate` | Migrar schema a Supabase |
| Backend Dev | `cd backend && npm start` | Iniciar backend (desarrollo) |
| Frontend Dev | `cd frontend && npm start` | Iniciar frontend (desarrollo) |
| Backend Prod | `cd backend && NODE_ENV=production npm start` | Iniciar backend (producción) |
| Frontend Build | `cd frontend && npm run build` | Build de producción |

## 📊 Arquitectura Final

```
┌─────────────────────┐
│  Vercel/Netlify     │  ← Frontend (React)
│  (Frontend)         │
└──────────┬──────────┘
           │
           │ HTTPS/REST API
           ▼
┌─────────────────────┐
│  Railway/Render     │  ← Backend (Node.js)
│  (Backend API)      │
└──────────┬──────────┘
           │
           │ PostgreSQL (SSL)
           ▼
┌─────────────────────┐
│  Supabase           │  ← Base de Datos
│  (PostgreSQL)       │
└─────────────────────┘
```

## 🆘 Solución de Problemas Comunes

### Error: "Cannot connect to database"
```bash
# Verificar credenciales
cat backend/.env

# Probar conexión
node scripts/test-supabase-connection.js

# Verificar que Supabase esté activo
# https://status.supabase.com/
```

### Error: "CORS policy blocked"
```javascript
// Verificar en backend/src/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Error: "JWT malformed"
```bash
# Regenerar JWT_SECRET
openssl rand -base64 32

# Actualizar en backend/.env
# Reiniciar backend
```

### Base de datos vacía
```bash
# Ejecutar schema
psql "postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres" \
  -f database/schema.sql

# Verificar tablas
node scripts/test-supabase-connection.js
```

## 📚 Recursos Adicionales

### Documentación
- [Guía Completa Supabase](./GUIA_SUPABASE.md)
- [Inicio Rápido](./INICIO_RAPIDO_SUPABASE.md)
- [Arquitectura](./ARQUITECTURA_SUPABASE.md)

### Enlaces Útiles
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)

### Comunidad
- [Supabase Discord](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

## ✅ Estado del Setup

- [x] Guías de documentación creadas
- [x] Scripts de configuración implementados
- [x] Scripts de migración listos
- [x] Tests de conexión disponibles
- [x] README actualizado
- [x] Package.json configurado
- [x] Diagramas de arquitectura
- [x] Troubleshooting documentado

## 🎉 ¡Todo Listo!

Tu proyecto ahora está completamente preparado para desplegarse en Supabase.

**Próximos pasos:**
1. Ejecuta `npm run setup-supabase`
2. Sigue [INICIO_RAPIDO_SUPABASE.md](./INICIO_RAPIDO_SUPABASE.md)
3. Despliega a producción siguiendo [GUIA_SUPABASE.md](./GUIA_SUPABASE.md)

**¿Necesitas ayuda?**
- Revisa [GUIA_SUPABASE.md](./GUIA_SUPABASE.md) sección "Solución de Problemas"
- Ejecuta `node scripts/test-supabase-connection.js` para diagnóstico
- Consulta los logs de tu aplicación

---

**¡Éxito con tu despliegue en Supabase!** 🚀

