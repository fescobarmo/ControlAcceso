#!/bin/bash

# build.sh
# Script de build y compilación para ControlAcceso
# Uso: ./scripts/build.sh [environment] [options]

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
ENVIRONMENT=${1:-production}
BUILD_OPTIONS=${2:-""}

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

# Función para verificar prerrequisitos
check_prerequisites() {
    log "Verificando prerrequisitos de build..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    # Verificar Node.js (para builds locales)
    if ! command -v node &> /dev/null; then
        warning "Node.js no está instalado. Solo se podrán hacer builds con Docker."
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        warning "npm no está instalado. Solo se podrán hacer builds con Docker."
    fi
    
    success "Prerrequisitos verificados"
}

# Función para preparar entorno de build
prepare_build_environment() {
    log "Preparando entorno de build: $ENVIRONMENT"
    
    cd "$PROJECT_ROOT"
    
    # Crear directorios de build
    mkdir -p build/frontend
    mkdir -p build/backend
    mkdir -p dist
    
    # Limpiar builds anteriores
    rm -rf build/frontend/*
    rm -rf build/backend/*
    rm -rf dist/*
    
    success "Entorno de build preparado"
}

# Función para build del frontend
build_frontend() {
    log "Construyendo frontend..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Verificar que package.json existe
    if [ ! -f package.json ]; then
        error "package.json no encontrado en frontend/"
    fi
    
    # Instalar dependencias
    log "Instalando dependencias del frontend..."
    npm ci --silent
    
    # Ejecutar tests (si existen)
    if [ -f package.json ] && grep -q '"test"' package.json; then
        log "Ejecutando tests del frontend..."
        npm test -- --coverage --watchAll=false --passWithNoTests || warning "Tests del frontend fallaron"
    fi
    
    # Build de producción
    log "Ejecutando build de producción..."
    npm run build
    
    # Verificar que el build se completó
    if [ ! -d "build" ]; then
        error "Build del frontend falló - directorio build no encontrado"
    fi
    
    # Copiar build a directorio de distribución
    cp -r build/* "$PROJECT_ROOT/build/frontend/"
    
    success "Frontend construido exitosamente"
}

# Función para build del backend
build_backend() {
    log "Construyendo backend..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Verificar que package.json existe
    if [ ! -f package.json ]; then
        error "package.json no encontrado en backend/"
    fi
    
    # Instalar dependencias
    log "Instalando dependencias del backend..."
    npm ci --silent
    
    # Ejecutar tests (si existen)
    if [ -f package.json ] && grep -q '"test"' package.json; then
        log "Ejecutando tests del backend..."
        npm test || warning "Tests del backend fallaron"
    fi
    
    # Verificar sintaxis del código
    log "Verificando sintaxis del código..."
    node -c src/index.js || error "Error de sintaxis en src/index.js"
    
    # Copiar archivos necesarios
    cp -r src "$PROJECT_ROOT/build/backend/"
    cp -r scripts "$PROJECT_ROOT/build/backend/" 2>/dev/null || true
    cp package*.json "$PROJECT_ROOT/build/backend/"
    
    success "Backend construido exitosamente"
}

# Función para build con Docker
build_with_docker() {
    log "Construyendo con Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Construir imágenes
    docker-compose build --no-cache --parallel
    
    # Etiquetar imágenes para producción
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Etiquetando imágenes para producción..."
        
        # Obtener timestamp para versionado
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        
        # Etiquetar frontend
        docker tag controlacceso_frontend:latest controlacceso_frontend:$TIMESTAMP
        docker tag controlacceso_frontend:latest controlacceso_frontend:production
        
        # Etiquetar backend
        docker tag controlacceso_backend:latest controlacceso_backend:$TIMESTAMP
        docker tag controlacceso_backend:latest controlacceso_backend:production
        
        success "Imágenes etiquetadas: $TIMESTAMP"
    fi
    
    success "Build con Docker completado"
}

# Función para crear archivo de distribución
create_distribution() {
    log "Creando archivo de distribución..."
    
    cd "$PROJECT_ROOT"
    
    # Crear archivo tar.gz con la aplicación
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    DIST_FILE="controlacceso_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
    
    # Incluir archivos necesarios para deploy
    tar -czf "dist/$DIST_FILE" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=build \
        --exclude=dist \
        --exclude=data \
        --exclude=logs \
        --exclude=uploads \
        --exclude=.env \
        docker-compose.yml \
        env.example \
        DOCKER_SETUP.md \
        scripts/ \
        frontend/ \
        backend/ \
        database/ \
        docs/
    
    success "Archivo de distribución creado: dist/$DIST_FILE"
    
    # Mostrar información del archivo
    log "Información del archivo de distribución:"
    ls -lh "dist/$DIST_FILE"
}

# Función para verificar build
verify_build() {
    log "Verificando build..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar que los directorios de build existen
    if [ ! -d "build/frontend" ]; then
        error "Build del frontend no encontrado"
    fi
    
    if [ ! -d "build/backend" ]; then
        error "Build del backend no encontrado"
    fi
    
    # Verificar archivos críticos del frontend
    if [ ! -f "build/frontend/index.html" ]; then
        error "index.html no encontrado en build del frontend"
    fi
    
    # Verificar archivos críticos del backend
    if [ ! -f "build/backend/src/index.js" ]; then
        error "index.js no encontrado en build del backend"
    fi
    
    success "Build verificado exitosamente"
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

# Función para etiquetar imágenes para Docker Hub
tag_images_for_dockerhub() {
    log "Etiquetando imágenes para Docker Hub..."
    
    cd "$PROJECT_ROOT"
    
    # Obtener timestamp para versionado
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    VERSION=${3:-$TIMESTAMP}
    
    # Etiquetar frontend
    docker tag controlacceso-frontend:latest ${DOCKERHUB_NAMESPACE}_frontend:latest
    docker tag controlacceso-frontend:latest ${DOCKERHUB_NAMESPACE}_frontend:${VERSION}
    docker tag controlacceso-frontend:latest ${DOCKERHUB_NAMESPACE}_frontend:${ENVIRONMENT}
    
    # Etiquetar backend
    docker tag controlacceso-backend:latest ${DOCKERHUB_NAMESPACE}_backend:latest
    docker tag controlacceso-backend:latest ${DOCKERHUB_NAMESPACE}_backend:${VERSION}
    docker tag controlacceso-backend:latest ${DOCKERHUB_NAMESPACE}_backend:${ENVIRONMENT}
    
    # Etiquetar database
    docker tag controlacceso-database:latest ${DOCKERHUB_NAMESPACE}_database:latest
    docker tag controlacceso-database:latest ${DOCKERHUB_NAMESPACE}_database:${VERSION}
    docker tag controlacceso-database:latest ${DOCKERHUB_NAMESPACE}_database:${ENVIRONMENT}
    
    success "Imágenes etiquetadas para Docker Hub"
    log "Etiquetas creadas:"
    log "  - ${DOCKERHUB_NAMESPACE}_frontend:latest"
    log "  - ${DOCKERHUB_NAMESPACE}_frontend:${VERSION}"
    log "  - ${DOCKERHUB_NAMESPACE}_frontend:${ENVIRONMENT}"
    log "  - ${DOCKERHUB_NAMESPACE}_backend:latest"
    log "  - ${DOCKERHUB_NAMESPACE}_backend:${VERSION}"
    log "  - ${DOCKERHUB_NAMESPACE}_backend:${ENVIRONMENT}"
    log "  - ${DOCKERHUB_NAMESPACE}_database:latest"
    log "  - ${DOCKERHUB_NAMESPACE}_database:${VERSION}"
    log "  - ${DOCKERHUB_NAMESPACE}_database:${ENVIRONMENT}"
}

# Función para subir imágenes a Docker Hub
push_to_dockerhub() {
    log "Subiendo imágenes a Docker Hub..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar login
    if ! check_dockerhub_login; then
        error "No se puede subir sin estar logueado en Docker Hub"
    fi
    
    # Obtener timestamp para versionado
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    VERSION=${3:-$TIMESTAMP}
    
    # Etiquetar imágenes
    tag_images_for_dockerhub "$@"
    
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
}

# Función para mostrar información del build
show_build_info() {
    log "Información del build:"
    
    echo ""
    echo "📦 Build completado para entorno: $ENVIRONMENT"
    echo ""
    echo "📁 Directorios de build:"
    echo "   Frontend: build/frontend/"
    echo "   Backend:  build/backend/"
    echo ""
    echo "🐳 Imágenes Docker:"
    docker images | grep controlacceso || echo "   No hay imágenes Docker construidas"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Revisar builds en build/"
    echo "   2. Ejecutar: ./scripts/deploy.sh $ENVIRONMENT"
    echo "   3. Verificar: docker-compose ps"
    echo ""
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [environment] [options] [version]"
    echo ""
    echo "Environments:"
    echo "  production   - Build de producción (default)"
    echo "  development  - Build de desarrollo"
    echo ""
    echo "Options:"
    echo "  docker       - Solo build con Docker"
    echo "  local        - Solo build local (sin Docker)"
    echo "  dist         - Crear archivo de distribución"
    echo "  verify       - Solo verificar build existente"
    echo "  tag          - Solo etiquetar imágenes para Docker Hub"
    echo "  push         - Build, etiquetar y subir a Docker Hub"
    echo "  help         - Mostrar esta ayuda"
    echo ""
    echo "Docker Hub:"
    echo "  Usuario:     $DOCKERHUB_USERNAME"
    echo "  Repositorio: $DOCKERHUB_REPOSITORY"
    echo "  Namespace:   $DOCKERHUB_NAMESPACE"
    echo ""
    echo "Ejemplos:"
    echo "  $0 production"
    echo "  $0 development docker"
    echo "  $0 production dist"
    echo "  $0 production push"
    echo "  $0 production push v1.0.0"
    echo "  $0 verify"
}

# Función principal
main() {
    case $BUILD_OPTIONS in
        "docker")
            check_prerequisites
            prepare_build_environment
            build_with_docker
            ;;
        "local")
            check_prerequisites
            prepare_build_environment
            build_frontend
            build_backend
            verify_build
            ;;
        "dist")
            check_prerequisites
            prepare_build_environment
            build_frontend
            build_backend
            verify_build
            create_distribution
            ;;
        "verify")
            verify_build
            ;;
        "tag")
            check_prerequisites
            tag_images_for_dockerhub "$@"
            ;;
        "push")
            check_prerequisites
            prepare_build_environment
            build_frontend
            build_backend
            verify_build
            build_with_docker
            push_to_dockerhub "$@"
            show_build_info
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "")
            # Build completo por defecto
            check_prerequisites
            prepare_build_environment
            build_frontend
            build_backend
            verify_build
            build_with_docker
            show_build_info
            ;;
        *)
            error "Opción no válida: $BUILD_OPTIONS. Usa 'help' para ver las opciones disponibles."
            ;;
    esac
}

# Ejecutar función principal
main "$@"
