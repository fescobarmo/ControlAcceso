# 🐛 Fix: Error de Nombre de Imagen Docker

## 📋 Resumen Ejecutivo

**Error**: `could not parse reference: ghcr.io/fescobarmo/ControlAcceso-backend:...`

**Causa Raíz**: Los nombres de imágenes Docker **DEBEN estar completamente en minúsculas**. El workflow utilizaba `${{ github.repository }}` que devuelve `fescobarmo/ControlAcceso` (con mayúscula en la "C").

**Solución**: Cambiar el nombre de la imagen a minúsculas: `controlacceso`

**Impacto**: ❌ **CRÍTICO** - Bloqueaba completamente el build de todas las imágenes

---

## 🔍 Diagnóstico Detallado

### Error Completo

```
2025-10-01T20:17:54Z	FATAL	Fatal error	
run error: image scan error: scan error: unable to initialize a scan service: 
unable to initialize an image scan service: failed to parse the image name: 
could not parse reference: 
ghcr.io/fescobarmo/ControlAcceso-backend:aa9f0e0b946fe5ffc95e04d983fbda65d414cd99

Error: Process completed with exit code 1.
```

### Análisis del Problema

1. **Secuencia de Eventos**:
   ```
   ✅ Checkout del código
   ✅ Setup de Buildx
   ✅ Login a GHCR
   ❌ Build y Push de imagen (FALLA)
   ❌ Trivy scan (FALLA porque imagen no existe)
   ```

2. **Nombre de Imagen Problemático**:
   ```
   ❌ INCORRECTO: ghcr.io/fescobarmo/ControlAcceso-backend:tag
                                     ^
                                     Mayúscula no permitida
   
   ✅ CORRECTO:   ghcr.io/fescobarmo/controlacceso-backend:tag
                                     ^
                                     Todo en minúsculas
   ```

3. **Origen del Problema**:
   ```yaml
   # .github/workflows/docker-build.yml
   env:
     REGISTRY: ghcr.io
     IMAGE_NAME: ${{ github.repository }}  # ❌ Devuelve: fescobarmo/ControlAcceso
   ```

   La variable `github.repository` devuelve el nombre completo del repositorio tal como está en GitHub, **preservando mayúsculas**.

---

## ✅ Solución Implementada

### Cambio en `docker-build.yml`

```yaml
# ANTES (❌ Incorrecto)
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}  # fescobarmo/ControlAcceso

# DESPUÉS (✅ Correcto)
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/controlacceso  # fescobarmo/controlacceso
```

### Cambio en `dockerhub-push.yml`

```yaml
# YA ESTABA CORRECTO ✅
env:
  DOCKERHUB_NAMESPACE: tu-usuario
  IMAGE_NAME: controlacceso  # Ya estaba en minúsculas
```

---

## 📚 Reglas de Nomenclatura de Imágenes Docker

### Restricciones de Docker Registry

1. **Caracteres permitidos**:
   - Letras minúsculas (a-z)
   - Números (0-9)
   - Guiones (-)
   - Guiones bajos (_)
   - Puntos (.) - solo como separadores, no al inicio/final

2. **Caracteres NO permitidos**:
   - ❌ Letras mayúsculas (A-Z)
   - ❌ Espacios
   - ❌ Caracteres especiales (@, #, $, %, etc.)

3. **Estructura válida**:
   ```
   [registry/][namespace/]repository[:tag]
   
   Ejemplos válidos:
   ✅ ghcr.io/usuario/app:1.0.0
   ✅ docker.io/miapp:latest
   ✅ registry.example.com/project/service:v2
   
   Ejemplos inválidos:
   ❌ ghcr.io/Usuario/App:1.0.0        (mayúsculas)
   ❌ docker.io/mi app:latest          (espacio)
   ❌ registry.com/proyecto@servicio:v2 (@ no permitido)
   ```

---

## 🎯 Alternativas de Solución

### Opción 1: Usar nombre fijo en minúsculas (✅ Implementada)

```yaml
env:
  IMAGE_NAME: ${{ github.repository_owner }}/controlacceso
```

**Pros**:
- Simple y directo
- Control total sobre el nombre
- Sin dependencias adicionales

**Contras**:
- Necesitas actualizar manualmente si cambias el nombre del repo

### Opción 2: Convertir a minúsculas dinámicamente

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Set lowercase image name
        id: image-name
        run: |
          echo "IMAGE_NAME=$(echo ${{ github.repository }} | tr '[:upper:]' '[:lower:]')" >> $GITHUB_OUTPUT
      
      - name: Build image
        uses: docker/build-push-action@v5
        with:
          tags: ghcr.io/${{ steps.image-name.outputs.IMAGE_NAME }}:${{ github.sha }}
```

**Pros**:
- Dinámico, se adapta al nombre del repositorio
- Funciona aunque cambies el nombre del repo

**Contras**:
- Más complejo
- Requiere un paso adicional

### Opción 3: Usar `github.event.repository.name` en minúsculas

```yaml
env:
  IMAGE_NAME: ${{ github.repository_owner }}/${{ github.event.repository.name }}
```

**Nota**: Esto NO funciona porque `github.event.repository.name` también preserva mayúsculas.

---

## 🧪 Verificación

### 1. Verificar construcción local

```bash
# Probar construcción con el nombre correcto
docker build -t ghcr.io/fescobarmo/controlacceso-backend:test ./backend

# Verificar que el nombre es válido
docker images | grep controlacceso
```

### 2. Verificar en GitHub Actions

Después de hacer push, verifica:

1. **Job `build-and-push (backend)`**:
   ```
   ✅ Login to GitHub Container Registry
   ✅ Build and push Docker image
   ✅ Image reference: ghcr.io/fescobarmo/controlacceso-backend:sha
   ```

2. **Job `security-scan`**:
   ```
   ✅ Run Trivy scan
   ✅ Found image: ghcr.io/fescobarmo/controlacceso-backend:sha
   ✅ Upload SARIF report
   ```

3. **Verificar en GHCR**:
   - Ve a: https://github.com/fescobarmo?tab=packages
   - Deberías ver: `controlacceso-backend`, `controlacceso-frontend`, `controlacceso-database`
   - Todos con nombres en minúsculas

---

## 📊 Comparación: Antes vs Después

### Antes (❌ Fallando)

```yaml
# Workflow
env:
  IMAGE_NAME: ${{ github.repository }}  # ControlAcceso

# Resultado
ghcr.io/fescobarmo/ControlAcceso-backend:tag
                   ^
                   ❌ MAYÚSCULA - FALLA

# Log de error
FATAL: could not parse reference: ghcr.io/fescobarmo/ControlAcceso-backend:...
```

### Después (✅ Funcionando)

```yaml
# Workflow
env:
  IMAGE_NAME: ${{ github.repository_owner }}/controlacceso

# Resultado
ghcr.io/fescobarmo/controlacceso-backend:tag
                   ^
                   ✅ MINÚSCULAS - FUNCIONA

# Log de éxito
Successfully pushed ghcr.io/fescobarmo/controlacceso-backend:...
```

---

## 🚨 Lecciones Aprendidas

1. **Siempre usar minúsculas en nombres de imágenes Docker**
   - Evita usar directamente `${{ github.repository }}`
   - Convierte a minúsculas o usa nombres fijos

2. **GitHub Container Registry es estricto con nomenclatura**
   - No como Docker Hub que a veces tolera mayúsculas
   - Sigue estrictamente la especificación OCI

3. **El nombre del repositorio NO determina el nombre de la imagen**
   - Puedes tener `MiRepoConMayusculas` en GitHub
   - Pero la imagen debe ser `mi-repo-con-minusculas`

4. **Debugging efectivo**
   - El error de Trivy fue una pista secundaria
   - El error real estaba en el build anterior
   - Siempre revisa los logs completos desde el inicio

---

## 📝 Checklist de Verificación

Antes de hacer push de cambios a workflows, verifica:

- [ ] Todos los nombres de imágenes están en minúsculas
- [ ] No hay mayúsculas en tags de imágenes
- [ ] Los namespaces están en minúsculas
- [ ] Prueba construcción local con el nombre exacto
- [ ] Verifica que el registry acepta el nombre

---

## 🔗 Referencias

- [Docker Image Specification](https://docs.docker.com/engine/reference/commandline/tag/#extended-description)
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec/blob/main/spec.md)
- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Context Variables](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context)

---

## 📅 Historial de Cambios

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 2025-10-01 | 1.0.0 | Fix inicial: Cambio a minúsculas en IMAGE_NAME | ControlAcceso Team |
| 2025-10-01 | 1.1.0 | Documentación completa del error y solución | ControlAcceso Team |

---

## ✅ Estado

- [x] Error identificado
- [x] Causa raíz determinada
- [x] Solución implementada
- [x] Documentación creada
- [ ] Cambios pusheados a GitHub
- [ ] Workflow verificado funcionando

---

**Próximo paso**: Hacer commit y push de los cambios al repositorio para que el workflow funcione correctamente.

