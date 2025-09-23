#!/bin/bash

# ControlAcceso - Gestor de Versiones Docker
# Este script gestiona las versiones de las imágenes Docker y las etiquetas

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  ControlAcceso Version Manager${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Función para cargar variables de versión
load_version() {
    if [ -f "VERSION" ]; then
        source VERSION
    else
        print_error "Archivo VERSION no encontrado"
        exit 1
    fi
}

# Función para actualizar versión
update_version() {
    local component=$1
    local new_version=$2
    
    if [ -z "$component" ] || [ -z "$new_version" ]; then
        print_error "Uso: update_version <componente> <nueva_version>"
        print_message "Componentes disponibles: backend, frontend, database, system"
        exit 1
    fi
    
    case $component in
        "backend")
            sed -i.bak "s/BACKEND_VERSION=.*/BACKEND_VERSION=$new_version/" VERSION
            print_message "Versión del backend actualizada a $new_version"
            ;;
        "frontend")
            sed -i.bak "s/FRONTEND_VERSION=.*/FRONTEND_VERSION=$new_version/" VERSION
            print_message "Versión del frontend actualizada a $new_version"
            ;;
        "database")
            sed -i.bak "s/DATABASE_VERSION=.*/DATABASE_VERSION=$new_version/" VERSION
            print_message "Versión de la base de datos actualizada a $new_version"
            ;;
        "system")
            sed -i.bak "s/SYSTEM_VERSION=.*/SYSTEM_VERSION=$new_version/" VERSION
            print_message "Versión del sistema actualizada a $new_version"
            ;;
        *)
            print_error "Componente no válido: $component"
            exit 1
            ;;
    esac
    
    rm -f VERSION.bak
}

# Función para construir imágenes con versiones
build_images() {
    local environment=${1:-development}
    
    load_version
    
    print_message "Construyendo imágenes Docker para entorno: $environment"
    
    # Actualizar timestamp
    sed -i.bak "s/BUILD_DATE=.*/BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)/" VERSION
    rm -f VERSION.bak
    
    # Construir imágenes con etiquetas versionadas
    print_message "Construyendo imagen de base de datos..."
    docker build -t "controlacceso-database:${DATABASE_VERSION}" \
                 -t "controlacceso-database:latest" \
                 --build-arg POSTGRES_VERSION=${POSTGRES_VERSION} \
                 ./database
    
    print_message "Construyendo imagen del backend..."
    docker build -t "controlacceso-backend:${BACKEND_VERSION}" \
                 -t "controlacceso-backend:latest" \
                 --build-arg NODE_VERSION=${NODE_VERSION} \
                 --build-arg BACKEND_VERSION=${BACKEND_VERSION} \
                 ./backend
    
    print_message "Construyendo imagen del frontend..."
    docker build -t "controlacceso-frontend:${FRONTEND_VERSION}" \
                 -t "controlacceso-frontend:latest" \
                 --build-arg NGINX_VERSION=${NGINX_VERSION} \
                 --build-arg FRONTEND_VERSION=${FRONTEND_VERSION} \
                 ./frontend
    
    print_message "Todas las imágenes construidas exitosamente"
}

# Función para hacer push de imágenes a registro
push_images() {
    local registry=${1:-docker.io}
    local namespace=${2:-controlacceso}
    
    load_version
    
    print_message "Subiendo imágenes a $registry/$namespace"
    
    # Tag y push para cada imagen
    for image in database backend frontend; do
        local version_var="${image^^}_VERSION"
        local version=${!version_var}
        
        print_message "Subiendo controlacceso-$image:$version"
        
        docker tag "controlacceso-$image:$version" "$registry/$namespace/controlacceso-$image:$version"
        docker tag "controlacceso-$image:latest" "$registry/$namespace/controlacceso-$image:latest"
        
        docker push "$registry/$namespace/controlacceso-$image:$version"
        docker push "$registry/$namespace/controlacceso-$image:latest"
    done
    
    print_message "Todas las imágenes subidas exitosamente"
}

# Función para generar docker-compose con versiones
generate_compose() {
    local environment=${1:-development}
    local output_file=${2:-docker-compose.${environment}.yml}
    
    load_version
    
    print_message "Generando docker-compose para entorno: $environment"
    
    # Crear archivo docker-compose con versiones específicas
    cat > "$output_file" << EOF
# ControlAcceso - Docker Compose para $environment
# Generado automáticamente el $(date)
# Versión del sistema: $SYSTEM_VERSION

version: '$COMPOSE_VERSION'

services:
  database:
    image: controlacceso-database:${DATABASE_VERSION}
    container_name: controlacceso-db-${environment}
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${DB_NAME:-controlacceso}
      POSTGRES_USER: \${DB_USER:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-postgres123}
    volumes:
      - postgres_data_${environment}:/var/lib/postgresql/data
    ports:
      - "\${DB_PORT:-5432}:5432"
    networks:
      - controlacceso-network-${environment}

  backend:
    image: controlacceso-backend:${BACKEND_VERSION}
    container_name: controlacceso-backend-${environment}
    restart: unless-stopped
    environment:
      NODE_ENV: ${environment}
      PORT: 3001
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: \${DB_NAME:-controlacceso}
      DB_USER: \${DB_USER:-postgres}
      DB_PASSWORD: \${DB_PASSWORD:-postgres123}
      JWT_SECRET: \${JWT_SECRET:-your-super-secret-jwt-key}
    ports:
      - "\${BACKEND_PORT:-3001}:3001"
    networks:
      - controlacceso-network-${environment}
    depends_on:
      - database

  frontend:
    image: controlacceso-frontend:${FRONTEND_VERSION}
    container_name: controlacceso-frontend-${environment}
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: \${REACT_APP_API_URL:-http://localhost:3001}
    ports:
      - "\${FRONTEND_PORT:-3000}:80"
    networks:
      - controlacceso-network-${environment}
    depends_on:
      - backend

volumes:
  postgres_data_${environment}:
    driver: local

networks:
  controlacceso-network-${environment}:
    driver: bridge
EOF

    print_message "Archivo $output_file generado exitosamente"
}

# Función para mostrar información de versiones
show_versions() {
    load_version
    
    print_header
    echo -e "Versión del Sistema: ${BLUE}$SYSTEM_VERSION${NC}"
    echo -e "Backend: ${GREEN}$BACKEND_VERSION${NC}"
    echo -e "Frontend: ${GREEN}$FRONTEND_VERSION${NC}"
    echo -e "Base de Datos: ${GREEN}$DATABASE_VERSION${NC}"
    echo ""
    echo -e "Imágenes Base:"
    echo -e "  Node.js: ${YELLOW}$NODE_VERSION${NC}"
    echo -e "  PostgreSQL: ${YELLOW}$POSTGRES_VERSION${NC}"
    echo -e "  Nginx: ${YELLOW}$NGINX_VERSION${NC}"
    echo ""
    echo -e "Build Date: ${YELLOW}$BUILD_DATE${NC}"
    echo -e "Git Commit: ${YELLOW}$GIT_COMMIT${NC}"
    echo -e "Entorno: ${YELLOW}$ENVIRONMENT${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Función para limpiar imágenes no utilizadas
cleanup() {
    print_message "Limpiando imágenes Docker no utilizadas..."
    
    # Eliminar imágenes huérfanas
    docker image prune -f
    
    # Eliminar contenedores parados
    docker container prune -f
    
    # Eliminar volúmenes no utilizados
    docker volume prune -f
    
    print_message "Limpieza completada"
}

# Función de ayuda
show_help() {
    print_header
    echo "Uso: $0 [COMANDO] [OPCIONES]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build [entorno]           - Construir todas las imágenes Docker"
    echo "  push [registry] [namespace] - Subir imágenes a registro Docker"
    echo "  generate [entorno] [archivo] - Generar docker-compose con versiones"
    echo "  update <componente> <version> - Actualizar versión de componente"
    echo "  show                      - Mostrar información de versiones"
    echo "  cleanup                   - Limpiar imágenes no utilizadas"
    echo "  help                      - Mostrar esta ayuda"
    echo ""
    echo "Componentes para update:"
    echo "  backend, frontend, database, system"
    echo ""
    echo "Ejemplos:"
    echo "  $0 build production"
    echo "  $0 push docker.io mi-usuario"
    echo "  $0 update backend 1.1.0"
    echo "  $0 generate production docker-compose.prod.yml"
}

# Función principal
main() {
    case ${1:-help} in
        "build")
            build_images $2
            ;;
        "push")
            push_images $2 $3
            ;;
        "generate")
            generate_compose $2 $3
            ;;
        "update")
            update_version $2 $3
            ;;
        "show")
            show_versions
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal con todos los argumentos
main "$@"
