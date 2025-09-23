# Sistema de Control de Acceso - Servidor Local

## Descripción
Sistema de control de acceso desarrollado para funcionar completamente en servidor local, sin dependencias de servicios en la nube.

## Características
- ✅ Autenticación JWT tradicional
- ✅ Base de datos PostgreSQL local
- ✅ API REST completa
- ✅ Frontend React con Material-UI
- ✅ Gestión de usuarios, residentes y visitas
- ✅ Sistema de enrolamiento
- ✅ Bitácora de accesos

## Requisitos del Sistema
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd ControlAcceso
```

### 2. Configurar Base de Datos
```bash
cd database
npm install
node init-db.js
```

### 3. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

### 4. Configurar Frontend
```bash
cd frontend
npm install
npm start
```

## Configuración

### Variables de Entorno (.env)
```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=controlacceso
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Uso

### Iniciar el Sistema
1. Iniciar PostgreSQL
2. Ejecutar `npm run dev` en el directorio backend
3. Ejecutar `npm start` en el directorio frontend
4. Acceder a http://localhost:3000

### Credenciales por Defecto
- Usuario: `admin`
- Contraseña: `admin123`

## Estructura del Proyecto
```
ControlAcceso/
├── backend/          # API Node.js/Express
├── frontend/         # Aplicación React
├── database/         # Scripts de base de datos
└── docs/            # Documentación
```

## APIs Disponibles
- `/api/auth/*` - Autenticación
- `/api/users/*` - Gestión de usuarios
- `/api/residentes/*` - Gestión de residentes
- `/api/visitas/*` - Gestión de visitas
- `/api/visitas-externas/*` - Visitas externas
- `/api/access/*` - Control de accesos
- `/api/enrolamiento/*` - Sistema de enrolamiento

## Desarrollo
```bash
# Backend en modo desarrollo
cd backend && npm run dev

# Frontend en modo desarrollo
cd frontend && npm start

# Ejecutar tests
cd backend && npm test
```

## Soporte
Para soporte técnico, revisar la documentación en `/docs/` o contactar al equipo de desarrollo.

