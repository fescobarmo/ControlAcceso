# 🐳 Guía de Docker Hub - ControlAcceso

Esta guía te ayudará a configurar y usar Docker Hub para compartir las imágenes de tu aplicación ControlAcceso.

## 📋 Configuración

### Información del Repositorio

- **Usuario:** `fescobarmo`
- **Repositorio:** `control_acceso`
- **Namespace:** `fescobarmo/control_acceso`
- **URL:** https://hub.docker.com/r/fescobarmo/control_acceso

### Imágenes Disponibles

- **Frontend:** `fescobarmo/control_acceso_frontend`
- **Backend:** `fescobarmo/control_acceso_backend`

## 🔐 Configuración Inicial

### 1. Crear Cuenta en Docker Hub

1. Ve a [hub.docker.com](https://hub.docker.com)
2. Crea una cuenta o inicia sesión
3. Verifica tu email

### 2. Crear Repositorio

1. Ve a tu dashboard de Docker Hub
2. Haz clic en "Create Repository"
3. Nombre: `control_acceso`
4. Descripción: "Sistema de Control de Acceso - Frontend y Backend"
5. Visibilidad: Público o Privado (según tus necesidades)

### 3. Login desde Terminal

```bash
# Iniciar sesión en Docker Hub
docker login

# Ingresa tu usuario y contraseña
Username: fescobarmo
Password: [tu-contraseña]
```

## 🚀 Comandos para Subir Imágenes

### Opción 1: Usando el Script de Build

```bash
# Build y push completo
./scripts/build.sh production push

# Con versión específica
./scripts/build.sh production push v1.0.0

# Solo etiquetar (sin subir)
./scripts/build.sh production tag
```

### Opción 2: Usando el Script de Deploy

```bash
# Deploy completo + push a Docker Hub
./scripts/deploy.sh production push

# Con versión específica
./scripts/deploy.sh production push v1.0.0
```

### Opción 3: Manual

```bash
# 1. Construir imágenes
docker-compose build

# 2. Etiquetar para Docker Hub
docker tag controlacceso_frontend:latest fescobarmo/control_acceso_frontend:latest
docker tag controlacceso_backend:latest fescobarmo/control_acceso_backend:latest

# 3. Subir imágenes
docker push fescobarmo/control_acceso_frontend:latest
docker push fescobarmo/control_acceso_backend:latest
```

## 🏷️ Sistema de Etiquetas

### Etiquetas Automáticas

Cada imagen se sube con múltiples etiquetas:

- `latest` - Última versión
- `production` - Versión de producción
- `development` - Versión de desarrollo
- `YYYYMMDD_HHMMSS` - Timestamp de build
- `v1.0.0` - Versión específica (si se proporciona)

### Ejemplo de Etiquetas

```bash
fescobarmo/control_acceso_frontend:latest
fescobarmo/control_acceso_frontend:production
fescobarmo/control_acceso_frontend:20250922_150000
fescobarmo/control_acceso_frontend:v1.0.0

fescobarmo/control_acceso_backend:latest
fescobarmo/control_acceso_backend:production
fescobarmo/control_acceso_backend:20250922_150000
fescobarmo/control_acceso_backend:v1.0.0
```

## 📥 Descargar y Usar Imágenes

### Para Otros Desarrolladores

```bash
# Descargar imágenes
docker pull fescobarmo/control_acceso_frontend:latest
docker pull fescobarmo/control_acceso_backend:latest

# Usar en docker-compose.yml
services:
  frontend:
    image: fescobarmo/control_acceso_frontend:latest
    ports:
      - "3000:80"
  
  backend:
    image: fescobarmo/control_acceso_backend:latest
    ports:
      - "3001:3001"
```

### Para Producción

```bash
# Usar versión específica
docker pull fescobarmo/control_acceso_frontend:v1.0.0
docker pull fescobarmo/control_acceso_backend:v1.0.0
```

## 🔄 Flujo de Trabajo Recomendado

### 1. Desarrollo Local

```bash
# Desarrollo normal
./scripts/deploy.sh development deploy
```

### 2. Build y Push

```bash
# Build y push a Docker Hub
./scripts/build.sh production push v1.0.0
```

### 3. Deploy en Producción

```bash
# En el servidor de producción
docker pull fescobarmo/control_acceso_frontend:v1.0.0
docker pull fescobarmo/control_acceso_backend:v1.0.0

# Usar las imágenes descargadas
docker-compose up -d
```

## 🛠️ Comandos Útiles

### Verificar Login

```bash
# Verificar que estás logueado
docker info | grep Username
```

### Listar Imágenes Locales

```bash
# Ver imágenes de ControlAcceso
docker images | grep control_acceso
```

### Listar Imágenes en Docker Hub

```bash
# Ver imágenes remotas
docker search fescobarmo/control_acceso
```

### Limpiar Imágenes

```bash
# Eliminar imágenes locales
docker rmi fescobarmo/control_acceso_frontend:latest
docker rmi fescobarmo/control_acceso_backend:latest

# Limpiar imágenes no utilizadas
docker image prune -a
```

## 📊 Monitoreo y Estadísticas

### Ver Estadísticas en Docker Hub

1. Ve a https://hub.docker.com/r/fescobarmo/control_acceso
2. Ve la sección "Tags" para ver todas las versiones
3. Revisa las estadísticas de descarga

### Logs de Push

```bash
# Ver logs detallados del push
docker push fescobarmo/control_acceso_frontend:latest --debug
```

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca subas secretos** en las imágenes
2. **Usa .dockerignore** para excluir archivos sensibles
3. **Rota las claves** regularmente
4. **Usa repositorios privados** para código sensible

### Configuración de Repositorio Privado

```bash
# Si cambias a repositorio privado
docker login
docker push fescobarmo/control_acceso_frontend:latest
```

## 🚨 Solución de Problemas

### Error de Autenticación

```bash
# Re-login
docker logout
docker login
```

### Error de Permisos

```bash
# Verificar que tienes permisos en el repositorio
# Contactar al administrador del repositorio
```

### Error de Espacio

```bash
# Limpiar espacio
docker system prune -a
docker volume prune
```

### Error de Red

```bash
# Verificar conexión
ping hub.docker.com

# Usar proxy si es necesario
docker login --username fescobarmo
```

## 📈 Automatización

### GitHub Actions (Opcional)

```yaml
# .github/workflows/docker-push.yml
name: Build and Push to Docker Hub

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push
        run: |
          ./scripts/build.sh production push ${{ github.ref_name }}
```

### CI/CD Pipeline

```bash
# En tu pipeline de CI/CD
./scripts/build.sh production push $BUILD_NUMBER
```

## 📞 Soporte

### Recursos

- **Docker Hub Docs:** https://docs.docker.com/docker-hub/
- **Docker CLI:** https://docs.docker.com/engine/reference/commandline/
- **Repositorio:** https://hub.docker.com/r/fescobarmo/control_acceso

### Comandos de Ayuda

```bash
# Ayuda del script de build
./scripts/build.sh help

# Ayuda del script de deploy
./scripts/deploy.sh help
```

---

## 🎯 Resumen

**¡Tu aplicación ControlAcceso está lista para ser compartida en Docker Hub!**

- ✅ **Repositorio configurado:** `fescobarmo/control_acceso`
- ✅ **Scripts actualizados** con funcionalidad de Docker Hub
- ✅ **Sistema de versionado** automático
- ✅ **Documentación completa** disponible

**¡Comparte tu aplicación con el mundo! 🌍**

