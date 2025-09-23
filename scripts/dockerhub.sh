#!/bin/bash

# dockerhub.sh
# Script para gestionar imágenes en Docker Hub
# Uso: ./scripts/dockerhub.sh [action] [options]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ACTION=${1:-help}

# Configuración de Docker Hub
DOCKERHUB_USERNAME="fescobarmo"
DOCKERHUB_REPOSITORY="control_acceso"
DOCKERHUB_NAMESPACE="${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}"

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Función para verificar login en Docker Hub
check_dockerhub_login() {
    log "Verificando login en Docker Hub..."
    
    # Verificar si hay credenciales de Docker Hub
    if ! docker system info | grep -q "Username" && ! docker info | grep -q "Username"; then
        # Intentar hacer un pull de prueba para verificar login
        if ! docker pull hello-world:latest >/dev/null 2>&1; then
            warning "No estás logueado en Docker Hub como $DOCKERHUB_USERNAME"
            log "Ejecuta: docker login"
            return 1
        fi
    fi
    
    success "Login en Docker Hub verificado"
    return 0
}

# Función para construir y subir imágenes
build_and_push() {
    log "Construyendo y subiendo imágenes a Docker Hub..."
    
    # Verificar login
    if ! check_dockerhub_login; then
        error "No se puede subir sin estar logueado en Docker Hub"
    fi
    
    # Construir imágenes
    log "Construyendo imágenes..."
    cd "$PROJECT_ROOT"
    docker-compose build --no-cache --parallel
    
    # Obtener timestamp para versionado
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    VERSION=${2:-$TIMESTAMP}
    ENVIRONMENT=${3:-production}
    
    # Etiquetar imágenes
    log "Etiquetando imágenes..."
    docker tag controlacceso-frontend:latest ${DOCKERHUB_NAMESPACE}_frontend:latest
    docker tag controlacceso-frontend:latest ${DOCKERHUB_NAMESPACE}_frontend:${VERSION}
    docker tag controlacceso-frontend:latest ${DOCKERHUB_NAMESPACE}_frontend:${ENVIRONMENT}
    
    docker tag controlacceso-backend:latest ${DOCKERHUB_NAMESPACE}_backend:latest
    docker tag controlacceso-backend:latest ${DOCKERHUB_NAMESPACE}_backend:${VERSION}
    docker tag controlacceso-backend:latest ${DOCKERHUB_NAMESPACE}_backend:${ENVIRONMENT}
    
    docker tag controlacceso-database:latest ${DOCKERHUB_NAMESPACE}_database:latest
    docker tag controlacceso-database:latest ${DOCKERHUB_NAMESPACE}_database:${VERSION}
    docker tag controlacceso-database:latest ${DOCKERHUB_NAMESPACE}_database:${ENVIRONMENT}
    
    # Subir frontend
    log "Subiendo frontend..."
    docker push ${DOCKERHUB_NAMESPACE}_frontend:latest
    docker push ${DOCKERHUB_NAMESPACE}_frontend:${VERSION}
    docker push ${DOCKERHUB_NAMESPACE}_frontend:${ENVIRONMENT}
    
    # Subir backend
    log "Subiendo backend..."
    docker push ${DOCKERHUB_NAMESPACE}_backend:latest
    docker push ${DOCKERHUB_NAMESPACE}_backend:${VERSION}
    docker push ${DOCKERHUB_NAMESPACE}_backend:${ENVIRONMENT}
    
    # Subir database
    log "Subiendo database..."
    docker push ${DOCKERHUB_NAMESPACE}_database:latest
    docker push ${DOCKERHUB_NAMESPACE}_database:${VERSION}
    docker push ${DOCKERHUB_NAMESPACE}_database:${ENVIRONMENT}
    
    success "Imágenes subidas exitosamente a Docker Hub"
    log "Repositorio: https://hub.docker.com/r/${DOCKERHUB_NAMESPACE}"
    log "Versión: ${VERSION}"
    log "Entorno: ${ENVIRONMENT}"
}

# Función para descargar imágenes
pull_images() {
    log "Descargando imágenes desde Docker Hub..."
    
    VERSION=${2:-latest}
    
    # Descargar imágenes
    log "Descargando frontend (${VERSION})..."
    docker pull ${DOCKERHUB_NAMESPACE}_frontend:${VERSION}
    
    log "Descargando backend (${VERSION})..."
    docker pull ${DOCKERHUB_NAMESPACE}_backend:${VERSION}
    
    log "Descargando database (${VERSION})..."
    docker pull ${DOCKERHUB_NAMESPACE}_database:${VERSION}
    
    success "Imágenes descargadas exitosamente"
}

# Función para ejecutar con imágenes de Docker Hub
run_with_hub() {
    log "Ejecutando aplicación con imágenes de Docker Hub..."
    
    cd "$PROJECT_ROOT"
    
    # Crear directorio de datos si no existe
    mkdir -p data/postgres-hub
    
    # Ejecutar con docker-compose.hub.yml
    docker-compose -f docker-compose.hub.yml up -d
    
    success "Aplicación ejecutándose con imágenes de Docker Hub"
    log "Frontend: http://localhost:3000"
    log "Backend: http://localhost:3001"
}

# Función para listar imágenes locales
list_local() {
    log "Imágenes locales de ControlAcceso:"
    
    echo ""
    echo "Frontend:"
    docker images | grep control_acceso_frontend || echo "  No hay imágenes de frontend"
    
    echo ""
    echo "Backend:"
    docker images | grep control_acceso_backend || echo "  No hay imágenes de backend"
    
    echo ""
    echo "Docker Hub:"
    docker images | grep fescobarmo/control_acceso || echo "  No hay imágenes de Docker Hub"
}

# Función para limpiar imágenes
cleanup() {
    log "Limpiando imágenes de ControlAcceso..."
    
    # Eliminar imágenes locales
    docker rmi controlacceso_frontend:latest 2>/dev/null || true
    docker rmi controlacceso_backend:latest 2>/dev/null || true
    
    # Eliminar imágenes de Docker Hub
    docker rmi ${DOCKERHUB_NAMESPACE}_frontend:latest 2>/dev/null || true
    docker rmi ${DOCKERHUB_NAMESPACE}_backend:latest 2>/dev/null || true
    
    # Limpiar imágenes no utilizadas
    docker image prune -f
    
    success "Limpieza completada"
}

# Función para mostrar información
show_info() {
    log "Información de Docker Hub:"
    
    echo ""
    echo "🐳 Configuración:"
    echo "   Usuario:     $DOCKERHUB_USERNAME"
    echo "   Repositorio: $DOCKERHUB_REPOSITORY"
    echo "   Namespace:   $DOCKERHUB_NAMESPACE"
    echo "   URL:         https://hub.docker.com/r/$DOCKERHUB_NAMESPACE"
    echo ""
    echo "📦 Imágenes:"
    echo "   Frontend:    ${DOCKERHUB_NAMESPACE}_frontend"
    echo "   Backend:     ${DOCKERHUB_NAMESPACE}_backend"
    echo "   Database:    ${DOCKERHUB_NAMESPACE}_database"
    echo ""
    echo "🏷️  Etiquetas disponibles:"
    echo "   latest       - Última versión"
    echo "   production   - Versión de producción"
    echo "   development  - Versión de desarrollo"
    echo "   YYYYMMDD_HHMMSS - Timestamp de build"
    echo "   v1.0.0       - Versión específica"
    echo ""
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [action] [options]"
    echo ""
    echo "Actions:"
    echo "  build        - Construir y subir imágenes a Docker Hub"
    echo "  pull         - Descargar imágenes desde Docker Hub"
    echo "  run          - Ejecutar aplicación con imágenes de Docker Hub"
    echo "  list         - Listar imágenes locales"
    echo "  cleanup      - Limpiar imágenes locales"
    echo "  info         - Mostrar información de Docker Hub"
    echo "  help         - Mostrar esta ayuda"
    echo ""
    echo "Options:"
    echo "  [version]    - Versión específica (para pull)"
    echo "  [environment] - Entorno (production/development)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 build"
    echo "  $0 build v1.0.0 production"
    echo "  $0 pull latest"
    echo "  $0 pull v1.0.0"
    echo "  $0 run"
    echo "  $0 list"
    echo "  $0 cleanup"
    echo "  $0 info"
    echo ""
    echo "Docker Hub:"
    echo "  Usuario:     $DOCKERHUB_USERNAME"
    echo "  Repositorio: $DOCKERHUB_REPOSITORY"
    echo "  Namespace:   $DOCKERHUB_NAMESPACE"
}

# Función principal
main() {
    case $ACTION in
        "build")
            build_and_push "$@"
            ;;
        "pull")
            pull_images "$@"
            ;;
        "run")
            run_with_hub
            ;;
        "list")
            list_local
            ;;
        "cleanup")
            cleanup
            ;;
        "info")
            show_info
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Acción no válida: $ACTION. Usa 'help' para ver las opciones disponibles."
            ;;
    esac
}

# Ejecutar función principal
main "$@"
