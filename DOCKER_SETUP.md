# 🐳 Configuración Docker para ControlAcceso

Esta guía te ayudará a configurar y ejecutar el sistema ControlAcceso usando Docker.

## 📋 Prerrequisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar las variables según tu entorno
nano .env
```

### 2. Crear Directorio de Datos

```bash
# Crear directorio para datos persistentes de PostgreSQL
mkdir -p data/postgres
```

### 3. Construir y Ejecutar

```bash
# Construir todas las imágenes
docker-compose build

# Ejecutar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 4. Verificar el Estado

```bash
# Verificar que todos los servicios estén funcionando
docker-compose ps

# Verificar health checks
docker-compose exec backend curl http://localhost:3001/health
docker-compose exec frontend curl http://localhost/health
```

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Base de Datos**: localhost:5432

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend

# Ver logs de un servicio
docker-compose logs -f backend
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec database psql -U postgres -d controlacceso

# Hacer backup de la base de datos
docker-compose exec database pg_dump -U postgres controlacceso > backup.sql

# Restaurar backup
docker-compose exec -T database psql -U postgres -d controlacceso < backup.sql
```

### Desarrollo

```bash
# Reconstruir solo el backend
docker-compose build backend

# Ejecutar comandos en el contenedor
docker-compose exec backend npm test
docker-compose exec frontend npm run build
```

## 🛠️ Configuración Avanzada

### Variables de Entorno Importantes

```bash
# Base de datos
DB_NAME=controlacceso
DB_USER=postgres
DB_PASSWORD=postgres123

# Seguridad
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# URLs
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:3001
```

### Personalización de Puertos

Si necesitas cambiar los puertos, modifica el archivo `.env`:

```bash
FRONTEND_PORT=8080
BACKEND_PORT=8081
DB_PORT=5433
```

## 🔒 Consideraciones de Seguridad

1. **Cambiar contraseñas por defecto** en producción
2. **Usar secretos seguros** para JWT y sesiones
3. **Configurar HTTPS** en producción
4. **Limitar acceso a la base de datos** desde el exterior
5. **Usar un gestor de secretos** como Docker Secrets o HashiCorp Vault

## 📊 Monitoreo

### Health Checks

Los servicios incluyen health checks automáticos:

- **Backend**: `GET /health`
- **Frontend**: `GET /health`
- **Database**: `pg_isready`

### Logs

```bash
# Ver todos los logs
docker-compose logs

# Logs de un servicio específico
docker-compose logs backend

# Seguir logs en tiempo real
docker-compose logs -f --tail=100
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Puerto ya en uso**:
   ```bash
   # Cambiar puerto en .env o detener servicio que lo usa
   lsof -i :3000
   ```

2. **Error de permisos en datos**:
   ```bash
   # Ajustar permisos del directorio de datos
   sudo chown -R $USER:$USER data/
   ```

3. **Contenedor no inicia**:
   ```bash
   # Ver logs detallados
   docker-compose logs backend
   ```

### Limpiar Todo

```bash
# Detener y eliminar contenedores, redes y volúmenes
docker-compose down -v

# Eliminar imágenes construidas
docker-compose down --rmi all

# Limpiar sistema Docker (¡CUIDADO!)
docker system prune -a
```

## 📈 Escalabilidad

Para entornos de producción, considera:

1. **Usar Docker Swarm o Kubernetes**
2. **Configurar load balancer**
3. **Usar base de datos externa**
4. **Implementar CI/CD**
5. **Configurar monitoreo con Prometheus/Grafana**

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la configuración: `docker-compose config`
3. Consulta la documentación de Docker
4. Revisa los issues del proyecto

---

**¡Disfruta usando ControlAcceso con Docker! 🎉**
