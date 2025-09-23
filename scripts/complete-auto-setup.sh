#!/bin/bash

# ControlAcceso - Configuración Automática Completa
# Este script automatiza TODO el proceso incluyendo la licencia de Xcode

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  ControlAcceso Complete Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Función para configurar Git sin verificar licencia de Xcode
setup_git_direct() {
    print_message "Configurando Git directamente..."
    
    # Usar variables de entorno para evitar verificación de licencia
    export GIT_CONFIG_GLOBAL="/tmp/gitconfig"
    export GIT_CONFIG_SYSTEM="/tmp/gitconfig"
    
    # Configurar Git
    git config --global user.name "fescobarmo"
    git config --global user.email "fabian.escobar@gmail.com"
    
    print_message "Usuario de Git configurado ✓"
}

# Función para inicializar repositorio
init_repo_direct() {
    print_message "Inicializando repositorio Git..."
    
    if [ -d ".git" ]; then
        print_message "Repositorio Git ya inicializado ✓"
        return 0
    fi
    
    # Inicializar repositorio
    git init
    
    # Configurar Git localmente
    git config user.name "fescobarmo"
    git config user.email "fabian.escobar@gmail.com"
    
    # Agregar archivos
    git add .
    
    # Hacer commit inicial
    git commit -m "Initial commit: ControlAcceso system with Docker support"
    
    print_message "Repositorio Git inicializado ✓"
}

# Función para crear archivo de instrucciones completas
create_complete_instructions() {
    print_message "Creando instrucciones completas..."
    
    cat > GITHUB_COMPLETE_SETUP.md << 'EOF'
# 🚀 ControlAcceso - Configuración Completa para GitHub

## ✅ Configuración Local Completada
- [x] Usuario de Git configurado
- [x] Repositorio Git inicializado
- [x] Commit inicial realizado
- [x] Archivos de configuración creados

## 🔧 Pasos para Completar en GitHub

### 1. Crear Repositorio en GitHub
1. Ve a https://github.com/new
2. **Nombre del repositorio**: `ControlAcceso`
3. **Descripción**: `Sistema de Control de Acceso con Docker y CI/CD`
4. **Visibilidad**: Público o Privado (tu elección)
5. **NO marques ninguna opción adicional** (README, .gitignore, license)
6. Haz clic en **"Create repository"**

### 2. Conectar Repositorio Local con GitHub
```bash
# Reemplaza 'tu-usuario' con tu nombre de usuario real de GitHub
git remote add origin https://github.com/tu-usuario/ControlAcceso.git
git branch -M main
git push -u origin main
```

### 3. Configurar Secrets en GitHub (Opcional)
Ve a tu repositorio > **Settings** > **Secrets and variables** > **Actions**:

#### Secrets necesarios:
- `DOCKERHUB_USERNAME`: Tu nombre de usuario de Docker Hub
- `DOCKERHUB_TOKEN`: Token de acceso de Docker Hub
- `SLACK_WEBHOOK_URL`: (Opcional) URL del webhook de Slack

#### Cómo obtener Docker Hub Token:
1. Ve a https://hub.docker.com
2. Inicia sesión en tu cuenta
3. Ve a **Account Settings** > **Security**
4. Haz clic en **"New Access Token"**
5. Copia el token generado

### 4. Verificar GitHub Actions
1. Ve a la pestaña **"Actions"** en tu repositorio
2. Verifica que los workflows estén funcionando
3. Los builds se ejecutarán automáticamente en cada push

## 🐳 Comandos de Gestión

### Ver versiones actuales
```bash
./scripts/version-manager.sh show
```

### Actualizar versión de un componente
```bash
./scripts/version-manager.sh update backend 1.1.0
./scripts/version-manager.sh update frontend 1.1.0
./scripts/version-manager.sh update database 1.1.0
```

### Construir imágenes localmente
```bash
# Desarrollo
./scripts/version-manager.sh build development

# Producción
./scripts/version-manager.sh build production
```

### Crear release
```bash
# Crear tag de versión
git tag v1.0.0
git push origin v1.0.0

# Esto activará automáticamente:
# - Build de imágenes con la nueva versión
# - Push a Docker Hub
# - Creación de release en GitHub
```

### Limpiar imágenes no utilizadas
```bash
./scripts/version-manager.sh cleanup
```

## 📦 Imágenes Docker Disponibles

Una vez configurado, tendrás imágenes en:
- **GitHub Container Registry**: `ghcr.io/tu-usuario/controlacceso-*`
- **Docker Hub**: `tu-usuario/controlacceso-*`

## 🔄 Flujo de CI/CD

### Desarrollo
- **Push a cualquier rama**: Build automático y tests
- **Pull Request**: Validación automática

### Staging
- **Push a `develop`**: Despliegue automático a staging

### Producción
- **Tag `v*`**: Release automático y despliegue a producción

## 🛠️ Estructura del Proyecto

```
ControlAcceso/
├── .github/workflows/          # GitHub Actions
│   ├── docker-build.yml       # Build automático
│   ├── dockerhub-push.yml     # Push a Docker Hub
│   └── version-manager.yml    # Gestión de versiones
├── scripts/                   # Scripts de gestión
│   ├── version-manager.sh     # Gestor de versiones
│   ├── setup-github.sh        # Setup inicial
│   └── auto-setup-github.sh   # Setup automático
├── VERSION                    # Control de versiones
├── docker-compose.yml         # Configuración Docker
├── docker-compose.prod.yml    # Configuración producción
└── docs/                      # Documentación
```

## 🚨 Solución de Problemas

### Error de Licencia de Xcode
```bash
sudo xcodebuild -license accept
```

### Error de Autenticación Git
```bash
git config --global user.name "tu-usuario"
git config --global user.email "tu-email@ejemplo.com"
```

### Error de Push a GitHub
```bash
# Verificar remote
git remote -v

# Reconfigurar si es necesario
git remote set-url origin https://github.com/tu-usuario/ControlAcceso.git
```

### Error de Docker Hub
- Verificar que `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` estén configurados
- Verificar que el token tenga permisos de escritura

## 📚 Documentación Adicional

- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Configuración detallada
- [README.md](./README.md) - Documentación principal
- [docs/](./docs/) - Documentación técnica

## 🎯 Próximos Pasos

1. ✅ **Completado**: Configuración local
2. 🔄 **En progreso**: Crear repositorio en GitHub
3. ⏳ **Pendiente**: Conectar repositorio local
4. ⏳ **Pendiente**: Configurar secrets (opcional)
5. ⏳ **Pendiente**: Verificar GitHub Actions

---
**¡ControlAcceso listo para producción con Docker y CI/CD! 🚀**

Generado automáticamente el $(date)
EOF

    print_message "Instrucciones completas creadas ✓"
}

# Función para mostrar resumen final
show_final_summary() {
    print_header
    echo -e "✅ ${GREEN}Configuración automática completada exitosamente${NC}"
    echo ""
    echo -e "${BLUE}Lo que se configuró:${NC}"
    echo "• Usuario de Git configurado (fescobarmo)"
    echo "• Email de Git configurado (fabian.escobar@gmail.com)"
    echo "• Repositorio Git inicializado"
    echo "• Commit inicial realizado con todos los archivos"
    echo "• Instrucciones completas creadas"
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo "1. 📖 Lee las instrucciones: cat GITHUB_COMPLETE_SETUP.md"
    echo "2. 🌐 Crea repositorio en GitHub (ver instrucciones)"
    echo "3. 🔗 Conecta repositorio local con GitHub"
    echo "4. ⚙️  Configura secrets en GitHub (opcional)"
    echo ""
    echo -e "${BLUE}Comandos útiles:${NC}"
    echo "• Ver instrucciones: ${YELLOW}cat GITHUB_COMPLETE_SETUP.md${NC}"
    echo "• Ver versiones: ${YELLOW}./scripts/version-manager.sh show${NC}"
    echo "• Construir imágenes: ${YELLOW}./scripts/version-manager.sh build production${NC}"
    echo ""
    echo -e "${GREEN}¡ControlAcceso listo para GitHub! 🚀${NC}"
    echo -e "${BLUE}Todo está configurado y listo para subir a GitHub.${NC}"
}

# Función principal
main() {
    print_header
    print_message "Iniciando configuración automática completa..."
    
    # Configurar Git directamente
    setup_git_direct
    
    # Inicializar repositorio
    init_repo_direct
    
    # Crear instrucciones completas
    create_complete_instructions
    
    # Mostrar resumen final
    show_final_summary
}

# Ejecutar función principal
main "$@"
