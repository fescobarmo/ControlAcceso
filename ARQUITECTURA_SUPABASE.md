# 🏗️ Arquitectura con Supabase

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                            │
│                      (Navegador Web)                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • React 18 + Material-UI                                │  │
│  │  • React Router (Navegación)                             │  │
│  │  • Axios (HTTP Client)                                   │  │
│  │  • Context API (Estado)                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Desplegado en: Vercel / Netlify / Amplify                      │
│  URL: https://controlacceso.vercel.app                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ REST API (HTTPS)
                     │ Authorization: Bearer <JWT>
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Express.js (Framework)                                │  │
│  │  • JWT (Autenticación)                                   │  │
│  │  • Bcrypt (Encriptación)                                 │  │
│  │  • Sequelize (ORM)                                       │  │
│  │  • Helmet + CORS (Seguridad)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Endpoints:                                                      │
│  • /api/auth/login                                              │
│  • /api/users                                                   │
│  • /api/roles                                                   │
│  • /api/visitas                                                 │
│  • /api/residentes                                              │
│  • /api/bitacora                                                │
│                                                                   │
│  Desplegado en: Railway / Render / Fly.io                       │
│  URL: https://controlacceso-api.railway.app                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ PostgreSQL Protocol (SSL)
                     │ Connection Pool
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15 (Base de Datos)                           │  │
│  │  • Esquema normalizado                                   │  │
│  │  • Triggers de auditoría                                 │  │
│  │  • Funciones PL/pgSQL                                    │  │
│  │  • Row Level Security (RLS)                              │  │
│  │  • Extensiones (uuid-ossp, pgcrypto)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Storage (Opcional)                                      │  │
│  │  • Fotos de perfil                                       │  │
│  │  • Documentos                                            │  │
│  │  • Archivos adjuntos                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Auth (Opcional - Alternativa a JWT)                     │  │
│  │  • Autenticación integrada                               │  │
│  │  • OAuth providers                                       │  │
│  │  • Magic links                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  URL: https://xxxxxxxxxxxx.supabase.co                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Autenticación
```
Usuario → Frontend → POST /api/auth/login
                          ↓
                     Backend valida
                          ↓
                     Consulta Supabase
                          ↓
                     Genera JWT Token
                          ↓
                     Frontend guarda token
```

### 2. Consulta de Datos
```
Usuario → Frontend (con JWT) → GET /api/users
                                     ↓
                                Backend valida JWT
                                     ↓
                                Sequelize ORM
                                     ↓
                                Supabase (PostgreSQL)
                                     ↓
                                Retorna datos
                                     ↓
                                Frontend renderiza
```

### 3. Registro de Eventos
```
Acción del usuario → Backend
                         ↓
                    Trigger SQL
                         ↓
                    Tabla auditoria
                         ↓
                    Supabase almacena
```

## 📦 Componentes del Sistema

### Frontend (React)
- **Ubicación**: `/frontend`
- **Tecnología**: React 18, Material-UI
- **Funciones**:
  - Interfaz de usuario
  - Validación de formularios
  - Gestión de estado (Context API)
  - Comunicación con API

### Backend (Node.js)
- **Ubicación**: `/backend`
- **Tecnología**: Express.js, Sequelize
- **Funciones**:
  - Lógica de negocio
  - Autenticación y autorización
  - Validación de datos
  - API RESTful

### Base de Datos (Supabase)
- **Tipo**: PostgreSQL 15
- **Funciones**:
  - Almacenamiento persistente
  - Integridad referencial
  - Auditoría automática
  - Backups automáticos

## 🔐 Seguridad

### Capas de Seguridad

1. **Frontend**
   - Validación de inputs
   - Sanitización de datos
   - HTTPOnly cookies
   - HTTPS obligatorio

2. **Backend**
   - JWT tokens
   - Bcrypt para passwords
   - Helmet.js (headers seguros)
   - CORS configurado
   - Rate limiting

3. **Base de Datos**
   - SSL/TLS encryption
   - Row Level Security (RLS)
   - Prepared statements (SQL injection)
   - Backups encriptados

## 🚀 Ventajas de Supabase

### vs PostgreSQL Local
| Aspecto | PostgreSQL Local | Supabase |
|---------|------------------|----------|
| **Setup** | Manual, complejo | Automático, 2 min |
| **Escalabilidad** | Manual | Automática |
| **Backups** | Configurar manualmente | Automáticos diarios |
| **Seguridad** | Configurar SSL/TLS | SSL incluido |
| **Costo** | Servidor propio | Gratis hasta 500MB |
| **Mantenimiento** | Tú lo haces | Supabase lo hace |
| **Monitoreo** | Configurar herramientas | Dashboard incluido |

### vs Firebase
| Aspecto | Firebase | Supabase |
|---------|----------|----------|
| **Base de datos** | NoSQL | PostgreSQL (SQL) |
| **Open Source** | No | Sí |
| **Queries** | Limitados | SQL completo |
| **Vendor Lock-in** | Alto | Bajo (puedes exportar) |
| **Pricing** | Caro a escala | Más económico |

## 📈 Escalabilidad

### Plan Gratuito (Free Tier)
- ✅ 500 MB de base de datos
- ✅ 1 GB de almacenamiento
- ✅ 50,000 usuarios autenticados
- ✅ 500 MB de ancho de banda
- ✅ Backups automáticos (7 días)

### Plan Pro ($25/mes)
- ✅ 8 GB de base de datos
- ✅ 100 GB de almacenamiento
- ✅ Usuarios ilimitados
- ✅ 250 GB de ancho de banda
- ✅ Backups automáticos (30 días)
- ✅ Soporte prioritario

### Escalado Horizontal
```
Load Balancer
      │
      ├─── Backend Instance 1 ─┐
      ├─── Backend Instance 2 ─┼─── Supabase
      └─── Backend Instance 3 ─┘
```

## 🔧 Configuración de Producción

### Variables de Entorno Críticas

**Backend:**
```env
NODE_ENV=production
DB_HOST=db.xxxx.supabase.co
DB_SSL=true
JWT_SECRET=<secreto-super-seguro>
```

**Frontend:**
```env
REACT_APP_API_URL=https://api.tudominio.com
```

### Optimizaciones

1. **Connection Pooling**
```javascript
pool: {
  max: 5,      // Máximo de conexiones
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

2. **Índices en Base de Datos**
```sql
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_logs_fecha ON logs_acceso(fecha_hora);
```

3. **Caché**
```javascript
// Redis para caché (opcional)
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});
```

## 📊 Monitoreo

### Métricas Clave

1. **Backend**
   - Response time
   - Error rate
   - Request rate
   - Memory usage

2. **Base de Datos**
   - Query performance
   - Connection count
   - Storage usage
   - Cache hit rate

3. **Frontend**
   - Page load time
   - Time to interactive
   - Bundle size

### Herramientas

- **Supabase Dashboard**: Monitoreo de DB
- **Railway Metrics**: Monitoreo de backend
- **Vercel Analytics**: Monitoreo de frontend
- **Sentry**: Error tracking (opcional)

## 🔄 CI/CD Pipeline

```
GitHub Push
    │
    ├─── Frontend (Vercel)
    │       └─→ Build → Deploy → Live
    │
    └─── Backend (Railway)
            └─→ Build → Test → Deploy → Live
```

### Automatización
1. Push a `main` → Deploy automático
2. Pull Request → Preview deployment
3. Tags `v*` → Release con changelog

## 📚 Recursos

- [Documentación Supabase](https://supabase.com/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Performance](https://react.dev/learn/render-and-commit)

---

**Arquitectura diseñada para**: Escalabilidad, Seguridad, Mantenibilidad

