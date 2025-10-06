# 🚀 Estrategia Híbrida de Despliegue: Docker + Serverless

## 🎯 Objetivo

Migrar gradualmente de infraestructura Docker a Serverless (Vercel + Supabase) manteniendo:
- ✅ Zero downtime
- ✅ Infraestructura actual funcionando
- ✅ Costos $0 inicial (free tiers)
- ✅ Rollback instantáneo si hay problemas
- ✅ Transición gradual controlada

---

## 📊 Arquitectura de Transición

```
FASE 1: ACTUAL (Docker)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │───▶│   Backend   │───▶│  PostgreSQL │
│   Docker    │    │   Docker    │    │   Docker    │
│   :3000     │    │   :3001     │    │   :5432     │
└─────────────┘    └─────────────┘    └─────────────┘
      ↓
   usuarios


FASE 2: PARALELO (Hybrid)
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer / Router               │
└──────────────┬────────────────────────┬─────────────────┘
               │                        │
       ┌───────▼────────┐      ┌───────▼────────┐
       │  Docker Stack  │      │  Serverless    │
       │  (Actual)      │      │  (Nuevo)       │
       └────────────────┘      └────────────────┘
               │                        │
       ┌───────▼────────┐      ┌───────▼────────┐
       │  PostgreSQL    │◀────▶│   Supabase     │
       │   Docker       │ sync │   Cloud        │
       └────────────────┘      └────────────────┘


FASE 3: MIGRADO (Serverless)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │───▶│   Backend   │───▶│  Supabase   │
│   Vercel    │    │   Vercel    │    │   Cloud     │
│  (Static)   │    │ (Functions) │    │ (Postgres)  │
└─────────────┘    └─────────────┘    └─────────────┘
      ↓
   usuarios
```

---

## 🗺️ Roadmap de Migración (6 Fases)

### **Fase 0: Preparación** (Día 1-2) ⏱️ 4 horas
- [x] ✅ Ya completado: Schema de Supabase listo
- [x] ✅ Ya completado: Storage service implementado
- [x] ✅ Ya completado: Documentación creada
- [ ] Crear proyecto en Supabase
- [ ] Configurar DNS y dominios

### **Fase 1: Supabase Database** (Día 3-5) ⏱️ 6 horas
- [ ] Ejecutar schema en Supabase
- [ ] Migrar datos existentes (opcional)
- [ ] Configurar replicación bidireccional (temporal)
- [ ] Backend: Soportar dual-database (Docker + Supabase)
- [ ] Testing exhaustivo

### **Fase 2: Frontend en Vercel** (Día 6-8) ⏱️ 4 horas
- [ ] Desplegar frontend en Vercel
- [ ] Configurar variables de entorno
- [ ] Apuntar a backend Docker (aún)
- [ ] Testing de UI/UX
- [ ] Configurar dominio custom

### **Fase 3: Backend en Vercel Functions** (Día 9-12) ⏱️ 8 horas
- [ ] Adaptar rutas Express a Vercel Functions
- [ ] Configurar conexión a Supabase
- [ ] Desplegar API en Vercel
- [ ] Testing de endpoints
- [ ] Configurar rate limiting

### **Fase 4: Ruteo Híbrido** (Día 13-15) ⏱️ 6 horas
- [ ] Configurar load balancer (Cloudflare/Nginx)
- [ ] 20% tráfico → Serverless
- [ ] 80% tráfico → Docker
- [ ] Monitoreo intensivo
- [ ] Ajustar según métricas

### **Fase 5: Migración Completa** (Día 16-20) ⏱️ 4 horas
- [ ] Incrementar tráfico serverless gradualmente
- [ ] 100% tráfico → Serverless
- [ ] Mantener Docker como backup 1 semana
- [ ] Desactivar Docker si todo OK
- [ ] Celebrar 🎉

---

## 📝 Fase 1: Dual Database Setup

### 1.1. Crear Proyecto en Supabase

```bash
# Ya tienes esto listo
# Solo necesitas:
# 1. Ir a https://supabase.com
# 2. Crear proyecto "controlacceso"
# 3. Obtener credenciales
```

### 1.2. Ejecutar Schema

```bash
# Copiar schema corregido
cat database/supabase-schema.sql | pbcopy

# Ejecutar en Supabase SQL Editor
# https://app.supabase.com → SQL Editor
```

### 1.3. Configurar Backend para Dual-Database

Crear `backend/src/config/database-hybrid.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración Docker (actual)
const sequelizeDocker = new Sequelize(
  process.env.DB_NAME || 'control_acc_DB',
  process.env.DB_USER || 'admin',
  process.env.DB_PASSWORD || 'password123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

// Configuración Supabase (nuevo)
const sequelizeSupabase = process.env.SUPABASE_DB_HOST ? new Sequelize(
  process.env.SUPABASE_DB_NAME || 'postgres',
  process.env.SUPABASE_DB_USER || 'postgres',
  process.env.SUPABASE_DB_PASSWORD,
  {
    host: process.env.SUPABASE_DB_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
) : null;

// Selector inteligente
const getConnection = () => {
  const mode = process.env.DB_MODE || 'docker'; // 'docker' | 'supabase' | 'both'
  
  if (mode === 'supabase' && sequelizeSupabase) {
    return sequelizeSupabase;
  }
  
  return sequelizeDocker;
};

// Escritura dual (temporal)
const dualWrite = async (operation, ...args) => {
  const results = [];
  
  // Escribir en Docker (primary)
  try {
    const dockerResult = await operation(sequelizeDocker, ...args);
    results.push({ source: 'docker', success: true, data: dockerResult });
  } catch (error) {
    results.push({ source: 'docker', success: false, error: error.message });
  }
  
  // Escribir en Supabase (shadow)
  if (sequelizeSupabase && process.env.DB_MODE === 'both') {
    try {
      const supabaseResult = await operation(sequelizeSupabase, ...args);
      results.push({ source: 'supabase', success: true, data: supabaseResult });
    } catch (error) {
      results.push({ source: 'supabase', success: false, error: error.message });
      // No fallar si Supabase falla (es shadow)
      console.warn('Supabase shadow write failed:', error.message);
    }
  }
  
  return results;
};

module.exports = {
  sequelizeDocker,
  sequelizeSupabase,
  sequelize: getConnection(),
  getConnection,
  dualWrite
};
```

### 1.4. Configurar Variables de Entorno

`backend/.env`:

```env
# Modo de operación: docker | supabase | both
DB_MODE=both

# Docker Database (actual)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=control_acc_DB
DB_USER=admin
DB_PASSWORD=password123

# Supabase Database (nuevo)
SUPABASE_DB_HOST=db.xxxxxxxxxxxx.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu_password_supabase
```

### 1.5. Testing Dual-Write

```javascript
// backend/test/test-dual-write.js
const { dualWrite, sequelizeDocker, sequelizeSupabase } = require('../src/config/database-hybrid');

async function testDualWrite() {
  console.log('Testing dual-write...');
  
  const testOperation = async (sequelize) => {
    const [results] = await sequelize.query(
      "INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES ('test_key', 'test_value', 'Test entry') RETURNING *"
    );
    return results[0];
  };
  
  const results = await dualWrite(testOperation);
  console.log('Results:', JSON.stringify(results, null, 2));
  
  // Cleanup
  if (sequelizeDocker) {
    await sequelizeDocker.query("DELETE FROM configuracion_sistema WHERE clave = 'test_key'");
  }
  if (sequelizeSupabase) {
    await sequelizeSupabase.query("DELETE FROM configuracion_sistema WHERE clave = 'test_key'");
  }
}

testDualWrite().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
```

---

## 🎨 Fase 2: Frontend en Vercel

### 2.1. Preparar Frontend para Vercel

Crear `vercel.json` en la raíz de `frontend/`:

```json
{
  "version": 2,
  "name": "controlacceso-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api_url",
    "REACT_APP_BACKEND_URL": "@backend_url"
  }
}
```

### 2.2. Actualizar package.json

`frontend/package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "vercel-build": "npm run build",
    "test": "react-scripts test"
  }
}
```

### 2.3. Desplegar a Vercel

```bash
cd frontend

# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (primera vez)
vercel

# Deploy a producción
vercel --prod
```

### 2.4. Configurar Variables de Entorno en Vercel

```bash
# Via CLI
vercel env add REACT_APP_API_URL production

# O en el dashboard:
# https://vercel.com/tu-usuario/controlacceso-frontend
# Settings → Environment Variables
```

Valores:
```
REACT_APP_API_URL = http://tu-servidor-docker:3001
# O cuando migres el backend:
REACT_APP_API_URL = https://controlacceso-api.vercel.app
```

---

## ⚡ Fase 3: Backend en Vercel Functions

### 3.1. Estructura para Vercel Functions

```
backend/
├── api/                      # Vercel Functions
│   ├── auth/
│   │   └── login.js         # /api/auth/login
│   ├── users/
│   │   ├── index.js         # /api/users
│   │   └── [id].js          # /api/users/:id
│   ├── health.js            # /api/health
│   └── [...all].js          # Catch-all (legacy routes)
├── src/                      # Código compartido
│   ├── config/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── vercel.json
└── package.json
```

### 3.2. Crear vercel.json para Backend

`backend/vercel.json`:

```json
{
  "version": 2,
  "name": "controlacceso-backend",
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/health",
      "dest": "/api/health"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "DB_HOST": "@db_host",
    "DB_PASSWORD": "@db_password",
    "JWT_SECRET": "@jwt_secret"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### 3.3. Adaptar Rutas a Vercel Functions

Ejemplo: `backend/api/auth/login.js`:

```javascript
// Vercel Function para /api/auth/login
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../src/config/database-hybrid');

// Handler para Vercel
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password requeridos' });
    }

    // Buscar usuario (usando Sequelize con Supabase)
    const [users] = await sequelize.query(
      `SELECT u.*, r.nombre as rol_nombre, p.nombre as perfil_nombre
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       JOIN perfiles p ON u.perfil_id = p.id
       WHERE u.username = :username AND u.is_active = true`,
      {
        replacements: { username },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const usuario = users[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        rol_id: usuario.rol_id,
        perfil_id: usuario.perfil_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Actualizar último acceso
    await sequelize.query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = :id',
      { replacements: { id: usuario.id } }
    );

    res.status(200).json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol_nombre,
        perfil: usuario.perfil_nombre
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
```

### 3.4. Catch-All para Rutas Legacy

`backend/api/[...all].js`:

```javascript
// Catch-all para mantener compatibilidad con rutas antiguas
const express = require('express');
const app = express();

// Import todas tus rutas Express existentes
const authRoutes = require('../src/routes/auth');
const userRoutes = require('../src/routes/users');
// ... etc

// Middleware
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// ... etc

// Export para Vercel
module.exports = app;
```

### 3.5. Desplegar Backend a Vercel

```bash
cd backend

# Deploy
vercel

# Variables de entorno (en Vercel dashboard)
# - DB_HOST
# - DB_PASSWORD
# - JWT_SECRET
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY

# Deploy a producción
vercel --prod
```

---

## 🔀 Fase 4: Ruteo Híbrido con Cloudflare

### 4.1. Configurar Cloudflare Workers

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Porcentaje de tráfico a serverless (empezar con 20%)
  const serverlessPercent = 20
  const random = Math.random() * 100
  
  // Decidir destino
  const useServerless = random < serverlessPercent
  
  // URLs de destino
  const dockerBackend = 'https://docker.tu-dominio.com'
  const vercelBackend = 'https://controlacceso-api.vercel.app'
  
  const targetUrl = useServerless ? vercelBackend : dockerBackend
  
  // Reescribir URL
  const targetPath = url.pathname + url.search
  const finalUrl = targetUrl + targetPath
  
  // Headers para debugging
  const headers = new Headers(request.headers)
  headers.set('X-Routed-To', useServerless ? 'serverless' : 'docker')
  
  // Proxy request
  const response = await fetch(finalUrl, {
    method: request.method,
    headers: headers,
    body: request.body
  })
  
  // Clone response y agregar header
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('X-Routed-To', useServerless ? 'serverless' : 'docker')
  
  return newResponse
}
```

### 4.2. Alternativa: Nginx Load Balancer

`nginx/load-balancer.conf`:

```nginx
upstream backend {
    # 80% a Docker
    server docker-backend:3001 weight=8;
    # 20% a Vercel
    server controlacceso-api.vercel.app:443 weight=2;
}

server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Header para debugging
        add_header X-Backend-Server $upstream_addr always;
    }
    
    # Health checks
    location /health {
        proxy_pass http://backend/health;
    }
}
```

---

## 📊 Fase 5: Monitoreo y Métricas

### 5.1. Dashboard de Métricas

Crear `monitoring/metrics-dashboard.js`:

```javascript
const axios = require('axios');

class MetricsCollector {
  constructor() {
    this.metrics = {
      docker: { requests: 0, errors: 0, latency: [] },
      vercel: { requests: 0, errors: 0, latency: [] }
    };
  }

  async checkEndpoint(url, backend) {
    const start = Date.now();
    
    try {
      const response = await axios.get(url);
      const latency = Date.now() - start;
      
      this.metrics[backend].requests++;
      this.metrics[backend].latency.push(latency);
      
      return {  success: true, latency, status: response.status };
    } catch (error) {
      this.metrics[backend].errors++;
      return { success: false, error: error.message };
    }
  }

  getStats() {
    const dockerAvgLatency = this.metrics.docker.latency.length > 0
      ? this.metrics.docker.latency.reduce((a, b) => a + b, 0) / this.metrics.docker.latency.length
      : 0;
    
    const vercelAvgLatency = this.metrics.vercel.latency.length > 0
      ? this.metrics.vercel.latency.reduce((a, b) => a + b, 0) / this.metrics.vercel.latency.length
      : 0;

    return {
      docker: {
        ...this.metrics.docker,
        avgLatency: dockerAvgLatency,
        errorRate: this.metrics.docker.requests > 0
          ? (this.metrics.docker.errors / this.metrics.docker.requests) * 100
          : 0
      },
      vercel: {
        ...this.metrics.vercel,
        avgLatency: vercelAvgLatency,
        errorRate: this.metrics.vercel.requests > 0
          ? (this.metrics.vercel.errors / this.metrics.vercel.requests) * 100
          : 0
      }
    };
  }

  printStats() {
    const stats = this.getStats();
    console.log('\n📊 METRICS DASHBOARD');
    console.log('====================\n');
    
    console.log('Docker Backend:');
    console.log(`  Requests: ${stats.docker.requests}`);
    console.log(`  Errors: ${stats.docker.errors} (${stats.docker.errorRate.toFixed(2)}%)`);
    console.log(`  Avg Latency: ${stats.docker.avgLatency.toFixed(0)}ms\n`);
    
    console.log('Vercel Backend:');
    console.log(`  Requests: ${stats.vercel.requests}`);
    console.log(`  Errors: ${stats.vercel.errors} (${stats.vercel.errorRate.toFixed(2)}%)`);
    console.log(`  Avg Latency: ${stats.vercel.avgLatency.toFixed(0)}ms\n`);
    
    // Recommendation
    if (stats.vercel.errorRate < 1 && stats.vercel.avgLatency < stats.docker.avgLatency * 1.5) {
      console.log('✅ Vercel performing well. Safe to increase traffic.');
    } else {
      console.log('⚠️  Monitor Vercel closely before increasing traffic.');
    }
  }
}

module.exports = MetricsCollector;
```

### 5.2. Script de Testing de Carga

`monitoring/load-test.js`:

```javascript
const MetricsCollector = require('./metrics-dashboard');

async function runLoadTest() {
  const collector = new MetricsCollector();
  const dockerUrl = 'http://localhost:3001/health';
  const vercelUrl = 'https://controlacceso-api.vercel.app/api/health';
  
  console.log('🧪 Starting load test...\n');
  
  // Run 100 requests to each
  for (let i = 0; i < 100; i++) {
    await Promise.all([
      collector.checkEndpoint(dockerUrl, 'docker'),
      collector.checkEndpoint(vercelUrl, 'vercel')
    ]);
    
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\rProgress: ${i + 1}/100`);
    }
  }
  
  console.log('\n');
  collector.printStats();
}

runLoadTest().catch(console.error);
```

---

## 💰 Análisis de Costos (Free Tiers)

### Free Tier Limits

**Vercel (Frontend + Backend)**
- ✅ 100 GB bandwidth/mes
- ✅ 100 GB-hours compute/mes
- ✅ Unlimited deployments
- ✅ SSL certificates included
- 💰 **Costo**: $0/mes

**Supabase (Database + Storage)**
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- 💰 **Costo**: $0/mes

**GitHub Actions (CI/CD)**
- ✅ 2,000 minutos/mes
- ✅ 500 MB storage
- 💰 **Costo**: $0/mes

**Total Mensual**: **$0** 🎉

### Cuando Escalar (Estimaciones)

```
Usuarios Activos | Tráfico/mes | Costo Estimado
-----------------|-------------|----------------
< 1,000          | < 10 GB     | $0 (free)
1,000 - 5,000    | 10-50 GB    | $0-20/mes
5,000 - 10,000   | 50-100 GB   | $20-50/mes
10,000+          | 100+ GB     | $50-200/mes
```

---

## ✅ Checklist de Migración

### Preparación
- [x] Schema de Supabase creado
- [x] Storage service implementado
- [x] Documentación lista
- [ ] Proyecto Supabase creado
- [ ] Dominio configurado

### Fase 1: Database
- [ ] Schema ejecutado en Supabase
- [ ] Dual-database configurado
- [ ] Testing de escritura dual
- [ ] Monitoreo activo

### Fase 2: Frontend
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] DNS apuntando a Vercel
- [ ] Testing UI/UX completo

### Fase 3: Backend
- [ ] Rutas adaptadas a Vercel Functions
- [ ] Backend desplegado en Vercel
- [ ] Endpoints testeados
- [ ] Rate limiting configurado

### Fase 4: Híbrido
- [ ] Load balancer configurado
- [ ] 20% tráfico a serverless
- [ ] Monitoreo de métricas
- [ ] Sin errores críticos

### Fase 5: Migración
- [ ] 100% tráfico a serverless
- [ ] Docker en standby (1 semana)
- [ ] Métricas estables
- [ ] Docker desactivado

---

## 🆘 Plan de Rollback

Si algo sale mal en cualquier fase:

```bash
# 1. Cambiar DNS/Load Balancer a 100% Docker
# 2. Revertir variables de entorno
# 3. Verificar que Docker funciona
# 4. Investigar el problema
# 5. Fix y retry
```

**Tiempo de rollback**: < 5 minutos

---

## 🎯 Siguiente Paso

¿Por dónde empezar?

```bash
# Opción 1: Crear proyecto Supabase y ejecutar schema
cat database/supabase-schema.sql | pbcopy

# Opción 2: Ver guía de inicio rápido
cat INICIO_RAPIDO_SUPABASE.md

# Opción 3: Desplegar frontend en Vercel
cd frontend && vercel
```

---

**Esta estrategia te da:**
- ✅ Zero downtime garantizado
- ✅ Rollback instantáneo
- ✅ Transición gradual
- ✅ Costo $0 inicial
- ✅ Monitoreo continuo

**¿Listo para empezar?** 🚀

