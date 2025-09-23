# 🚀 ControlAcceso - Configuración para GitHub

Este documento explica cómo configurar y desplegar el proyecto ControlAcceso usando GitHub con Docker.

## 📋 Prerrequisitos

- Cuenta de GitHub
- Docker Hub (opcional)
- Docker instalado localmente
- Git configurado

## 🔧 Configuración Inicial

### 1. Crear Repositorio en GitHub

```bash
# Crear un nuevo repositorio en GitHub (no inicializar con README)
# Luego ejecutar:

git init
git add .
git commit -m "Initial commit: ControlAcceso system"
git branch -M main
git remote add origin https://github.com/tu-usuario/ControlAcceso.git
git push -u origin main
```

### 2. Configurar Secrets en GitHub

Ve a **Settings > Secrets and variables > Actions** en tu repositorio y agrega:

#### Secrets necesarios:
- `DOCKERHUB_USERNAME`: Tu nombre de usuario de Docker Hub
- `DOCKERHUB_TOKEN`: Token de acceso de Docker Hub
- `SLACK_WEBHOOK_URL`: (Opcional) URL del webhook de Slack para notificaciones

#### Variables de entorno (opcional):
- `DOCKERHUB_NAMESPACE`: Namespace de Docker Hub (por defecto: tu-usuario)

### 3. Configurar Variables de Versión

El archivo `VERSION` controla las versiones de todos los componentes:

```bash
# Ejemplo de contenido del archivo VERSION
SYSTEM_VERSION=1.0.0
BACKEND_VERSION=1.0.0
FRONTEND_VERSION=1.0.0
DATABASE_VERSION=1.0.0
NODE_VERSION=18-alpine
POSTGRES_VERSION=15-alpine
NGINX_VERSION=1.25-alpine
```

## 🐳 Gestión de Versiones Docker

### Script de Gestión de Versiones

Usa el script `scripts/version-manager.sh` para gestionar versiones:

```bash
# Hacer ejecutable
chmod +x scripts/version-manager.sh

# Mostrar versiones actuales
./scripts/version-manager.sh show

# Actualizar versión de un componente
./scripts/version-manager.sh update backend 1.1.0

# Construir todas las imágenes
./scripts/version-manager.sh build production

# Generar docker-compose con versiones específicas
./scripts/version-manager.sh generate production docker-compose.prod.yml
```

## 🔄 Flujo de CI/CD

### 1. Desarrollo

```bash
# Crear rama de desarrollo
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "feat: nueva funcionalidad"

# Push a la rama
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
```

### 2. Testing Automático

GitHub Actions ejecutará automáticamente:
- ✅ Build de imágenes Docker
- ✅ Escaneo de seguridad con Trivy
- ✅ Tests (si están configurados)
- ✅ Push a GitHub Container Registry

### 3. Despliegue a Staging

Al hacer merge a `develop`:
- 🚀 Despliegue automático a entorno de staging
- 📊 Notificaciones a equipos

### 4. Despliegue a Producción

Para desplegar a producción:

```bash
# Crear tag de versión
git tag v1.0.0
git push origin v1.0.0

# Esto activará:
# - Build de imágenes con la nueva versión
# - Push a Docker Hub
# - Despliegue a producción
# - Creación de release en GitHub
```

## 📦 Imágenes Docker Disponibles

### GitHub Container Registry
```
ghcr.io/tu-usuario/controlacceso-backend:latest
ghcr.io/tu-usuario/controlacceso-frontend:latest
ghcr.io/tu-usuario/controlacceso-database:latest
```

### Docker Hub (si está configurado)
```
tu-usuario/controlacceso-backend:latest
tu-usuario/controlacceso-frontend:latest
tu-usuario/controlacceso-database:latest
```

## 🚀 Despliegue en Producción

### Opción 1: Docker Compose

```bash
# Clonar repositorio en servidor
git clone https://github.com/tu-usuario/ControlAcceso.git
cd ControlAcceso

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus valores

# Desplegar usando las imágenes de Docker Hub
docker-compose -f docker-compose.production.yml up -d
```

### Opción 2: Docker Hub

```bash
# Usar las imágenes pre-construidas
docker pull tu-usuario/controlacceso-backend:latest
docker pull tu-usuario/controlacceso-frontend:latest
docker pull tu-usuario/controlacceso-database:latest

# Ejecutar con docker-compose
docker-compose -f docker-compose.production.yml up -d
```

### Opción 3: Kubernetes

```yaml
# Ejemplo de deployment para Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: controlacceso-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: controlacceso-backend
  template:
    metadata:
      labels:
        app: controlacceso-backend
    spec:
      containers:
      - name: backend
        image: tu-usuario/controlacceso-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DB_HOST
          value: "postgres-service"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
```

## 🔍 Monitoreo y Logs

### Health Checks

```bash
# Verificar estado de los servicios
curl http://localhost:3001/health  # Backend
curl http://localhost/3000/health  # Frontend

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Métricas

```bash
# Estadísticas de contenedores
docker stats

# Uso de recursos
docker system df
```

## 🔧 Mantenimiento

### Actualización de Versiones

```bash
# Actualizar versión de un componente
./scripts/version-manager.sh update backend 1.2.0

# Commit y push
git add VERSION
git commit -m "chore: update backend to v1.2.0"
git push

# Crear tag para release
git tag v1.2.0
git push origin v1.2.0
```

### Limpieza

```bash
# Limpiar imágenes no utilizadas
./scripts/version-manager.sh cleanup

# Limpiar contenedores parados
docker container prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f
```

## 🆘 Solución de Problemas

### Error de Autenticación Docker Hub

```bash
# Verificar credenciales
docker login

# Verificar secrets en GitHub
# Settings > Secrets and variables > Actions
```

### Error de Build

```bash
# Verificar logs de GitHub Actions
# Ir a Actions tab en GitHub

# Construir localmente para debug
docker build -t test-backend ./backend
```

### Error de Despliegue

```bash
# Verificar variables de entorno
docker-compose config

# Verificar conectividad de red
docker network ls
docker network inspect controlacceso-network-prod
```

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

- **Issues**: Crear issue en GitHub
- **Documentación**: Revisar carpeta `docs/`
- **Email**: [tu-email@dominio.com]

---

**¡ControlAcceso listo para producción con Docker y GitHub! 🚀**
