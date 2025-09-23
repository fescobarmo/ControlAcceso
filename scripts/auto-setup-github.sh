#!/bin/bash

# ControlAcceso - Configuración Automática Completa para GitHub
# Este script automatiza todo el proceso de configuración

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
    echo -e "${BLUE}  ControlAcceso Auto Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Función para aceptar licencia de Xcode
accept_xcode_license() {
    print_message "Aceptando licencia de Xcode..."
    
    # Verificar si ya está aceptada
    if xcodebuild -version >/dev/null 2>&1; then
        print_message "Licencia de Xcode ya aceptada ✓"
        return 0
    fi
    
    print_warning "Necesitas aceptar la licencia de Xcode manualmente."
    print_message "Ejecuta este comando en tu terminal:"
    echo -e "${YELLOW}sudo xcodebuild -license accept${NC}"
    echo ""
    print_message "Después de aceptar la licencia, ejecuta este script nuevamente."
    
    # Intentar aceptar automáticamente (puede fallar sin sudo)
    if sudo -n xcodebuild -license accept 2>/dev/null; then
        print_message "Licencia aceptada automáticamente ✓"
        return 0
    fi
    
    return 1
}

# Función para configurar Git
setup_git() {
    print_message "Configurando Git..."
    
    # Configurar usuario
    git config --global user.name "fescobarmo"
    git config --global user.email "fabian.escobar@gmail.com"
    
    print_message "Usuario de Git configurado ✓"
}

# Función para inicializar repositorio
init_repo() {
    print_message "Inicializando repositorio Git..."
    
    if [ -d ".git" ]; then
        print_message "Repositorio Git ya inicializado ✓"
        return 0
    fi
    
    git init
    git add .
    git commit -m "Initial commit: ControlAcceso system with Docker support"
    
    print_message "Repositorio Git inicializado ✓"
}

# Función para crear archivo de instrucciones
create_instructions() {
    print_message "Creando archivo de instrucciones..."
    
    cat > GITHUB_INSTRUCTIONS.md << 'EOF'
# 📋 Instrucciones para GitHub - ControlAcceso

## ✅ Configuración Completada
- [x] Usuario de Git configurado
- [x] Repositorio Git inicializado
- [x] Commit inicial realizado

## 🔧 Próximos Pasos

### 1. Crear Repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre del repositorio: `ControlAcceso`
3. Descripción: `Sistema de Control de Acceso con Docker`
4. Marca como público o privado según prefieras
5. **NO** marques "Add a README file"
6. **NO** marques "Add .gitignore"
7. **NO** marques "Choose a license"
8. Haz clic en "Create repository"

### 2. Conectar Repositorio Local con GitHub
```bash
# Reemplaza 'tu-usuario' con tu nombre de usuario de GitHub
git remote add origin https://github.com/tu-usuario/ControlAcceso.git
git branch -M main
git push -u origin main
```

### 3. Configurar Secrets en GitHub (Opcional)
Ve a tu repositorio > Settings > Secrets and variables > Actions:
- `DOCKERHUB_USERNAME`: Tu usuario de Docker Hub
- `DOCKERHUB_TOKEN`: Token de Docker Hub
- `SLACK_WEBHOOK_URL`: (Opcional) Para notificaciones

### 4. Verificar GitHub Actions
1. Ve a la pestaña "Actions" en tu repositorio
2. Verifica que los workflows estén funcionando
3. Los builds se ejecutarán automáticamente

## 🐳 Comandos Útiles

```bash
# Ver versiones actuales
./scripts/version-manager.sh show

# Actualizar versión
./scripts/version-manager.sh update backend 1.1.0

# Construir imágenes localmente
./scripts/version-manager.sh build production

# Crear release
git tag v1.0.0
git push origin v1.0.0
```

## 📚 Documentación
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Configuración completa
- [README.md](./README.md) - Documentación principal

---
Generado automáticamente el $(date)
EOF

    print_message "Archivo GITHUB_INSTRUCTIONS.md creado ✓"
}

# Función para mostrar resumen
show_summary() {
    print_header
    echo -e "✅ ${GREEN}Configuración automática completada${NC}"
    echo ""
    echo -e "${BLUE}Lo que se configuró:${NC}"
    echo "• Usuario de Git configurado"
    echo "• Repositorio Git inicializado"
    echo "• Commit inicial realizado"
    echo "• Archivo de instrucciones creado"
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo "1. Crear repositorio en GitHub (ver GITHUB_INSTRUCTIONS.md)"
    echo "2. Conectar repositorio local con GitHub"
    echo "3. Configurar secrets en GitHub (opcional)"
    echo ""
    echo -e "${BLUE}Comandos para continuar:${NC}"
    echo "• Ver instrucciones: cat GITHUB_INSTRUCTIONS.md"
    echo "• Ver versiones: ./scripts/version-manager.sh show"
    echo "• Construir imágenes: ./scripts/version-manager.sh build production"
    echo ""
    echo -e "${GREEN}¡ControlAcceso listo para GitHub! 🚀${NC}"
}

# Función principal
main() {
    print_header
    print_message "Iniciando configuración automática..."
    
    # Aceptar licencia de Xcode
    if ! accept_xcode_license; then
        print_error "No se pudo aceptar la licencia de Xcode automáticamente."
        print_message "Por favor acepta la licencia manualmente y ejecuta el script nuevamente."
        exit 1
    fi
    
    # Configurar Git
    setup_git
    
    # Inicializar repositorio
    init_repo
    
    # Crear instrucciones
    create_instructions
    
    # Mostrar resumen
    show_summary
}

# Ejecutar función principal
main "$@"
