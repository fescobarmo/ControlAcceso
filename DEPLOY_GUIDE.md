# 🚀 Guía Completa de Deploy - ControlAcceso

Esta guía te llevará paso a paso a través del proceso completo de compilación, publicación y despliegue de la aplicación ControlAcceso usando Docker.

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Proceso de Build](#proceso-de-build)
4. [Deploy en Desarrollo](#deploy-en-desarrollo)
5. [Deploy en Producción](#deploy-en-producción)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
7. [Solución de Problemas](#solución-de-problemas)

## 🔧 Prerrequisitos

### Software Requerido

```bash
# Docker Engine 20.10+
docker --version

# Docker Compose 2.0+
docker-compose --version

# Git
git --version

# Node.js 18+ (opcional, para builds locales)
node --version
npm --version
```

### Verificar Instalación

```bash
# Verificar que Docker esté corriendo
docker info

# Verificar que Docker Compose funcione
docker-compose version
```

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd ControlAcceso
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables según tu entorno
nano .env
```

### 3. Crear Directorios Necesarios

```bash
# Crear directorios para datos persistentes
mkdir -p data/postgres
mkdir -p logs
mkdir -p uploads
mkdir -p nginx/ssl

# Ajustar permisos
chmod 755 data/postgres logs uploads
```

### 4. Hacer Scripts Ejecutables

```bash
chmod +x scripts/*.sh
```

## 🔨 Proceso de Build

### Build Completo (Recomendado)

```bash
# Build completo para producción
./scripts/build.sh production

# Build para desarrollo
./scripts/build.sh development
```

### Builds Específicos

```bash
# Solo build con Docker
./scripts/build.sh production docker

# Solo build local (sin Docker)
./scripts/build.sh production local

# Crear archivo de distribución
./scripts/build.sh production dist

# Verificar build existente
./scripts/build.sh verify
```

### Build Manual con Docker

```bash
# Construir todas las imágenes
docker-compose build --no-cache --parallel

# Construir imagen específica
docker-compose build backend
docker-compose build frontend
```

## 🚀 Deploy en Desarrollo

### Deploy Rápido

```bash
# Deploy completo en desarrollo
./scripts/deploy.sh development deploy

# Deploy rápido (sin rebuild)
./scripts/deploy.sh development quick
```

### Deploy Manual

```bash
# 1. Construir imágenes
docker-compose build

# 2. Iniciar servicios
docker-compose up -d

# 3. Verificar estado
docker-compose ps

# 4. Ver logs
docker-compose logs -f
```

### Verificar Deploy

```bash
# Verificar health checks
./scripts/deploy.sh health

# Ver estado de servicios
./scripts/deploy.sh status

# Ver logs en tiempo real
./scripts/deploy.sh logs
```

## 🌐 Deploy en Producción

### 1. Preparar Entorno de Producción

```bash
# Configurar variables de producción
cp env.example .env.prod
nano .env.prod

# Configurar SSL (opcional)
# Colocar certificados en nginx/ssl/
# - cert.pem (certificado)
# - key.pem (clave privada)
```

### 2. Deploy con Configuración de Producción

```bash
# Deploy completo en producción
./scripts/deploy.sh production deploy

# O usar configuración específica de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Configuración de Producción Avanzada

```bash
# Con reverse proxy y SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Con recursos limitados
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=2
```

### 4. Verificar Deploy de Producción

```bash
# Verificar todos los servicios
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Verificar health checks
curl https://tu-dominio.com/health
curl https://tu-dominio.com/api/health

# Verificar logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

## 📊 Monitoreo y Mantenimiento

### Comandos de Monitoreo

```bash
# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Verificar health checks
docker-compose exec backend curl http://localhost:3001/health
docker-compose exec frontend curl http://localhost/health
```

### Backup y Restauración

```bash
# Backup de base de datos
docker-compose exec database pg_dump -U postgres controlacceso > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T database psql -U postgres -d controlacceso < backup.sql

# Backup de volúmenes
docker run --rm -v controlacceso_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Actualizaciones

```bash
# Actualizar aplicación
git pull
./scripts/build.sh production
./scripts/deploy.sh production deploy

# Actualizar solo un servicio
docker-compose build backend
docker-compose up -d backend

# Rollback
docker-compose down
docker-compose up -d
```

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
./scripts/deploy.sh start

# Detener servicios
./scripts/deploy.sh stop

# Reiniciar servicios
./scripts/deploy.sh restart

# Limpiar todo
./scripts/deploy.sh cleanup
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec database psql -U postgres -d controlacceso

# Ejecutar migraciones
docker-compose exec backend npm run migrate

# Ver logs de base de datos
docker-compose logs database
```

### Desarrollo

```bash
# Ejecutar tests
docker-compose exec backend npm test
docker-compose exec frontend npm test

# Acceder al contenedor
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Puerto ya en uso

```bash
# Verificar qué proceso usa el puerto
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Cambiar puerto en .env
FRONTEND_PORT=8080
BACKEND_PORT=8081
DB_PORT=5433
```

#### 2. Error de permisos

```bash
# Ajustar permisos
sudo chown -R $USER:$USER data/
sudo chown -R $USER:$USER logs/
sudo chown -R $USER:$USER uploads/
```

#### 3. Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Verificar configuración
docker-compose config

# Reconstruir imagen
docker-compose build --no-cache backend
```

#### 4. Error de conexión a base de datos

```bash
# Verificar que la base de datos esté corriendo
docker-compose ps database

# Verificar logs de base de datos
docker-compose logs database

# Reiniciar base de datos
docker-compose restart database
```

### Comandos de Diagnóstico

```bash
# Verificar configuración de Docker Compose
docker-compose config

# Verificar imágenes
docker images | grep controlacceso

# Verificar volúmenes
docker volume ls | grep controlacceso

# Verificar redes
docker network ls | grep controlacceso

# Limpiar sistema Docker
docker system prune -a
```

### Logs y Debugging

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ver logs con timestamps
docker-compose logs -t

# Ver últimas 100 líneas
docker-compose logs --tail=100

# Debug de contenedor
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 📈 Optimizaciones de Producción

### 1. Configuración de Recursos

```yaml
# En docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### 2. Configuración de Logs

```yaml
# Rotación de logs
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. Configuración de Red

```yaml
# Red personalizada
networks:
  controlacceso-network-prod:
    driver: bridge
    ipam:
      config:
        - subnet: 172.21.0.0/16
```

## 🔒 Consideraciones de Seguridad

### 1. Variables de Entorno

- ✅ Cambiar todas las contraseñas por defecto
- ✅ Usar secretos seguros para JWT
- ✅ Configurar HTTPS en producción
- ✅ Limitar acceso a la base de datos

### 2. Configuración de Red

- ✅ Usar redes aisladas
- ✅ Exponer solo puertos necesarios
- ✅ Configurar firewall

### 3. Monitoreo

- ✅ Configurar alertas de health checks
- ✅ Monitorear logs de seguridad
- ✅ Implementar rate limiting

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs**: `docker-compose logs`
2. **Verifica la configuración**: `docker-compose config`
3. **Consulta la documentación**: `DOCKER_SETUP.md`
4. **Revisa los issues del proyecto**

---

**¡Tu aplicación ControlAcceso está lista para producción! 🎉**
