# Guía Completa: Git, GitHub y GitHub Actions Workflows

## 📚 Índice

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Proceso de Git Local](#proceso-de-git-local)
3. [Subir Cambios a GitHub](#subir-cambios-a-github)
4. [GitHub Actions y Workflows](#github-actions-y-workflows)
5. [Flujo Completo del Proceso](#flujo-completo-del-proceso)
6. [Workflows del Proyecto](#workflows-del-proyecto)
7. [Comandos Prácticos](#comandos-prácticos)

---

## 1. Conceptos Fundamentales

### ¿Qué es Git?

**Git** es un sistema de control de versiones distribuido que permite:
- Rastrear cambios en archivos
- Trabajar en equipo sin conflictos
- Mantener un historial completo de cambios
- Revertir a versiones anteriores
- Crear ramas para desarrollar features

### ¿Qué es GitHub?

**GitHub** es una plataforma en la nube que:
- Almacena repositorios Git de forma remota
- Facilita la colaboración entre desarrolladores
- Proporciona herramientas de CI/CD (GitHub Actions)
- Ofrece revisión de código (Pull Requests)
- Permite gestión de proyectos e issues

### Estados de un archivo en Git

```
┌─────────────┐      git add      ┌─────────────┐     git commit    ┌─────────────┐
│  Working    │  ───────────────> │   Staging   │ ─────────────────> │   Local     │
│  Directory  │                   │    Area     │                    │ Repository  │
│ (modificado)│                   │ (preparado) │                    │ (guardado)  │
└─────────────┘                   └─────────────┘                    └─────────────┘
                                                                             │
                                                                             │ git push
                                                                             ▼
                                                                    ┌─────────────────┐
                                                                    │     GitHub      │
                                                                    │ (remoto/nube)   │
                                                                    └─────────────────┘
```

---

## 2. Proceso de Git Local

### Paso 1: Verificar el Estado

```bash
git status
```

**¿Qué hace?**
- Muestra qué archivos han sido modificados
- Indica qué archivos están en staging (listos para commit)
- Muestra archivos sin rastrear (untracked)

**Salida típica:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (modificados pero NO en staging)
  modified:   database/schema.sql
  modified:   database/Dockerfile

Untracked files:
  (archivos nuevos no rastreados)
  CARGA_BASE_DATOS.md
  verify-integrity.sql
```

### Paso 2: Agregar Archivos al Staging Area

```bash
# Agregar un archivo específico
git add nombre_archivo.md

# Agregar varios archivos
git add archivo1.md archivo2.sql

# Agregar todos los archivos modificados (CUIDADO)
git add .

# Agregar todos los archivos de un directorio
git add database/
```

**¿Qué hace `git add`?**
- Mueve archivos del "Working Directory" al "Staging Area"
- Los archivos en staging están listos para ser "committeados"
- Es reversible con `git restore --staged archivo`

**En nuestro caso hicimos:**
```bash
# Agregamos archivos nuevos de documentación
git add CARGA_BASE_DATOS.md CORRECCION_IDS_RESUMEN.md

# Agregamos scripts SQL nuevos
git add database/verify-integrity.sql database/test-id-mismatch.sql

# Agregamos archivos modificados
git add database/schema.sql database/Dockerfile
```

**¿Por qué NO agregamos todos los archivos?**
- Los archivos en `data/postgres/` son datos binarios de la base de datos
- No deben subirse a Git (están en `.gitignore`)
- Son pesados y cambian constantemente
- Solo el código fuente debe estar en Git

### Paso 3: Verificar qué se va a Commitear

```bash
git status
```

**Salida después del `git add`:**
```
Changes to be committed:
  (estos archivos SÍ se van a guardar en el commit)
  new file:   CARGA_BASE_DATOS.md
  new file:   CORRECCION_IDS_RESUMEN.md
  modified:   database/schema.sql
  modified:   database/Dockerfile
  new file:   database/verify-integrity.sql
```

### Paso 4: Crear un Commit

```bash
git commit -m "Mensaje descriptivo del cambio"
```

**¿Qué es un commit?**
- Es una "fotografía" del estado del proyecto en ese momento
- Tiene un hash único (SHA-1): `158dbe4`
- Contiene: autor, fecha, mensaje, cambios realizados
- Es inmutable (no se puede cambiar, solo crear nuevos)

**Anatomía de un buen mensaje de commit:**
```bash
git commit -m "tipo: descripción corta

Explicación detallada de:
- Por qué se hizo este cambio
- Qué problema resuelve
- Cambios importantes realizados

Cambios específicos:
- Archivo X: se agregó funcionalidad Y
- Archivo Z: se corrigió bug W"
```

**Tipos comunes de commit:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Cambios en documentación
- `style:` - Formato, espacios (sin cambios de lógica)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

**Nuestro commit:**
```bash
git commit -m "fix: Corrección crítica de IDs hardcodeados en roles y perfiles

- Implementados IDs explícitos (1-10) en INSERT de roles y perfiles
- Agregado ON CONFLICT DO UPDATE para idempotencia
- Ajuste automático de secuencias con setval()
- Creado script de verificación automática (verify-integrity.sql)
...
Estado: Corregido y listo para producción"
```

**Resultado:**
```
[main 158dbe4] fix: Corrección crítica de IDs hardcodeados...
 9 files changed, 3798 insertions(+), 24 deletions(-)
 create mode 100644 CARGA_BASE_DATOS.md
 create mode 100644 database/verify-integrity.sql
 ...
```

---

## 3. Subir Cambios a GitHub

### Paso 5: Verificar el Repositorio Remoto

```bash
git remote -v
```

**¿Qué hace?**
- Muestra los repositorios remotos configurados
- `origin` es el nombre por defecto del repositorio remoto
- `-v` muestra las URLs completas

**Salida:**
```
origin  https://github.com/fescobarmo/ControlAcceso.git (fetch)
origin  https://github.com/fescobarmo/ControlAcceso.git (push)
```

**¿Qué es `origin`?**
- Es un alias para la URL del repositorio remoto
- Evita escribir la URL completa cada vez
- Se crea automáticamente al clonar un repo

### Paso 6: Hacer Push al Repositorio Remoto

```bash
git push origin main
```

**¿Qué hace `git push`?**
- Envía commits locales al repositorio remoto (GitHub)
- `origin` = repositorio remoto (alias)
- `main` = rama a la que se suben los cambios

**Proceso interno:**
```
Local (tu computadora)                  GitHub (remoto)
┌──────────────────┐                    ┌──────────────────┐
│  main (158dbe4)  │  ───── push ────>  │  main (88afdb1)  │
│  ↑               │                    │        ↓         │
│  88afdb1         │                    │     158dbe4      │
└──────────────────┘                    └──────────────────┘
     (adelante)                              (actualizado)
```

**Salida exitosa:**
```
To https://github.com/fescobarmo/ControlAcceso.git
   88afdb1..158dbe4  main -> main
```

**Interpretación:**
- `88afdb1` → Commit anterior en GitHub
- `158dbe4` → Nuevo commit que acabamos de subir
- `main -> main` → Rama local → Rama remota

### Paso 7: Verificar en GitHub

Después del push, puedes ver los cambios en:
```
https://github.com/fescobarmo/ControlAcceso
```

En la interfaz verás:
- El nuevo commit en el historial
- Los archivos modificados
- El mensaje del commit
- Diferencias (diff) entre versiones

---

## 4. GitHub Actions y Workflows

### ¿Qué son GitHub Actions?

**GitHub Actions** es un sistema de CI/CD (Integración y Despliegue Continuo) que:
- Se ejecuta automáticamente después de ciertos eventos (push, pull request, etc.)
- Corre en servidores de GitHub (runners)
- Puede compilar código, ejecutar tests, desplegar aplicaciones
- Es gratuito para repositorios públicos (con límites)

### Anatomía de un Workflow

Un workflow es un archivo YAML en `.github/workflows/` que define:

```yaml
name: Nombre del Workflow

# Cuándo se ejecuta
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# Variables de entorno globales
env:
  REGISTRY: ghcr.io

# Trabajos a ejecutar
jobs:
  build:
    runs-on: ubuntu-latest  # Sistema operativo
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      
    - name: Construir aplicación
      run: npm run build
      
    - name: Ejecutar tests
      run: npm test
```

### Componentes de un Workflow

#### 1. Triggers (Eventos)

```yaml
on:
  push:                    # Cuando se hace push
    branches: [ main ]     # Solo en la rama main
  pull_request:            # Cuando se abre un PR
  schedule:                # Programado (cron)
    - cron: '0 0 * * *'   # Diario a medianoche
  workflow_dispatch:       # Manual (botón)
```

#### 2. Jobs (Trabajos)

```yaml
jobs:
  build:                   # Nombre del job
    runs-on: ubuntu-latest # SO donde corre
    
    steps:                 # Pasos del job
    - name: Paso 1
      run: echo "Hola"
```

#### 3. Steps (Pasos)

**Actions (pre-construidas):**
```yaml
- name: Checkout código
  uses: actions/checkout@v4    # Acción de GitHub
```

**Comandos shell:**
```yaml
- name: Instalar dependencias
  run: npm install             # Comando de terminal
```

#### 4. Artifacts (Artefactos)

```yaml
- name: Subir artefacto
  uses: actions/upload-artifact@v3
  with:
    name: docker-compose-production
    path: docker-compose.production.yml
```

---

## 5. Flujo Completo del Proceso

### Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DESARROLLADOR LOCAL                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 1. Modifica archivos
                             ▼
                    ┌─────────────────┐
                    │ Working         │
                    │ Directory       │
                    └────────┬────────┘
                             │
                             │ 2. git add
                             ▼
                    ┌─────────────────┐
                    │  Staging Area   │
                    └────────┬────────┘
                             │
                             │ 3. git commit
                             ▼
                    ┌─────────────────┐
                    │  Local Repo     │
                    │  (commit hash)  │
                    └────────┬────────┘
                             │
                             │ 4. git push origin main
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         GITHUB (REMOTO)                             │
│                                                                     │
│  ┌────────────────┐                                                │
│  │ Repositorio    │                                                │
│  │ Actualizado    │                                                │
│  └───────┬────────┘                                                │
│          │                                                         │
│          │ 5. Trigger automático                                  │
│          ▼                                                         │
│  ┌────────────────────────────────────────────────┐               │
│  │         GITHUB ACTIONS WORKFLOWS               │               │
│  │                                                │               │
│  │  ┌──────────────────────────────────────────┐ │               │
│  │  │  docker-build.yml                        │ │               │
│  │  │  --------------------------------        │ │               │
│  │  │  1. Checkout código                     │ │               │
│  │  │  2. Setup Docker Buildx                 │ │               │
│  │  │  3. Login a GitHub Registry             │ │               │
│  │  │  4. Construir imágenes Docker           │ │               │
│  │  │     - Backend                           │ │               │
│  │  │     - Frontend                          │ │               │
│  │  │     - Database                          │ │               │
│  │  │  5. Push a GitHub Container Registry    │ │               │
│  │  │  6. Escaneo de seguridad (Trivy)        │ │               │
│  │  └──────────────────────────────────────────┘ │               │
│  │                                                │               │
│  │  ┌──────────────────────────────────────────┐ │               │
│  │  │  dockerhub-push.yml                      │ │               │
│  │  │  --------------------------------        │ │               │
│  │  │  1. Checkout código                     │ │               │
│  │  │  2. Login a Docker Hub                  │ │               │
│  │  │  3. Construir y subir a Docker Hub      │ │               │
│  │  │  4. Generar docker-compose producción   │ │               │
│  │  └──────────────────────────────────────────┘ │               │
│  │                                                │               │
│  │  ┌──────────────────────────────────────────┐ │               │
│  │  │  version-manager.yml                     │ │               │
│  │  │  --------------------------------        │ │               │
│  │  │  1. Actualizar versiones                │ │               │
│  │  │  2. Crear tags                          │ │               │
│  │  └──────────────────────────────────────────┘ │               │
│  └────────────────────────────────────────────────┘               │
│                             │                                      │
│                             │ 6. Resultados                        │
│                             ▼                                      │
│  ┌────────────────────────────────────────────┐                   │
│  │     OUTPUTS Y ARTEFACTOS                   │                   │
│  │  ✅ Imágenes Docker en GHCR                │                   │
│  │  ✅ Imágenes Docker en Docker Hub          │                   │
│  │  ✅ Reportes de seguridad                  │                   │
│  │  ✅ docker-compose.production.yml          │                   │
│  └────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Workflows del Proyecto

### Workflow 1: `docker-build.yml`

**Propósito:** Construir y publicar imágenes Docker en GitHub Container Registry

**Se ejecuta cuando:**
- Push a `main` o `develop`
- Se crea un tag `v*` (ej: `v1.0.0`)
- Se abre un Pull Request a `main`

**Proceso:**

```
1. CHECKOUT
   ├─ Descarga el código del repositorio
   └─ Obtiene historial completo (fetch-depth: 0)

2. SETUP DOCKER BUILDX
   ├─ Configura Docker con capacidades avanzadas
   └─ Permite builds multi-plataforma (amd64, arm64)

3. LOGIN A REGISTRY
   ├─ Se autentica con GitHub Container Registry
   └─ Usa token automático de GitHub

4. EXTRAER METADATOS
   ├─ Genera tags automáticamente según el evento
   ├─ main → latest
   ├─ v1.2.3 → 1.2.3, 1.2, 1
   └─ PR → pr-123

5. CARGAR VERSIONES
   ├─ Lee archivo VERSION
   └─ Exporta como variables de entorno

6. BUILD + PUSH (PARALELO)
   ├─ Backend
   │  ├─ Construye imagen Node.js
   │  ├─ Multi-etapa (build + production)
   │  ├─ Plataformas: linux/amd64, linux/arm64
   │  └─ Push a ghcr.io/fescobarmo/controlacceso-backend
   │
   ├─ Frontend
   │  ├─ Construye imagen React + Nginx
   │  ├─ Build optimizado para producción
   │  └─ Push a ghcr.io/fescobarmo/controlacceso-frontend
   │
   └─ Database
      ├─ Construye imagen PostgreSQL + schemas
      ├─ Incluye verify-integrity.sql
      └─ Push a ghcr.io/fescobarmo/controlacceso-database

7. SECURITY SCAN
   ├─ Escanea imágenes con Trivy
   ├─ Busca vulnerabilidades CRITICAL y HIGH
   └─ Genera reporte SARIF

8. DEPLOY (CONDICIONAL)
   ├─ develop → staging
   └─ v* tag → production
```

**Ejemplo de ejecución:**

```bash
# Tu push activa el workflow
$ git push origin main

# GitHub Actions comienza
┌─────────────────────────────────────────┐
│ Run #123 - docker-build.yml             │
├─────────────────────────────────────────┤
│ ✓ Checkout código              (5s)     │
│ ✓ Setup Docker Buildx          (8s)     │
│ ✓ Login a Registry             (2s)     │
│ ✓ Build Backend               (2m 30s)  │
│ ✓ Build Frontend              (3m 15s)  │
│ ✓ Build Database              (1m 45s)  │
│ ✓ Security Scan               (45s)     │
│                                         │
│ Total: 8 minutes 30 seconds             │
│ Status: ✅ SUCCESS                      │
└─────────────────────────────────────────┘
```

### Workflow 2: `dockerhub-push.yml`

**Propósito:** Subir imágenes a Docker Hub para distribución pública

**Se ejecuta cuando:**
- Push a `main`
- Se crea un tag `v*`
- Manualmente (workflow_dispatch)

**Proceso:**

```
1. VERIFICACIÓN
   └─ Solo corre si es rama main o tag v*

2. CHECKOUT + SETUP
   ├─ Descarga código
   └─ Configura Docker Buildx

3. LOGIN A DOCKER HUB
   ├─ Usa DOCKERHUB_USERNAME (secret)
   └─ Usa DOCKERHUB_TOKEN (secret)

4. BUILD + PUSH A DOCKER HUB
   ├─ Backend → tu-usuario/controlacceso-backend:latest
   ├─ Frontend → tu-usuario/controlacceso-frontend:latest
   └─ Database → tu-usuario/controlacceso-database:latest

5. GENERAR DOCKER-COMPOSE PRODUCCIÓN
   ├─ Crea archivo con imágenes de Docker Hub
   └─ Incluye configuración para despliegue

6. SUBIR ARTEFACTO
   └─ docker-compose.production.yml disponible para descarga
```

### Workflow 3: `version-manager.yml`

**Propósito:** Gestionar versiones automáticamente

**Características:**
- Actualiza versiones en archivo VERSION
- Crea tags de Git automáticamente
- Genera changelog

---

## 7. Comandos Prácticos

### Comandos Git Básicos

```bash
# Ver estado actual
git status

# Ver diferencias de archivos modificados
git diff

# Ver diferencias de archivos en staging
git diff --staged

# Ver historial de commits
git log
git log --oneline
git log --graph --oneline --all

# Ver un commit específico
git show 158dbe4

# Ver estadísticas de cambios
git diff --stat HEAD~1 HEAD
```

### Comandos para Deshacer Cambios

```bash
# Descartar cambios en un archivo (CUIDADO: no reversible)
git restore nombre_archivo.sql

# Quitar archivo del staging (mantiene cambios)
git restore --staged nombre_archivo.sql

# Deshacer el último commit (mantiene cambios)
git reset HEAD~1

# Ver cambios antes de hacer push
git diff origin/main main
```

### Comandos Avanzados

```bash
# Ver qué archivos están siendo ignorados
git status --ignored

# Limpiar archivos sin rastrear
git clean -n  # Vista previa
git clean -f  # Ejecutar limpieza

# Ver tamaño del repositorio
git count-objects -vH

# Ver ramas remotas
git branch -r

# Actualizar referencias remotas
git fetch origin

# Ver diferencias con remoto
git log origin/main..main
```

### Comandos para GitHub Actions

```bash
# Ver workflows localmente (requiere GitHub CLI)
gh workflow list

# Ver ejecuciones de workflows
gh run list

# Ver detalles de una ejecución
gh run view <run-id>

# Ver logs de un workflow
gh run view <run-id> --log

# Re-ejecutar un workflow fallido
gh run rerun <run-id>
```

---

## 8. Proceso Paso a Paso: Lo que Hicimos

### Paso a Paso Detallado

#### 1️⃣ **Verificar Estado Inicial**

```bash
$ git status
```

**Resultado:**
- 9 archivos nuevos (documentación y scripts)
- Muchos archivos modificados
- Archivos de datos de PostgreSQL (NO queremos subirlos)

#### 2️⃣ **Restaurar Archivos de Datos**

```bash
$ git restore data/
```

**Por qué:** Los archivos en `data/postgres/` son binarios de la base de datos y no deben estar en Git.

#### 3️⃣ **Agregar Archivos Importantes**

```bash
# Documentación nueva
$ git add CARGA_BASE_DATOS.md
$ git add CORRECCION_IDS_RESUMEN.md
$ git add DIAGRAMA_ARQUITECTURA.md
$ git add ESTRUCTURA_PLATAFORMA.md

# Scripts SQL
$ git add database/verify-integrity.sql
$ git add database/test-id-mismatch.sql
$ git add database/schema-fix-ids.sql

# Archivos modificados críticos
$ git add database/schema.sql
$ git add database/Dockerfile
```

#### 4️⃣ **Verificar Staging**

```bash
$ git status
```

**Confirmamos:** Solo los archivos deseados están en staging.

#### 5️⃣ **Crear Commit con Mensaje Descriptivo**

```bash
$ git commit -m "fix: Corrección crítica de IDs hardcodeados en roles y perfiles

- Implementados IDs explícitos (1-10) en INSERT de roles y perfiles
- Agregado ON CONFLICT DO UPDATE para idempotencia
- Ajuste automático de secuencias con setval()
- Creado script de verificación automática (verify-integrity.sql)
- Actualizado Dockerfile para incluir verificación en inicialización
- Documentación completa del problema y solución (CARGA_BASE_DATOS.md)
- Scripts de demostración y prueba del problema original
- Resumen ejecutivo de cambios (CORRECCION_IDS_RESUMEN.md)
- Documentación de arquitectura y estructura

Cambios críticos:
- database/schema.sql: IDs explícitos garantizan integridad referencial
- database/Dockerfile: Incluye script de verificación automática
- database/verify-integrity.sql: Validación de integridad de datos
- Usuario admin (rol_id=2, perfil_id=2) ahora garantizado

Estado: Corregido y listo para producción"
```

**Resultado:**
```
[main 158dbe4] fix: Corrección crítica de IDs hardcodeados...
 9 files changed, 3798 insertions(+), 24 deletions(-)
```

#### 6️⃣ **Verificar Remoto**

```bash
$ git remote -v
```

**Resultado:**
```
origin  https://github.com/fescobarmo/ControlAcceso.git (fetch)
origin  https://github.com/fescobarmo/ControlAcceso.git (push)
```

#### 7️⃣ **Push a GitHub**

```bash
$ git push origin main
```

**Resultado:**
```
To https://github.com/fescobarmo/ControlAcceso.git
   88afdb1..158dbe4  main -> main
```

#### 8️⃣ **GitHub Actions se Activa Automáticamente**

En cuanto el push llega a GitHub, los workflows se activan:

**`docker-build.yml` comienza:**
```
Triggered by: push to main
Branch: main
Commit: 158dbe4
Author: fescobarmo

Jobs running:
├─ build-and-push
│  ├─ backend [running...]
│  ├─ frontend [running...]
│  └─ database [running...]
├─ security-scan [waiting...]
└─ deploy-staging [skipped - not develop branch]
```

#### 9️⃣ **Ver Resultados**

Puedes ver el progreso en:
```
https://github.com/fescobarmo/ControlAcceso/actions
```

---

## 9. Mejores Prácticas

### Commits

✅ **Hacer:**
- Commits pequeños y frecuentes
- Mensajes descriptivos y claros
- Un cambio lógico por commit
- Revisar cambios antes de commitear

❌ **Evitar:**
- Commits gigantes con muchos cambios
- Mensajes vagos como "fix" o "update"
- Mezclar cambios no relacionados
- Commitear archivos generados o secretos

### Branches (Ramas)

```bash
# Crear rama para nueva feature
git checkout -b feature/nueva-funcionalidad

# Trabajar en la rama
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Merge a main (después de PR)
git checkout main
git merge feature/nueva-funcionalidad
```

### Pull Requests

1. Crea una rama para tu cambio
2. Haz commits en esa rama
3. Push de la rama a GitHub
4. Abre un Pull Request (PR)
5. Espera revisión y aprobación
6. Merge a main

### Seguridad

🔒 **NUNCA subas:**
- Contraseñas o claves API
- Tokens de autenticación
- Archivos `.env` con secretos
- Datos personales o sensibles
- Binarios grandes

🔐 **Usa GitHub Secrets:**
```
Settings → Secrets and variables → Actions → New repository secret

DOCKERHUB_USERNAME = tu_usuario
DOCKERHUB_TOKEN = tu_token
JWT_SECRET = tu_clave_secreta
```

---

## 10. Troubleshooting

### Problema: Push rechazado

```
! [rejected]  main -> main (fetch first)
```

**Solución:**
```bash
# Alguien más hizo push antes que tú
git pull origin main
git push origin main
```

### Problema: Conflictos de merge

```
CONFLICT (content): Merge conflict in database/schema.sql
```

**Solución:**
```bash
# 1. Abrir archivo conflictivo
# 2. Buscar marcadores <<<<<<< ======= >>>>>>>
# 3. Resolver manualmente
# 4. git add archivo_resuelto
# 5. git commit
```

### Problema: Workflow falla

**Solución:**
1. Ver logs en GitHub Actions
2. Identificar el paso que falló
3. Reproducir localmente
4. Corregir y hacer push de nuevo

### Problema: Archivo grande en Git

```
remote: error: File is 120.00 MB; this exceeds GitHub's file size limit
```

**Solución:**
```bash
# Agregar a .gitignore
echo "archivo-grande.bin" >> .gitignore

# Remover del historial (CUIDADO)
git rm --cached archivo-grande.bin
git commit -m "Remove large file"
git push origin main
```

---

## 11. Recursos Adicionales

### Documentación Oficial

- **Git:** https://git-scm.com/doc
- **GitHub:** https://docs.github.com
- **GitHub Actions:** https://docs.github.com/en/actions

### Cheat Sheets

- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf
- **GitHub Actions Syntax:** https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions

### Herramientas Útiles

- **GitHub CLI:** `gh` - Gestionar GitHub desde terminal
- **GitKraken:** Cliente visual de Git
- **Git Graph (VSCode):** Extensión para visualizar historial

---

## 📝 Resumen Final

### Flujo Completo Simplificado

```
Desarrollo Local
    │
    ├── 1. Modificar archivos
    ├── 2. git add (staging)
    ├── 3. git commit (guardar)
    └── 4. git push (subir)
           │
           ▼
GitHub Remoto
    │
    ├── 5. Código actualizado
    └── 6. Workflows se activan
           │
           ├── Build imágenes Docker
           ├── Tests automáticos
           ├── Scan de seguridad
           └── Deploy (si corresponde)
                  │
                  ▼
                Producción
```

### Comandos Esenciales

```bash
# Flujo básico
git status
git add archivo.md
git commit -m "mensaje"
git push origin main

# Ver historial
git log --oneline

# Deshacer
git restore archivo.md
git reset HEAD~1

# Información
git diff
git remote -v
```

---

**Fecha:** 2025-10-01  
**Versión:** 1.0.0  
**Autor:** Sistema ControlAcceso

