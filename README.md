# 🚪 ControlAcceso - Sistema de Control de Acceso

Sistema moderno y escalable para gestión de accesos, usuarios y permisos con arquitectura de microservicios.

## 🏗️ Arquitectura del Sistema

### **Frontend (React 18)**
- **Tecnologías**: React 18, Material-UI, React Router, Axios
- **Características**: Diseño responsive, componentes reutilizables, navegación SPA
- **Puerto**: 3000

### **Backend (Node.js + Express)**
- **Tecnologías**: Node.js, Express, Sequelize ORM, JWT, bcryptjs
- **Características**: API RESTful, validación de datos, autenticación JWT
- **Puerto**: 3001

### **Base de Datos (PostgreSQL)**
- **Tecnologías**: PostgreSQL 15, Sequelize ORM
- **Características**: Esquema normalizado, triggers de auditoría, funciones PL/pgSQL
- **Puerto**: 5432

## 📋 Prerrequisitos

- **Node.js**: v18 o superior
- **npm**: v8 o superior
- **Base de Datos**: PostgreSQL v15+ o Supabase (recomendado)
- **Git**: Para clonar el repositorio

## 🚀 Instalación y Configuración

### 🌟 Opción 1: Despliegue con Supabase (Recomendado)

**¿Por qué Supabase?**
- ✅ Sin configuración de servidor
- ✅ Base de datos PostgreSQL gestionada
- ✅ SSL/TLS incluido
- ✅ Backups automáticos
- ✅ Escalado automático
- ✅ Plan gratuito generoso

**Inicio Rápido (15 minutos):**

```bash
# 1. Configurar Supabase
npm run setup-supabase

# 2. Migrar base de datos
npm run migrate

# 3. Verificar conexión
npm run test-connection

# 4. Iniciar aplicación
cd backend && npm start
cd frontend && npm start
```

📖 **Guía completa**: [INICIO_RAPIDO_SUPABASE.md](./INICIO_RAPIDO_SUPABASE.md)  
📖 **Guía detallada**: [GUIA_SUPABASE.md](./GUIA_SUPABASE.md)  
🏗️ **Arquitectura**: [ARQUITECTURA_SUPABASE.md](./ARQUITECTURA_SUPABASE.md)

### 🐳 Opción 2: Despliegue con Docker (Local)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/ControlAcceso.git
cd ControlAcceso
```

### 🐳 Despliegue con Docker (Recomendado)

#### Opción A: Desarrollo Local
```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Verificar que todo esté funcionando
docker-compose ps
```

#### Opción B: Producción
```bash
# Usar configuración de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# O usar imágenes pre-construidas de Docker Hub
docker-compose -f docker-compose.production.yml up -d
```

#### Gestión de Versiones Docker
```bash
# Ver versiones actuales
./scripts/version-manager.sh show

# Actualizar versión de un componente
./scripts/version-manager.sh update backend 1.1.0

# Construir imágenes con versiones específicas
./scripts/version-manager.sh build production
```

### 2. Configuración Manual (Sin Docker)

#### Configurar Base de Datos PostgreSQL
```bash
# Instalar PostgreSQL desde https://www.postgresql.org/download/
# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER admin WITH PASSWORD 'password123';
CREATE DATABASE control_acc_DB OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE control_acc_DB TO admin;
\q
```

#### Inicializar Base de Datos
```bash
cd database
npm install
node init-db.js
```

#### Configurar Backend
```bash
cd backend
npm install
```

**Configurar variables de entorno** (`.env`):
```env
NODE_ENV=development
PORT=3001
DB_NAME=control_acc_DB
DB_USER=admin
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432
DB_SSL=false
FRONTEND_URL=http://localhost:3000
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
```

#### Configurar Frontend
```bash
cd frontend
npm install
```

**Configurar variables de entorno** (`.env`):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 🏃‍♂️ Ejecutar la Aplicación

### 🐳 Con Docker (Recomendado)

```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verificar estado
docker-compose ps
curl http://localhost:3001/health
curl http://localhost:3000/health
```

### 📱 Sin Docker

#### 1. Iniciar Backend
```bash
cd backend
npm start
```

**Verificar funcionamiento**:
```bash
curl http://localhost:3001/health
```

#### 2. Iniciar Frontend
```bash
cd frontend
npm start
```

**Acceder a la aplicación**: http://localhost:3000

## 📊 Estructura de la Base de Datos

### **Tablas Principales**
- **`usuarios`**: Gestión de usuarios del sistema
- **`roles`**: Roles de usuario (admin, supervisor, usuario, etc.)
- **`perfiles`**: Perfiles con permisos específicos
- **`areas`**: Áreas/zones de acceso
- **`dispositivos`**: Dispositivos de control de acceso
- **`permisos_acceso`**: Permisos de usuarios por área
- **`logs_acceso`**: Registro de accesos y eventos
- **`sesiones`**: Gestión de sesiones de usuario
- **`auditoria`**: Log de cambios en el sistema

### **Características de Seguridad**
- **Encriptación**: Contraseñas hasheadas con bcrypt
- **Auditoría**: Triggers automáticos para tracking de cambios
- **Validación**: Constraints y validaciones a nivel de base de datos
- **Índices**: Optimización de consultas frecuentes

## 🔐 Funcionalidades del Sistema

### **Gestión de Usuarios**
- ✅ Crear, editar, eliminar usuarios
- ✅ Asignar roles y perfiles
- ✅ Gestión de estados (activo, inactivo, bloqueado)
- ✅ Búsqueda y filtrado avanzado
- ✅ Paginación de resultados

### **Control de Acceso**
- ✅ Definir áreas y dispositivos
- ✅ Configurar permisos por usuario/área
- ✅ Control de horarios y días de acceso
- ✅ Registro de eventos de acceso
- ✅ Monitoreo en tiempo real

### **Seguridad y Auditoría**
- ✅ Autenticación JWT
- ✅ Logs de auditoría automáticos
- ✅ Validación de datos
- ✅ Manejo seguro de contraseñas

## 🚀 GitHub y CI/CD

### Configuración para GitHub

Este proyecto está configurado para trabajar con GitHub Actions y Docker Hub:

#### 🔧 Configuración Inicial
```bash
# 1. Crear repositorio en GitHub
# 2. Configurar secrets en GitHub Settings > Secrets and variables > Actions:
#    - DOCKERHUB_USERNAME
#    - DOCKERHUB_TOKEN
#    - SLACK_WEBHOOK_URL (opcional)

# 3. Subir código
git init
git add .
git commit -m "Initial commit: ControlAcceso system"
git branch -M main
git remote add origin https://github.com/tu-usuario/ControlAcceso.git
git push -u origin main
```

#### 🔄 Flujo de CI/CD
- **Push a `main`**: Build automático y push a Docker Hub
- **Push a `develop`**: Despliegue a staging
- **Tag `v*`**: Release automático y despliegue a producción

#### 📦 Imágenes Docker Disponibles
```bash
# GitHub Container Registry
ghcr.io/tu-usuario/controlacceso-backend:latest
ghcr.io/tu-usuario/controlacceso-frontend:latest
ghcr.io/tu-usuario/controlacceso-database:latest

# Docker Hub
tu-usuario/controlacceso-backend:latest
tu-usuario/controlacceso-frontend:latest
tu-usuario/controlacceso-database:latest
```

#### 📋 Gestión de Versiones
```bash
# Ver versiones actuales
./scripts/version-manager.sh show

# Actualizar versión
./scripts/version-manager.sh update backend 1.1.0

# Crear release
git tag v1.1.0
git push origin v1.1.0
```

📖 **Ver documentación completa**: [GITHUB_SETUP.md](./GITHUB_SETUP.md)

## 🛠️ Desarrollo

### **Scripts Disponibles**
```bash
# Backend
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo con nodemon
npm test           # Ejecutar tests

# Frontend
npm start          # Iniciar aplicación React
npm run build      # Build de producción
npm test           # Ejecutar tests
npm run eject      # Eject de Create React App

# Base de Datos
node init-db.js    # Inicializar base de datos
```

### **Estructura de Archivos**
```
ControlAcceso/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   └── usuarios/
│   │   │       └── Usuarios.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/           # API Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── config/
│   │   └── index.js
│   └── package.json
├── database/          # Scripts de base de datos
│   ├── schema.sql
│   ├── init-db.js
│   └── package.json
└── docs/             # Documentación
```

## 🔧 Configuración Avanzada

### **Variables de Entorno Adicionales**
```env
# Base de Datos
DB_SSL=true                    # Para conexiones SSL
DB_POOL_MAX=10                # Máximo de conexiones en pool
DB_POOL_MIN=2                 # Mínimo de conexiones en pool

# JWT
JWT_REFRESH_SECRET=refresh_secret_aqui
JWT_REFRESH_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info                # debug, info, warn, error
LOG_FILE=logs/app.log         # Archivo de logs

# CORS
CORS_ORIGINS=http://localhost:3000,https://tu-dominio.com
```

### **Optimización de Base de Datos**
```sql
-- Crear índices adicionales según necesidades
CREATE INDEX CONCURRENTLY idx_usuarios_busqueda 
ON usuarios USING gin(to_tsvector('spanish', nombre || ' ' || apellido || ' ' || email));

-- Configurar particionado para logs grandes
CREATE TABLE logs_acceso_2024 PARTITION OF logs_acceso
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## 🚨 Solución de Problemas

### **Error de Conexión a Base de Datos**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales
psql -h localhost -U admin -d control_acc_DB

# Verificar puerto
netstat -an | grep 5432
```

### **Error de Dependencias**
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **Error de CORS**
```bash
# Verificar configuración en backend/src/index.js
# Verificar FRONTEND_URL en .env
# Verificar que el frontend esté corriendo en el puerto correcto
```

## 📈 Monitoreo y Logs

### **Health Check**
```bash
curl http://localhost:3001/health
```

### **Logs del Sistema**
```bash
# Backend logs
tail -f backend/logs/app.log

# Base de datos logs (PostgreSQL)
tail -f /var/log/postgresql/postgresql-15-main.log
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Issues**: Crear un issue en GitHub
- **Documentación**: Revisar la carpeta `docs/`
- **Email**: [tu-email@dominio.com]

---

**Desarrollado con ❤️ para sistemas de control de acceso modernos y seguros**
