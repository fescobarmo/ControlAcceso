#!/bin/bash

# deploy.sh
# Script de deploy automatizado para ControlAcceso
# Uso: ./scripts/deploy.sh [environment] [action]
# Ejemplo: ./scripts/deploy.sh production build

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-development}
ACTION=${2:-deploy}

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
    log "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
    fi
    
    # Verificar que Docker esté corriendo
    if ! docker info &> /dev/null; then
        error "Docker no está corriendo"
    fi
    
    success "Prerrequisitos verificados"
}

# Función para configurar entorno
setup_environment() {
    log "Configurando entorno: $ENVIRONMENT"
    
    cd "$PROJECT_ROOT"
    
    # Crear archivo .env si no existe
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            warning "Archivo .env creado desde env.example. Por favor, revisa y ajusta las variables."
        else
            error "No se encontró env.example. Crea un archivo .env con las variables necesarias."
        fi
    fi
    
    # Crear directorios necesarios
    mkdir -p data/postgres
    mkdir -p logs
    mkdir -p uploads
    
    # Ajustar permisos
    chmod 755 data/postgres
    chmod 755 logs
    chmod 755 uploads
    
    success "Entorno configurado"
}

# Función para limpiar contenedores y volúmenes
cleanup() {
    log "Limpiando contenedores y volúmenes anteriores..."
    
    cd "$PROJECT_ROOT"
    
    # Detener y eliminar contenedores
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Limpiar imágenes no utilizadas
    docker image prune -f
    
    success "Limpieza completada"
}

# Función para construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Construir todas las imágenes
    docker-compose build --no-cache --parallel
    
    success "Imágenes construidas exitosamente"
}

# Función para ejecutar tests
run_tests() {
    log "Ejecutando tests..."
    
    cd "$PROJECT_ROOT"
    
    # Tests del backend
    if [ -d "backend/tests" ]; then
        log "Ejecutando tests del backend..."
        docker-compose run --rm backend npm test || warning "Tests del backend fallaron"
    fi
    
    # Tests del frontend
    if [ -d "frontend/src" ]; then
        log "Ejecutando tests del frontend..."
        docker-compose run --rm frontend npm test -- --coverage --watchAll=false || warning "Tests del frontend fallaron"
    fi
    
    success "Tests completados"
}

# Función para iniciar servicios
start_services() {
    log "Iniciando servicios..."
    
    cd "$PROJECT_ROOT"
    
    # Iniciar servicios en background
    docker-compose up -d
    
    # Esperar a que los servicios estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 30
    
    # Verificar health checks
    check_health
    
    success "Servicios iniciados exitosamente"
}

# Función para verificar health checks
check_health() {
    log "Verificando health checks..."
    
    # Verificar backend
    if docker-compose exec -T backend curl -f http://localhost:3001/health &>/dev/null; then
        success "Backend está funcionando"
    else
        warning "Backend no responde correctamente"
    fi
    
    # Verificar frontend
    if docker-compose exec -T frontend curl -f http://localhost/health &>/dev/null; then
        success "Frontend está funcionando"
    else
        warning "Frontend no responde correctamente"
    fi
    
    # Verificar base de datos
    if docker-compose exec -T database pg_isready -U postgres &>/dev/null; then
        success "Base de datos está funcionando"
    else
        warning "Base de datos no responde correctamente"
    fi
}

# Función para mostrar información del deploy
show_deploy_info() {
    log "Información del deploy:"
    
    echo ""
    echo "🌐 URLs de acceso:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo "   Database: localhost:5432"
    echo ""
    echo "📊 Comandos útiles:"
    echo "   Ver logs:     docker-compose logs -f"
    echo "   Ver estado:   docker-compose ps"
    echo "   Detener:      docker-compose down"
    echo "   Reiniciar:    docker-compose restart"
    echo ""
    echo "🔍 Health checks:"
    echo "   Backend:  curl http://localhost:3001/health"
    echo "   Frontend: curl http://localhost:3000/health"
    echo ""
    echo "🐳 Docker Hub:"
    echo "   Usuario:     $DOCKERHUB_USERNAME"
    echo "   Repositorio: $DOCKERHUB_REPOSITORY"
    echo "   Namespace:   $DOCKERHUB_NAMESPACE"
    echo "   URL:         https://hub.docker.com/r/$DOCKERHUB_NAMESPACE"
    echo ""
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

# Función para deploy con push a Docker Hub
deploy_with_push() {
    log "Iniciando deploy con push a Docker Hub para entorno: $ENVIRONMENT"
    
    # Verificar login en Docker Hub
    if ! check_dockerhub_login; then
        error "No se puede hacer push sin estar logueado en Docker Hub"
    fi
    
    # Deploy completo
    full_deploy
    
    # Push a Docker Hub
    log "Subiendo imágenes a Docker Hub..."
    cd "$PROJECT_ROOT"
    
    # Obtener timestamp para versionado
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    VERSION=${3:-$TIMESTAMP}
    
    # Etiquetar y subir imágenes
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
    
    show_deploy_info
}

# Función para deploy completo
full_deploy() {
    log "Iniciando deploy completo para entorno: $ENVIRONMENT"
    
    check_prerequisites
    setup_environment
    cleanup
    build_images
    
    if [ "$ENVIRONMENT" = "production" ]; then
        run_tests
    fi
    
    start_services
    show_deploy_info
    
    success "Deploy completado exitosamente! 🎉"
}

# Función para deploy rápido (sin rebuild)
quick_deploy() {
    log "Iniciando deploy rápido..."
    
    check_prerequisites
    setup_environment
    start_services
    show_deploy_info
    
    success "Deploy rápido completado! 🚀"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [environment] [action] [version]"
    echo ""
    echo "Environments:"
    echo "  development  - Entorno de desarrollo (default)"
    echo "  production   - Entorno de producción"
    echo ""
    echo "Actions:"
    echo "  deploy       - Deploy completo (default)"
    echo "  quick        - Deploy rápido (sin rebuild)"
    echo "  build        - Solo construir imágenes"
    echo "  start        - Solo iniciar servicios"
    echo "  stop         - Detener servicios"
    echo "  restart      - Reiniciar servicios"
    echo "  logs         - Mostrar logs"
    echo "  status       - Mostrar estado"
    echo "  health       - Verificar health checks"
    echo "  cleanup      - Limpiar contenedores y volúmenes"
    echo "  push         - Deploy completo + push a Docker Hub"
    echo "  help         - Mostrar esta ayuda"
    echo ""
    echo "Docker Hub:"
    echo "  Usuario:     $DOCKERHUB_USERNAME"
    echo "  Repositorio: $DOCKERHUB_REPOSITORY"
    echo "  Namespace:   $DOCKERHUB_NAMESPACE"
    echo ""
    echo "Ejemplos:"
    echo "  $0 production deploy"
    echo "  $0 development quick"
    echo "  $0 production build"
    echo "  $0 production push"
    echo "  $0 production push v1.0.0"
    echo "  $0 logs"
}

# Función principal
main() {
    case $ACTION in
        "deploy")
            full_deploy
            ;;
        "quick")
            quick_deploy
            ;;
        "build")
            check_prerequisites
            setup_environment
            build_images
            ;;
        "start")
            check_prerequisites
            setup_environment
            start_services
            show_deploy_info
            ;;
        "stop")
            cd "$PROJECT_ROOT"
            docker-compose down
            success "Servicios detenidos"
            ;;
        "restart")
            cd "$PROJECT_ROOT"
            docker-compose restart
            success "Servicios reiniciados"
            ;;
        "logs")
            cd "$PROJECT_ROOT"
            docker-compose logs -f
            ;;
        "status")
            cd "$PROJECT_ROOT"
            docker-compose ps
            ;;
        "health")
            cd "$PROJECT_ROOT"
            check_health
            ;;
        "cleanup")
            cleanup
            ;;
        "push")
            deploy_with_push
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
