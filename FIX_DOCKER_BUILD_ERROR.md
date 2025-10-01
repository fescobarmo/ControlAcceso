# Fix: Error en Docker Build del Backend

> ⚠️ **NOTA IMPORTANTE**: Este documento describe el **primer intento de solución**. 
> El error real era el **nombre de imagen con mayúsculas**. Ver: `FIX_DOCKER_IMAGE_NAME_ERROR.md`
> 
> Sin embargo, el fix de multi-platform también era necesario y válido.

## ❌ Error Reportado

```
Error: Process completed with exit code 1.
Job: build-and-push (backend)
```

## 🔍 Causas Probables

### Causa 1: Build Multi-Plataforma Fallando

El workflow intenta construir para ambas plataformas:
```yaml
platforms: linux/amd64,linux/arm64
```

Los módulos nativos de Node.js (como `bcrypt`) pueden fallar al compilar para ARM64.

### Causa 2: Package-lock.json Desactualizado

El archivo `package-lock.json` podría tener inconsistencias con `package.json`.

### Causa 3: Dependencias Nativas

Paquetes como `bcrypt` requieren compilación nativa y pueden fallar en ciertos entornos.

---

## ✅ Soluciones

### Solución 1: Remover Plataforma ARM64 (RÁPIDA)

Si no necesitas soporte para ARM64, construye solo para AMD64:

```yaml
# .github/workflows/docker-build.yml
- name: Construir y hacer push de imagen Docker
  uses: docker/build-push-action@v5
  with:
    context: ./${{ matrix.service }}
    file: ./${{ matrix.service }}/Dockerfile
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    build-args: |
      NODE_VERSION=${{ env.NODE_VERSION }}
      POSTGRES_VERSION=${{ env.POSTGRES_VERSION }}
      NGINX_VERSION=${{ env.NGINX_VERSION }}
      BACKEND_VERSION=${{ env.BACKEND_VERSION }}
      FRONTEND_VERSION=${{ env.FRONTEND_VERSION }}
      DATABASE_VERSION=${{ env.DATABASE_VERSION }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64  # ⬅️ Solo AMD64
```

### Solución 2: Fix para Build Multi-Plataforma

Si necesitas ARM64, agrega QEMU setup explícito:

```yaml
# .github/workflows/docker-build.yml
steps:
- name: Checkout código
  uses: actions/checkout@v4
  with:
    fetch-depth: 0

- name: Set up QEMU  # ⬅️ AGREGAR ESTO
  uses: docker/setup-qemu-action@v3
  with:
    platforms: arm64

- name: Configurar Docker Buildx
  uses: docker/setup-buildx-action@v3
```

### Solución 3: Usar bcryptjs en Lugar de bcrypt

`bcryptjs` es una implementación en JavaScript puro (sin compilación nativa):

```json
// backend/package.json
{
  "dependencies": {
    // "bcrypt": "^6.0.0",  ⬅️ Comentar o remover
    "bcryptjs": "^2.4.3",   ⬅️ Usar solo este
    ...
  }
}
```

Luego actualiza tu código:

```javascript
// Antes
const bcrypt = require('bcrypt');

// Después (mismo API)
const bcrypt = require('bcryptjs');
```

### Solución 4: Actualizar package-lock.json

```bash
cd backend
rm -f package-lock.json
npm install
git add package-lock.json
git commit -m "fix: actualizar package-lock.json"
git push
```

### Solución 5: Agregar Retry al Build

Agrega reintentos automáticos en caso de fallos temporales:

```yaml
# .github/workflows/docker-build.yml
- name: Construir y hacer push de imagen Docker
  uses: docker/build-push-action@v5
  with:
    context: ./${{ matrix.service }}
    file: ./${{ matrix.service }}/Dockerfile
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    build-args: |
      NODE_VERSION=${{ env.NODE_VERSION }}
      POSTGRES_VERSION=${{ env.POSTGRES_VERSION }}
      NGINX_VERSION=${{ env.NGINX_VERSION }}
      BACKEND_VERSION=${{ env.BACKEND_VERSION }}
      FRONTEND_VERSION=${{ env.FRONTEND_VERSION }}
      DATABASE_VERSION=${{ env.DATABASE_VERSION }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64,linux/arm64
  continue-on-error: false
  timeout-minutes: 30  # ⬅️ Agregar timeout
```

### Solución 6: Verificar Variables de Entorno

Asegúrate de que el archivo VERSION se lee correctamente:

```yaml
# .github/workflows/docker-build.yml
- name: Cargar variables de versión
  run: |
    if [ ! -f VERSION ]; then
      echo "❌ Archivo VERSION no encontrado"
      exit 1
    fi
    echo "✅ Archivo VERSION encontrado"
    cat VERSION
    echo "SYSTEM_VERSION=$(grep '^SYSTEM_VERSION=' VERSION | cut -d'=' -f2)" >> $GITHUB_ENV
    echo "BACKEND_VERSION=$(grep '^BACKEND_VERSION=' VERSION | cut -d'=' -f2)" >> $GITHUB_ENV
    echo "FRONTEND_VERSION=$(grep '^FRONTEND_VERSION=' VERSION | cut -d'=' -f2)" >> $GITHUB_ENV
    echo "DATABASE_VERSION=$(grep '^DATABASE_VERSION=' VERSION | cut -d'=' -f2)" >> $GITHUB_ENV
    echo "NODE_VERSION=$(grep '^NODE_VERSION=' VERSION | cut -d'=' -f2)" >> $GITHUB_ENV
    echo "POSTGRES_VERSION=$(grep '^POSTGRES_VERSION=' VERSION | cut -d'=' -f2)" >> $GITHUB_ENV
    echo "NGINX_VERSION=$(grep '^NGINX_VERSION=' VERSION | cut -d'=' -f2)" >> $GITHUB_ENV

- name: Debug - Mostrar variables
  run: |
    echo "BACKEND_VERSION: ${{ env.BACKEND_VERSION }}"
    echo "NODE_VERSION: ${{ env.NODE_VERSION }}"
```

---

## 🔧 Solución Recomendada (Combinada)

Aplica estos cambios en orden:

### Paso 1: Actualizar Workflow (Solo AMD64)

```yaml
# .github/workflows/docker-build.yml
platforms: linux/amd64  # Cambiar de linux/amd64,linux/arm64
```

### Paso 2: Agregar Debug al Workflow

```yaml
- name: Debug - Contexto del build
  run: |
    echo "Service: ${{ matrix.service }}"
    echo "Context: ./${{ matrix.service }}"
    echo "Dockerfile: ./${{ matrix.service }}/Dockerfile"
    ls -la ./${{ matrix.service }}/
```

### Paso 3: Probar Localmente Primero

```bash
# En tu máquina
cd /Users/fescobarmo/ControlAcceso

# Build local
docker build -t test-backend:local -f backend/Dockerfile backend/

# Si funciona, hacer push
git add .github/workflows/docker-build.yml
git commit -m "fix(workflows): construir solo para linux/amd64"
git push origin main
```

---

## 🐛 Debug Avanzado

### Ver Logs Completos en GitHub

1. Ve a: `https://github.com/tu-usuario/ControlAcceso/actions`
2. Click en el workflow fallido
3. Click en el job "build-and-push (backend)"
4. Expande cada paso para ver errores específicos

### Buscar Errores Comunes

```bash
# En los logs, busca:
- "npm ERR!"          → Error de npm
- "error building"    → Error de Docker
- "no space left"     → Sin espacio en disco
- "killed"            → Out of memory
- "COPY failed"       → Problema con archivos
```

### Reproducir Localmente con Mismas Condiciones

```bash
# Usar las mismas versiones que GitHub Actions
docker build \
  --build-arg NODE_VERSION=18-alpine \
  --build-arg BACKEND_VERSION=1.0.0 \
  --platform linux/amd64 \
  -t test-backend:local \
  -f backend/Dockerfile \
  backend/
```

---

## 📊 Checklist de Diagnóstico

Revisa cada punto:

- [ ] ¿El Dockerfile tiene sintaxis correcta?
- [ ] ¿package.json y package-lock.json están sincronizados?
- [ ] ¿Todas las dependencias existen en npm?
- [ ] ¿El archivo VERSION existe y está formateado correctamente?
- [ ] ¿El build funciona localmente?
- [ ] ¿QEMU está configurado para multi-plataforma?
- [ ] ¿Hay suficiente espacio/memoria en GitHub Actions?
- [ ] ¿Los archivos .dockerignore no excluyen archivos necesarios?

---

## 🚀 Implementación Rápida

### Opción A: Solo AMD64 (Más Rápido)

```bash
# 1. Editar workflow
code .github/workflows/docker-build.yml

# 2. Cambiar línea 82
# De:
platforms: linux/amd64,linux/arm64
# A:
platforms: linux/amd64

# 3. Commit y push
git add .github/workflows/docker-build.yml
git commit -m "fix: build solo para AMD64"
git push origin main
```

### Opción B: Fix Multi-Plataforma (Completo)

```bash
# 1. Editar workflow
code .github/workflows/docker-build.yml

# 2. Agregar después de Checkout:
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3
  with:
    platforms: arm64

# 3. Commit y push
git add .github/workflows/docker-build.yml
git commit -m "fix: agregar QEMU para builds multi-plataforma"
git push origin main
```

---

## 📝 Notas Adicionales

### ¿Por qué Falla ARM64?

- **Módulos nativos:** bcrypt, node-gyp, etc. necesitan compilación
- **Emulación:** QEMU emula ARM64 pero puede ser lento/inestable
- **Cache:** Cache de GitHub Actions puede no funcionar bien con emulación

### ¿Necesitas ARM64?

**Sí si:**
- Despliegas en servidores ARM (AWS Graviton, Apple Silicon servers)
- Quieres máxima portabilidad

**No si:**
- Solo despliegas en servidores x86_64 tradicionales
- Quieres builds más rápidos y confiables

### Alternativas a bcrypt Nativo

```javascript
// bcryptjs (JavaScript puro - multi-plataforma)
const bcrypt = require('bcryptjs');

// argon2 (alternativa moderna, también necesita compilación)
const argon2 = require('argon2');

// scrypt (nativo de Node.js, sin dependencias externas)
const crypto = require('crypto');
```

---

## 🔗 Referencias

- [Docker Buildx Multi-Platform](https://docs.docker.com/build/building/multi-platform/)
- [QEMU GitHub Action](https://github.com/docker/setup-qemu-action)
- [bcryptjs vs bcrypt](https://www.npmjs.com/package/bcryptjs)
- [GitHub Actions Limits](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration)

---

**Fecha:** 2025-10-01  
**Estado:** Pendiente de aplicar solución

