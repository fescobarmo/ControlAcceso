#!/bin/bash

# ControlAcceso - Script de Configuración para GitHub
# Este script ayuda a configurar el proyecto para GitHub

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
    echo -e "${BLUE}  ControlAcceso GitHub Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Función para verificar si git está instalado
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git no está instalado. Por favor instala Git primero."
        exit 1
    fi
    print_message "Git está instalado ✓"
}

# Función para verificar si docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker no está instalado. Es recomendable para el desarrollo."
        return 1
    fi
    print_message "Docker está instalado ✓"
    return 0
}

# Función para inicializar repositorio git
init_git_repo() {
    if [ -d ".git" ]; then
        print_message "Repositorio Git ya inicializado ✓"
        return 0
    fi
    
    print_message "Inicializando repositorio Git..."
    git init
    git add .
    git commit -m "Initial commit: ControlAcceso system with Docker support"
    print_message "Repositorio Git inicializado ✓"
}

# Función para configurar git user
setup_git_user() {
    print_message "Configurando usuario de Git..."
    
    # Verificar si ya está configurado
    if git config --global user.name &> /dev/null && git config --global user.email &> /dev/null; then
        print_message "Usuario de Git ya configurado ✓"
        echo "Nombre: $(git config --global user.name)"
        echo "Email: $(git config --global user.email)"
        return 0
    fi
    
    echo -n "Ingresa tu nombre para Git: "
    read -r git_name
    echo -n "Ingresa tu email para Git: "
    read -r git_email
    
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    
    print_message "Usuario de Git configurado ✓"
}

# Función para configurar remote de GitHub
setup_github_remote() {
    print_message "Configurando remote de GitHub..."
    
    echo -n "Ingresa la URL de tu repositorio de GitHub (ej: https://github.com/tu-usuario/ControlAcceso.git): "
    read -r github_url
    
    if [ -z "$github_url" ]; then
        print_warning "URL no proporcionada. Puedes configurarla más tarde con:"
        echo "git remote add origin <URL_DEL_REPOSITORIO>"
        return 0
    fi
    
    git remote add origin "$github_url"
    print_message "Remote de GitHub configurado ✓"
}

# Función para hacer push inicial
push_to_github() {
    print_message "Haciendo push inicial a GitHub..."
    
    if ! git remote get-url origin &> /dev/null; then
        print_warning "No hay remote configurado. Configura primero la URL de GitHub."
        return 0
    fi
    
    git branch -M main
    git push -u origin main
    print_message "Push inicial completado ✓"
}

# Función para crear archivo de instrucciones
create_instructions() {
    print_message "Creando archivo de instrucciones..."
    
    cat > GITHUB_INSTRUCTIONS.md << EOF
# 📋 Instrucciones para GitHub

## ✅ Completado
- [x] Repositorio Git inicializado
- [x] Usuario de Git configurado
- [x] Remote de GitHub configurado
- [x] Push inicial realizado

## 🔧 Próximos Pasos

### 1. Configurar Secrets en GitHub
Ve a tu repositorio en GitHub:
1. Settings > Secrets and variables > Actions
2. Agrega estos secrets:
   - \`DOCKERHUB_USERNAME\`: Tu nombre de usuario de Docker Hub
   - \`DOCKERHUB_TOKEN\`: Token de acceso de Docker Hub
   - \`SLACK_WEBHOOK_URL\`: (Opcional) URL del webhook de Slack

### 2. Configurar Docker Hub (Opcional)
1. Crear cuenta en https://hub.docker.com
2. Generar token de acceso
3. Configurar secrets en GitHub

### 3. Verificar GitHub Actions
1. Ve a la pestaña "Actions" en tu repositorio
2. Verifica que los workflows estén funcionando
3. Revisa los logs si hay errores

### 4. Crear Tags para Releases
\`\`\`bash
# Crear tag de versión
git tag v1.0.0
git push origin v1.0.0
\`\`\`

## 🐳 Comandos Útiles

\`\`\`bash
# Ver versiones actuales
./scripts/version-manager.sh show

# Actualizar versión
./scripts/version-manager.sh update backend 1.1.0

# Construir imágenes localmente
./scripts/version-manager.sh build production

# Limpiar imágenes no utilizadas
./scripts/version-manager.sh cleanup
\`\`\`

## 📚 Documentación
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Configuración completa
- [README.md](./README.md) - Documentación principal

---
Generado el $(date)
EOF

    print_message "Archivo GITHUB_INSTRUCTIONS.md creado ✓"
}

# Función para mostrar resumen
show_summary() {
    print_header
    echo -e "✅ ${GREEN}Configuración completada exitosamente${NC}"
    echo ""
    echo -e "${BLUE}Resumen de lo que se configuró:${NC}"
    echo "• Repositorio Git inicializado"
    echo "• Usuario de Git configurado"
    echo "• Remote de GitHub configurado"
    echo "• Push inicial realizado"
    echo "• Archivo de instrucciones creado"
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo "1. Configurar secrets en GitHub (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)"
    echo "2. Verificar que GitHub Actions esté funcionando"
    echo "3. Revisar GITHUB_INSTRUCTIONS.md para más detalles"
    echo ""
    echo -e "${BLUE}Comandos útiles:${NC}"
    echo "• Ver versiones: ./scripts/version-manager.sh show"
    echo "• Construir imágenes: ./scripts/version-manager.sh build production"
    echo "• Crear release: git tag v1.0.0 && git push origin v1.0.0"
    echo ""
    echo -e "${GREEN}¡ControlAcceso listo para GitHub! 🚀${NC}"
}

# Función de ayuda
show_help() {
    print_header
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Este script configura el proyecto ControlAcceso para GitHub"
    echo ""
    echo "Opciones:"
    echo "  --help, -h          Mostrar esta ayuda"
    echo "  --skip-git          Omitir configuración de Git"
    echo "  --skip-docker       Omitir verificación de Docker"
    echo "  --skip-push         Omitir push inicial a GitHub"
    echo ""
    echo "Ejemplos:"
    echo "  $0                  # Configuración completa"
    echo "  $0 --skip-push      # Configurar sin hacer push"
    echo ""
}

# Función principal
main() {
    local skip_git=false
    local skip_docker=false
    local skip_push=false
    
    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --skip-git)
                skip_git=true
                shift
                ;;
            --skip-docker)
                skip_docker=true
                shift
                ;;
            --skip-push)
                skip_push=true
                shift
                ;;
            *)
                print_error "Opción desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header
    print_message "Iniciando configuración para GitHub..."
    
    # Verificaciones
    check_git
    
    if [ "$skip_docker" = false ]; then
        check_docker
    fi
    
    # Configuración
    if [ "$skip_git" = false ]; then
        setup_git_user
        init_git_repo
        setup_github_remote
        
        if [ "$skip_push" = false ]; then
            push_to_github
        fi
    fi
    
    create_instructions
    show_summary
}

# Ejecutar función principal con todos los argumentos
main "$@"

