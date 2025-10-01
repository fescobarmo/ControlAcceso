# Troubleshooting: GitHub Actions Workflows

## 📋 Índice

1. [Error: Job depends on unknown job](#error-job-depends-on-unknown-job)
2. [Error: Acciones Deprecadas](#error-acciones-deprecadas)
3. [Errores Comunes de YAML](#errores-comunes-de-yaml)
4. [Problemas con Matrix Strategy](#problemas-con-matrix-strategy)
5. [Errores de Permisos](#errores-de-permisos)
6. [Timeout y Límites](#timeout-y-límites)
7. [Cómo Debuggear Workflows](#cómo-debuggear-workflows)

---

## Error: Job depends on unknown job

### ❌ Error Reportado

```
(Line: 140, Col: 13): Job 'notify-teams' depends on unknown job 'build-and-push'.
```

### 🔍 Causas Posibles

#### Causa 1: Job no existe

El job referenciado simplemente no está definido en el workflow.

**Ejemplo de error:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - run: echo "Building..."
  
  deploy:
    needs: build-and-push  # ❌ ERROR: 'build-and-push' no existe
    runs-on: ubuntu-latest
    steps:
    - run: echo "Deploying..."
```

**Solución:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - run: echo "Building..."
  
  deploy:
    needs: build  # ✅ CORRECTO: Referencia al job correcto
    runs-on: ubuntu-latest
    steps:
    - run: echo "Deploying..."
```

#### Causa 2: Error de Tipeo

El nombre del job está mal escrito en la dependencia.

**Ejemplo de error:**
```yaml
jobs:
  build-and-push:  # Nombre correcto
    runs-on: ubuntu-latest
    steps:
    - run: echo "Building..."
  
  notify:
    needs: build_and_push  # ❌ ERROR: Guión bajo en vez de guión
    runs-on: ubuntu-latest
```

**Solución:**
```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
    - run: echo "Building..."
  
  notify:
    needs: build-and-push  # ✅ CORRECTO: Nombre exacto
    runs-on: ubuntu-latest
```

#### Causa 3: Job con Matrix Strategy

Cuando un job usa `strategy: matrix`, otros jobs que dependen de él necesitan manejarlo correctamente.

**Ejemplo de error:**
```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [backend, frontend, database]
    steps:
    - run: echo "Building ${{ matrix.service }}"
  
  notify-teams:
    needs: build-and-push  # ⚠️ Funciona, pero espera a TODOS los builds
    runs-on: ubuntu-latest
```

**Esto es correcto, pero ten en cuenta:**
- `notify-teams` esperará a que TODOS los servicios (backend, frontend, database) terminen
- Si uno falla, `notify-teams` no se ejecutará

**Si quieres ejecutar después de cada build individual:**
```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [backend, frontend, database]
    steps:
    - run: echo "Building ${{ matrix.service }}"
    
    - name: Notify per service
      if: always()  # Se ejecuta aunque falle
      run: echo "Build de ${{ matrix.service }} terminó"
```

#### Causa 4: Indentación Incorrecta

YAML es muy sensible a la indentación.

**Ejemplo de error:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
  
 notify:  # ❌ ERROR: Indentación incorrecta (1 espacio en vez de 2)
    needs: build
    runs-on: ubuntu-latest
```

**Solución:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
  
  notify:  # ✅ CORRECTO: 2 espacios de indentación
    needs: build
    runs-on: ubuntu-latest
```

---

## Error: Acciones Deprecadas

### ❌ Error Reportado

```
This request has been automatically failed because it uses a deprecated version of `actions/upload-artifact: v3`. 
Learn more: https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/
```

### 🔍 ¿Qué significa?

GitHub periódicamente actualiza sus acciones y depreca versiones antiguas por:
- Mejoras de seguridad
- Mejor rendimiento
- Nuevas características
- Corrección de bugs críticos

### 📋 Acciones Comúnmente Deprecadas

#### 1. `actions/upload-artifact@v3` → `@v4`

**Problema:**
```yaml
- name: Subir artefacto
  uses: actions/upload-artifact@v3  # ❌ Deprecada desde abril 2024
  with:
    name: mi-artefacto
    path: archivo.txt
```

**Solución:**
```yaml
- name: Subir artefacto
  uses: actions/upload-artifact@v4  # ✅ Versión actual
  with:
    name: mi-artefacto
    path: archivo.txt
```

**Cambios en v4:**
- Mejor rendimiento (hasta 10x más rápido)
- Artefactos agrupados por workflow run
- Mejor manejo de grandes archivos
- API mejorada

#### 2. `actions/download-artifact@v3` → `@v4`

**Problema:**
```yaml
- name: Descargar artefacto
  uses: actions/download-artifact@v3  # ❌ Deprecada
  with:
    name: mi-artefacto
```

**Solución:**
```yaml
- name: Descargar artefacto
  uses: actions/download-artifact@v4  # ✅ Versión actual
  with:
    name: mi-artefacto
```

#### 3. `actions/create-release@v1` → `softprops/action-gh-release@v1`

**Problema:**
```yaml
- name: Crear release
  uses: actions/create-release@v1  # ❌ Deprecada y no mantenida
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    tag_name: ${{ github.ref }}
    release_name: Release v1.0.0
```

**Solución Opción 1 - Action moderna:**
```yaml
- name: Crear release
  uses: softprops/action-gh-release@v1  # ✅ Mantenida activamente
  with:
    tag_name: ${{ github.ref }}
    name: Release v1.0.0
    body_path: CHANGELOG.md
    draft: false
    prerelease: false
    token: ${{ secrets.GITHUB_TOKEN }}
```

**Solución Opción 2 - GitHub CLI:**
```yaml
- name: Crear release
  run: |
    gh release create ${{ github.ref_name }} \
      --title "Release v1.0.0" \
      --notes-file CHANGELOG.md
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 4. `actions/setup-node@v2` → `@v4`

**Problema:**
```yaml
- uses: actions/setup-node@v2  # ❌ Versión antigua
  with:
    node-version: '18'
```

**Solución:**
```yaml
- uses: actions/setup-node@v4  # ✅ Versión actual
  with:
    node-version: '18'
    cache: 'npm'  # Bonus: caché integrado
```

#### 5. `actions/cache@v2` → `@v3`

**Problema:**
```yaml
- uses: actions/cache@v2  # ❌ Versión antigua
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

**Solución:**
```yaml
- uses: actions/cache@v3  # ✅ Versión actual
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 🔍 Cómo Encontrar Acciones Deprecadas

#### Opción 1: Revisar Warnings en GitHub

Ve a tu workflow en GitHub Actions:
```
Repository → Actions → [Click en workflow] → Annotations
```

Verás warnings como:
```
⚠️ The following actions uses node12 which is deprecated...
⚠️ The `set-output` command is deprecated...
```

#### Opción 2: Buscar en tu Código

```bash
# Buscar versiones específicas
grep -rn "@v1" .github/workflows/
grep -rn "@v2" .github/workflows/
grep -rn "@v3" .github/workflows/

# Ver todas las acciones y sus versiones
grep -rn "uses:" .github/workflows/ | grep "@v"
```

#### Opción 3: GitHub CLI

```bash
# Ver warnings del último run
gh run view --log | grep -i "warning\|deprecated"
```

### 🛠️ Proceso de Actualización

#### Paso 1: Identificar Versiones Actuales

Visita la página de la acción en GitHub:
```
https://github.com/actions/upload-artifact
```

Ve a la sección "Releases" o "Tags" para ver la última versión.

#### Paso 2: Leer el Changelog

Busca cambios importantes (breaking changes):
```
https://github.com/actions/upload-artifact/blob/main/CHANGELOG.md
```

#### Paso 3: Actualizar y Probar

```bash
# 1. Actualizar en tu código
sed -i 's/@v3/@v4/g' .github/workflows/mi-workflow.yml

# 2. Commit y push
git add .github/workflows/
git commit -m "fix: actualizar actions/upload-artifact a v4"
git push origin main

# 3. Ver resultado en GitHub Actions
```

#### Paso 4: Verificar Compatibilidad

Algunos cambios pueden requerir ajustes:

**Ejemplo - upload-artifact v3 → v4:**

```yaml
# v3 - Paths múltiples
- uses: actions/upload-artifact@v3
  with:
    name: artefactos
    path: |
      dist/
      build/

# v4 - Sintaxis similar (compatible)
- uses: actions/upload-artifact@v4
  with:
    name: artefactos
    path: |
      dist/
      build/
```

### 📊 Matriz de Actualizaciones Comunes

| Acción Deprecada | Versión Actual | Breaking Changes |
|------------------|----------------|------------------|
| `actions/checkout@v2` | `@v4` | Ninguno significativo |
| `actions/setup-node@v2` | `@v4` | Ninguno |
| `actions/cache@v2` | `@v3` | Ninguno |
| `actions/upload-artifact@v3` | `@v4` | Agrupación de artefactos |
| `actions/download-artifact@v3` | `@v4` | Comportamiento de descarga |
| `actions/create-release@v1` | Usar alternativa | Action discontinuada |
| `docker/build-push-action@v3` | `@v5` | Algunas opciones |

### 🔗 Alternativas a Acciones Discontinuadas

#### `actions/create-release` (Discontinuada)

**Alternativa 1 - softprops/action-gh-release:**
```yaml
- uses: softprops/action-gh-release@v1
  with:
    files: dist/*
    generate_release_notes: true
```

**Alternativa 2 - GitHub CLI:**
```yaml
- run: gh release create v1.0.0 --generate-notes
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### `actions/upload-release-asset` (Discontinuada)

Usa `softprops/action-gh-release`:
```yaml
- uses: softprops/action-gh-release@v1
  with:
    files: |
      dist/app.tar.gz
      dist/checksums.txt
```

### ⚠️ Comandos Deprecados

Algunos comandos dentro de workflows también están deprecados:

#### `set-output` (Deprecado)

**Problema:**
```yaml
- run: echo "::set-output name=version::1.0.0"  # ❌ Deprecado
```

**Solución:**
```yaml
- run: echo "version=1.0.0" >> $GITHUB_OUTPUT  # ✅ Método actual
```

#### `save-state` (Deprecado)

**Problema:**
```yaml
- run: echo "::save-state name=key::value"  # ❌ Deprecado
```

**Solución:**
```yaml
- run: echo "key=value" >> $GITHUB_STATE  # ✅ Método actual
```

#### `add-path` (Deprecado)

**Problema:**
```yaml
- run: echo "::add-path::/custom/path"  # ❌ Deprecado
```

**Solución:**
```yaml
- run: echo "/custom/path" >> $GITHUB_PATH  # ✅ Método actual
```

### 📝 Resumen de Nuestras Correcciones

En el proyecto ControlAcceso corregimos:

1. **dockerhub-push.yml:**
   ```yaml
   # Antes
   - uses: actions/upload-artifact@v3
   
   # Después
   - uses: actions/upload-artifact@v4
   ```

2. **version-manager.yml:**
   ```yaml
   # Antes
   - uses: actions/create-release@v1
   
   # Después
   - uses: softprops/action-gh-release@v1
   ```

3. **Corregido job dependencies:**
   ```yaml
   # Antes
   needs: [build-and-push, create-release]  # build-and-push no existe
   
   # Después
   needs: [create-release]  # Solo dependencias existentes
   ```

---

## Errores Comunes de YAML

### Error 1: Mezclar Tabs y Espacios

```yaml
jobs:
  build:
→   runs-on: ubuntu-latest  # ❌ Tab
    steps:
        - run: echo "test"   # ✅ Espacios
```

**Solución:** Usa SOLO espacios, nunca tabs.

### Error 2: Comillas Inconsistentes

```yaml
name: Build "Project"  # ❌ ERROR: Comillas dentro de comillas
name: 'Build "Project"'  # ✅ CORRECTO
name: "Build 'Project'"  # ✅ CORRECTO
name: Build Project      # ✅ CORRECTO (sin espacios especiales)
```

### Error 3: Lista vs Objeto

```yaml
# ❌ ERROR: Mezcla lista y objeto
needs: 
  - build
  condition: always()

# ✅ CORRECTO: Lista simple
needs: [build, test]

# ✅ CORRECTO: Lista con condición
needs: 
  - build
  - test
if: always()
```

### Error 4: Strings Multi-línea

```yaml
# ❌ ERROR: String multi-línea sin formato
run: echo "Line 1
Line 2
Line 3"

# ✅ CORRECTO: Usando |
run: |
  echo "Line 1"
  echo "Line 2"
  echo "Line 3"

# ✅ CORRECTO: Usando >
description: >
  Esta es una descripción larga
  que se juntará en una sola línea
```

---

## Problemas con Matrix Strategy

### Entender Matrix Strategy

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [14, 16, 18]
```

Esto ejecuta **6 jobs** en paralelo:
- ubuntu-latest con Node 14
- ubuntu-latest con Node 16
- ubuntu-latest con Node 18
- windows-latest con Node 14
- windows-latest con Node 16
- windows-latest con Node 18

### Problema: Job que depende de Matrix

```yaml
jobs:
  build:
    strategy:
      matrix:
        service: [backend, frontend, database]
    steps:
    - run: echo "Building ${{ matrix.service }}"
  
  deploy:
    needs: build
    # ⚠️ Espera a que TODOS los builds (3) terminen
    # Si uno falla, deploy no se ejecuta
```

### Solución 1: Continuar aunque falle

```yaml
jobs:
  build:
    strategy:
      matrix:
        service: [backend, frontend, database]
      fail-fast: false  # ✅ Continúa aunque uno falle
    steps:
    - run: echo "Building ${{ matrix.service }}"
  
  deploy:
    needs: build
    if: always()  # ✅ Se ejecuta siempre
```

### Solución 2: Matrix en el Job Dependiente

```yaml
jobs:
  build:
    strategy:
      matrix:
        service: [backend, frontend, database]
    outputs:
      service: ${{ matrix.service }}
    steps:
    - run: echo "Building ${{ matrix.service }}"
  
  deploy:
    needs: build
    strategy:
      matrix:
        service: [backend, frontend, database]
    steps:
    - run: echo "Deploying ${{ matrix.service }}"
```

---

## Errores de Permisos

### Error: Permission denied

```
Error: Resource not accessible by integration
```

**Causa:** El workflow no tiene los permisos necesarios.

**Solución:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read      # Leer código
      packages: write     # Escribir en GitHub Container Registry
      security-events: write  # Subir reportes de seguridad
```

### Permisos Comunes

```yaml
permissions:
  actions: read|write       # Acceso a GitHub Actions
  checks: read|write        # Acceso a checks
  contents: read|write      # Acceso al código
  deployments: read|write   # Acceso a deployments
  issues: read|write        # Acceso a issues
  packages: read|write      # Acceso a GitHub Packages
  pull-requests: read|write # Acceso a PRs
  security-events: write    # Subir escaneos de seguridad
```

---

## Timeout y Límites

### Error: Job exceeded maximum time

**Límites de GitHub Actions:**
- Job: 6 horas máximo
- Workflow: 72 horas máximo
- Ejecuciones paralelas: 20 jobs (free tier)

**Solución:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # ✅ Limitar a 30 minutos
```

### Optimizar Builds Lentos

```yaml
# 1. Usar caché
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# 2. Usar BuildKit cache
- name: Build Docker
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max

# 3. Matrix strategy para paralelizar
strategy:
  matrix:
    service: [backend, frontend, database]
```

---

## Cómo Debuggear Workflows

### 1. Habilitar Debug Logging

En GitHub:
```
Settings → Secrets → Actions → New repository secret

Nombre: ACTIONS_STEP_DEBUG
Valor: true
```

### 2. Agregar Pasos de Debug

```yaml
- name: Debug - Imprimir variables
  run: |
    echo "GitHub Event: ${{ github.event_name }}"
    echo "GitHub Ref: ${{ github.ref }}"
    echo "GitHub SHA: ${{ github.sha }}"
    echo "Runner OS: ${{ runner.os }}"
    
- name: Debug - Listar archivos
  run: |
    pwd
    ls -la
    
- name: Debug - Variables de entorno
  run: env | sort
```

### 3. Usar tmate para SSH Debugging

```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
  if: failure()  # Solo si el workflow falla
```

### 4. Revisar Logs en GitHub

```
Repositorio → Actions → Click en el workflow → Click en el job → Ver logs
```

### 5. Probar Localmente con Act

```bash
# Instalar act (simula GitHub Actions localmente)
brew install act  # macOS
# o
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Ejecutar workflow localmente
act push

# Ejecutar job específico
act -j build

# Simular con secretos
act -s GITHUB_TOKEN=tu_token
```

---

## Validar YAML Localmente

### Opción 1: yamllint

```bash
# Instalar
pip install yamllint

# Validar
yamllint .github/workflows/docker-build.yml
```

### Opción 2: Online

Usa: https://www.yamllint.com/

### Opción 3: VSCode Extension

Instala: "YAML" por Red Hat

---

## Nuestro Workflow Corregido

### Estructura del Workflow

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main, develop ]

jobs:
  # Job 1: Build con matriz (3 ejecuciones paralelas)
  build-and-push:
    strategy:
      matrix:
        service: [backend, frontend, database]
    steps:
    - run: echo "Building ${{ matrix.service }}"
  
  # Job 2: Espera a que TODOS los builds terminen
  security-scan:
    needs: build-and-push
    steps:
    - run: echo "Scanning..."
  
  # Job 3: Deploy staging (solo en develop)
  deploy-staging:
    needs: [build-and-push, security-scan]
    if: github.ref == 'refs/heads/develop'
    steps:
    - run: echo "Deploy to staging..."
  
  # Job 4: Deploy production (solo con tags v*)
  deploy-production:
    needs: [build-and-push, security-scan]
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
    - run: echo "Deploy to production..."
```

### Flujo de Dependencias

```
build-and-push (backend)  ┐
build-and-push (frontend) ├─→ security-scan ─→ deploy-staging
build-and-push (database) ┘                    deploy-production
```

---

## Checklist de Troubleshooting

Cuando un workflow falla:

- [ ] ¿El nombre del job referenciado existe?
- [ ] ¿Está correctamente escrito (sin typos)?
- [ ] ¿La indentación YAML es correcta (2 espacios)?
- [ ] ¿No hay mezcla de tabs y espacios?
- [ ] ¿Los permisos son suficientes?
- [ ] ¿El job con matriz se maneja correctamente?
- [ ] ¿Las comillas están balanceadas?
- [ ] ¿Los strings multi-línea usan | o >?
- [ ] ¿Las condiciones `if:` son válidas?
- [ ] ¿El timeout es suficiente?

---

## Comandos Útiles

```bash
# Ver workflows
gh workflow list

# Ver ejecuciones
gh run list

# Ver detalles de una ejecución
gh run view RUN_ID

# Ver logs
gh run view RUN_ID --log

# Re-ejecutar
gh run rerun RUN_ID

# Cancelar ejecución
gh run cancel RUN_ID

# Ver estado del workflow
gh workflow view docker-build.yml
```

---

## Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [YAML Spec](https://yaml.org/spec/)
- [Act (local testing)](https://github.com/nektos/act)
- [GitHub Actions Toolkit](https://github.com/actions/toolkit)

---

## 📝 Resumen

### Error Más Común

```
Job 'X' depends on unknown job 'Y'
```

### Soluciones Rápidas

1. **Verificar que el job Y existe**
   ```yaml
   jobs:
     Y:  # ✅ Debe existir
       runs-on: ubuntu-latest
     
     X:
       needs: Y  # ✅ Referencia correcta
   ```

2. **Verificar indentación**
   - Usa 2 espacios
   - No mezcles tabs y espacios
   - Usa un editor con validación YAML

3. **Si usa matriz, espera a TODOS**
   ```yaml
   build:
     strategy:
       matrix:
         service: [a, b, c]
   
   deploy:
     needs: build  # Espera a a, b y c
   ```

---

**Fecha:** 2025-10-01  
**Versión:** 1.0.0  
**Estado:** ✅ Workflow corregido y documentado

