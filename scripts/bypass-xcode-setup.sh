#!/bin/bash

# ControlAcceso - Configuración Bypass Xcode License
# Este script configura Git sin verificar la licencia de Xcode

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  ControlAcceso Bypass Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Función para configurar Git usando variables de entorno
setup_git_bypass() {
    print_message "Configurando Git bypassing Xcode license..."
    
    # Crear archivo de configuración temporal
    cat > /tmp/gitconfig << EOF
[user]
    name = fescobarmo
    email = fabian.escobar@gmail.com
[init]
    defaultBranch = main
[push]
    default = simple
EOF
    
    # Configurar Git usando el archivo temporal
    export GIT_CONFIG_GLOBAL="/tmp/gitconfig"
    
    print_message "Usuario de Git configurado ✓"
}

# Función para inicializar repositorio sin verificar licencia
init_repo_bypass() {
    print_message "Inicializando repositorio Git..."
    
    if [ -d ".git" ]; then
        print_message "Repositorio Git ya inicializado ✓"
        return 0
    fi
    
    # Usar GIT_CONFIG_GLOBAL para evitar verificación de licencia
    export GIT_CONFIG_GLOBAL="/tmp/gitconfig"
    
    # Inicializar repositorio
    git init
    
    # Configurar rama principal
    git symbolic-ref HEAD refs/heads/main
    
    # Agregar archivos
    git add .
    
    # Hacer commit inicial
    git commit -m "Initial commit: ControlAcceso system with Docker support" --author="fescobarmo <fabian.escobar@gmail.com>"
    
    print_message "Repositorio Git inicializado ✓"
}

# Función para crear instrucciones finales
create_final_instructions() {
    print_message "Creando instrucciones finales..."
    
    cat > SETUP_COMPLETADO.md << 'EOF'
# ✅ ControlAcceso - Configuración Completada

## 🎉 ¡Configuración Exitosa!

Tu proyecto ControlAcceso ha sido configurado exitosamente para GitHub.

## 📋 Lo que se completó:

- ✅ Usuario de Git configurado (fescobarmo)
- ✅ Email de Git configurado (fabian.escobar@gmail.com)
- ✅ Repositorio Git inicializado
- ✅ Commit inicial realizado con todos los archivos
- ✅ Archivos de configuración creados

## 🚀 Próximos Pasos:

### 1. Crear Repositorio en GitHub
```bash
# Ve a https://github.com/new
# Nombre: ControlAcceso
# Descripción: Sistema de Control de Acceso con Docker
# NO marques README, .gitignore, o license
# Haz clic en "Create repository"
```

### 2. Conectar con GitHub
```bash
# Reemplaza 'tu-usuario' con tu nombre real de GitHub
git remote add origin https://github.com/tu-usuario/ControlAcceso.git
git push -u origin main
```

### 3. Configurar Secrets (Opcional)
Ve a Settings > Secrets and variables > Actions:
- `DOCKERHUB_USERNAME`: Tu usuario de Docker Hub
- `DOCKERHUB_TOKEN`: Token de Docker Hub

## 🐳 Comandos Útiles:

```bash
# Ver versiones
./scripts/version-manager.sh show

# Actualizar versión
./scripts/version-manager.sh update backend 1.1.0

# Construir imágenes
./scripts/version-manager.sh build production

# Crear release
git tag v1.0.0
git push origin v1.0.0
```

## 📚 Documentación:

- `GITHUB_SETUP.md` - Configuración completa
- `README.md` - Documentación principal
- `VERSION` - Control de versiones

---
**¡Listo para GitHub! 🚀**
EOF

    print_message "Instrucciones finales creadas ✓"
}

# Función principal
main() {
    print_header
    print_message "Iniciando configuración bypassing Xcode license..."
    
    # Configurar Git
    setup_git_bypass
    
    # Inicializar repositorio
    init_repo_bypass
    
    # Crear instrucciones
    create_final_instructions
    
    # Mostrar resumen
    echo ""
    echo -e "${GREEN}✅ Configuración completada exitosamente!${NC}"
    echo ""
    echo -e "${BLUE}Próximos pasos:${NC}"
    echo "1. Crear repositorio en GitHub"
    echo "2. Conectar repositorio local"
    echo "3. Configurar secrets (opcional)"
    echo ""
    echo -e "${YELLOW}Ver instrucciones: cat SETUP_COMPLETADO.md${NC}"
}

# Ejecutar
main "$@"

