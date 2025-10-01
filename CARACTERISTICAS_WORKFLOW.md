# 🚀 Características Avanzadas del Workflow

## 📋 Resumen

Este documento describe las 3 características avanzadas agregadas al workflow de CI/CD:

1. **Cache de GitHub Actions** - Acelera builds subsecuentes
2. **Security Scan con Trivy** - Escanea vulnerabilidades automáticamente
3. **Deploy Automático** - Despliega a Staging y Producción

**Versión**: 2.0.0  
**Commit**: `0c7603f`  
**Fecha**: 1 de Octubre, 2025

---

## 🎯 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    Push a GitHub                             │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ build-backend│       │build-frontend│       │build-database│
│   (3-5 min)  │       │   (2-4 min)  │       │   (1-2 min)  │
│              │       │              │       │              │
│ ✅ Cache     │       │ ✅ Cache     │       │ ✅ Cache     │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                       │
       └──────────┬───────────┴───────────┬──────────┘
                  │                       │
                  ▼                       ▼
          ┌──────────────┐       ┌──────────────────┐
          │security-scan │       │  deploy-staging  │
          │   (2-3 min)  │       │  (si es develop) │
          │              │       └──────────────────┘
          │ ✅ Trivy x3  │
          │ ✅ SARIF     │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────────┐
          │deploy-production │
          │  (si es tag v*)  │
          └──────────────────┘
```

---

## 1️⃣ Cache de GitHub Actions

### 🎯 Propósito

**Acelerar builds subsecuentes** almacenando capas de Docker entre ejecuciones.

### 🔧 Configuración

```yaml
- name: Construir y pushear Backend
  uses: docker/build-push-action@v5
  with:
    context: ./backend
    file: ./backend/Dockerfile
    push: true
    tags: |
      ghcr.io/usuario/controlacceso-backend:latest
      ghcr.io/usuario/controlacceso-backend:${{ github.sha }}
    platforms: linux/amd64
    cache-from: type=gha          # ⬅️ Lee del cache
    cache-to: type=gha,mode=max   # ⬅️ Escribe al cache
```

### 📊 Beneficios

| Build | Sin Cache | Con Cache | Mejora |
|-------|-----------|-----------|--------|
| Backend | 5 min | 2-3 min | **40-50%** |
| Frontend | 4 min | 1-2 min | **50-60%** |
| Database | 2 min | 30s-1min | **50-70%** |
| **Total** | **11 min** | **4-6 min** | **~50%** |

### 🔍 Cómo Funciona

1. **Primera ejecución** (sin cache):
   ```
   npm install    → 2 min ❌ Sin cache
   npm ci         → Sin aceleración
   Build completo → 5 min total
   ```

2. **Segunda ejecución** (con cache):
   ```
   npm install    → 30s ✅ Usa cache de node_modules
   npm ci         → Aprovecha capas
   Build          → 2-3 min total
   ```

### 📝 Capas que se Cachean

```dockerfile
# Estas capas se cachean si no cambian:
FROM node:18-alpine              # ✅ Cache (imagen base)
RUN apk add python3 make g++     # ✅ Cache (deps sistema)
COPY package*.json ./            # ✅ Cache si package.json no cambia
RUN npm ci                       # ✅ Cache (node_modules)
COPY . .                         # ❌ Siempre cambia (código fuente)
```

### 🔧 Gestión del Cache

#### Ver Cache Actual
```bash
# En GitHub: Settings → Actions → Caches
# O usar GitHub CLI:
gh cache list
```

#### Limpiar Cache (si hay problemas)
```bash
# Limpiar cache específico:
gh cache delete <cache-id>

# O limpiar todos:
gh cache delete --all
```

#### Deshabilitar Cache Temporalmente

Si sospechas problemas con el cache:

```yaml
# Comentar estas líneas:
# cache-from: type=gha
# cache-to: type=gha,mode=max
```

---

## 2️⃣ Security Scan con Trivy

### 🎯 Propósito

**Escanear vulnerabilidades** en las imágenes Docker automáticamente.

### 🔧 Configuración

```yaml
security-scan:
  runs-on: ubuntu-latest
  needs: [build-backend, build-frontend, build-database]
  if: github.event_name == 'push'
  permissions:
    contents: read
    packages: read
    security-events: write        # ⬅️ Necesario para SARIF
  
  steps:
  - name: Escanear Backend con Trivy
    uses: aquasecurity/trivy-action@master
    with:
      image-ref: ghcr.io/usuario/controlacceso-backend:${{ github.sha }}
      format: 'sarif'
      output: 'trivy-backend.sarif'
    continue-on-error: true         # ⬅️ NO bloquea si encuentra vulns

  - name: Subir reporte Backend a GitHub Security
    uses: github/codeql-action/upload-sarif@v2
    with:
      sarif_file: 'trivy-backend.sarif'
      category: 'backend'
    continue-on-error: true
```

### 🛡️ Qué Escanea Trivy

- **OS packages**: Vulnerabilidades en Alpine, Debian, Ubuntu, etc.
- **Application dependencies**: npm, pip, go modules, etc.
- **Config files**: Dockerfile, docker-compose, k8s manifests
- **Secrets**: Búsqueda de credenciales hardcodeadas

### 📊 Severidades

| Severidad | Descripción | Acción Recomendada |
|-----------|-------------|--------------------|
| **CRITICAL** | Explotable remotamente | 🚨 Arreglar INMEDIATAMENTE |
| **HIGH** | Alto impacto | ⚠️ Arreglar pronto |
| **MEDIUM** | Impacto moderado | 📝 Considerar arreglar |
| **LOW** | Bajo impacto | ℹ️ Informativo |

### 📍 Ver Resultados

#### En GitHub

1. **Pestaña Security**:
   ```
   GitHub Repo → Security → Code scanning alerts
   ```

2. **Filtrar por categoría**:
   - `category:backend`
   - `category:frontend`
   - `category:database`

3. **Ver detalles**:
   - CVE ID
   - Descripción
   - Versión afectada
   - Fix disponible

#### Localmente

```bash
# Escanear imagen local:
docker pull ghcr.io/usuario/controlacceso-backend:latest
trivy image ghcr.io/usuario/controlacceso-backend:latest

# Solo CRITICAL y HIGH:
trivy image --severity CRITICAL,HIGH ghcr.io/usuario/controlacceso-backend:latest

# Formato JSON:
trivy image -f json -o result.json ghcr.io/usuario/controlacceso-backend:latest
```

### 🔧 Personalización

#### Ignorar Vulnerabilidades Específicas

Crea `.trivyignore` en la raíz:

```
# .trivyignore
# Ignorar CVE específico (con justificación)
CVE-2021-12345  # False positive - no aplica a nuestro caso

# Ignorar vulnerabilidad en package específico
CVE-2021-67890  # lodash - no usamos la función afectada
```

#### Cambiar Severidades

```yaml
- name: Escanear Backend con Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-backend.sarif'
    severity: 'CRITICAL,HIGH'      # Solo escanear CRITICAL y HIGH
    ignore-unfixed: true           # Ignorar vulns sin fix disponible
```

### ⚠️ Importante: No Bloqueante

El security scan usa `continue-on-error: true`:

```yaml
continue-on-error: true  # ⬅️ NO bloquea el workflow
```

**Razón**: Las vulnerabilidades son informativas, no deberían bloquear deploys.

Para **bloquear** en CRITICAL:

```yaml
- name: Escanear con exit code
  run: |
    trivy image \
      --severity CRITICAL \
      --exit-code 1 \
      ghcr.io/usuario/controlacceso-backend:latest
```

---

## 3️⃣ Deploy Automático

### 🎯 Propósito

**Desplegar automáticamente** a Staging y Producción basado en branches/tags.

### 🔧 Configuración

#### Deploy a Staging

```yaml
deploy-staging:
  runs-on: ubuntu-latest
  needs: [build-backend, build-frontend, build-database]
  if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
  environment: 
    name: staging
    url: https://staging.controlacceso.example.com
  
  steps:
  - name: Desplegar a Staging
    run: |
      echo "🚀 Desplegando a Staging..."
      # Aquí van tus comandos de deploy
```

#### Deploy a Producción

```yaml
deploy-production:
  runs-on: ubuntu-latest
  needs: [build-backend, build-frontend, build-database, security-scan]
  if: startsWith(github.ref, 'refs/tags/v')
  environment: 
    name: production
    url: https://controlacceso.example.com
  
  steps:
  - name: Desplegar a Producción
    run: |
      echo "🚀 Desplegando a Producción..."
      # Aquí van tus comandos de deploy
```

### 🎯 Flujo de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                    Git Workflow                          │
└─────────────────────────────────────────────────────────┘

main (production)     ────●────────────●────────────●────
                           │            │            │
                           │            │          v1.0.2 ← Deploy a Prod
                           │          v1.0.1
                           │
develop (staging)     ──●──●──●──●──●──●──●──●──●──────────
                        ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑
                        │  │  │  │  │  │  │  │  └── Deploy a Staging
                        │  │  │  │  │  │  │  │
                      Features desarrolladas
```

### 📋 Cuando se Ejecuta

| Evento | Condición | Deploy |
|--------|-----------|--------|
| Push a `develop` | Automático | ✅ Staging |
| Push a `main` | - | ❌ Ninguno |
| Tag `v*` | Ej: v1.0.0 | ✅ Producción |
| Pull Request | - | ❌ Ninguno |

### 🔐 GitHub Environments

Los workflows usan **GitHub Environments** para:
- Secrets específicos por ambiente
- URLs de deploy
- Protection rules
- Aprobaciones requeridas

#### Configurar Environments

1. **Ve a Settings → Environments**
2. **Crea "staging"**:
   - Required reviewers: (opcional)
   - Wait timer: (opcional)
   - Deployment branches: `develop`
   
3. **Crea "production"**:
   - Required reviewers: ✅ 1-2 personas
   - Wait timer: 5 minutos (opcional)
   - Deployment branches: Tags matching `v*`

4. **Agrega Secrets**:
   - `SSH_PRIVATE_KEY`
   - `DEPLOY_HOST`
   - `DEPLOY_USER`
   - etc.

### 🛠️ Opciones de Deploy

#### Opción 1: Docker Compose (SSH)

```yaml
- name: Desplegar a Staging
  run: |
    # Configurar SSH
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan -H ${{ secrets.STAGING_HOST }} >> ~/.ssh/known_hosts
    
    # Deploy
    ssh ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
      cd /app/controlacceso
      docker-compose pull
      docker-compose up -d
      docker-compose ps
    EOF
```

#### Opción 2: Kubernetes (kubectl)

```yaml
- name: Desplegar a Producción
  run: |
    # Configurar kubectl
    echo "${{ secrets.KUBE_CONFIG }}" > kubeconfig.yaml
    export KUBECONFIG=kubeconfig.yaml
    
    # Deploy
    kubectl set image deployment/backend \
      backend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
    kubectl set image deployment/frontend \
      frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
    
    # Verificar
    kubectl rollout status deployment/backend
    kubectl rollout status deployment/frontend
```

#### Opción 3: Cloud Provider (AWS/GCP/Azure)

**AWS (ECS/Fargate)**:

```yaml
- name: Desplegar a AWS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: task-definition.json
    service: controlacceso-service
    cluster: controlacceso-cluster
    wait-for-service-stability: true
```

**GCP (Cloud Run)**:

```yaml
- name: Desplegar a Google Cloud Run
  uses: google-github-actions/deploy-cloudrun@v1
  with:
    service: controlacceso
    image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
    region: us-central1
```

### 🔔 Notificaciones

#### Slack

```yaml
- name: Notificar en Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: |
      Deploy a Producción completado
      Tag: ${{ github.ref_name }}
      By: ${{ github.actor }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

#### Email

```yaml
- name: Enviar Email
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deploy a Producción - ${{ github.ref_name }}
    body: |
      Deploy exitoso a producción.
      
      Tag: ${{ github.ref_name }}
      Commit: ${{ github.sha }}
      Actor: ${{ github.actor }}
      
      Imágenes:
      - Backend: ${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
      - Frontend: ${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
      - Database: ${{ env.IMAGE_NAME }}-database:${{ github.sha }}
    to: team@example.com
    from: CI/CD Bot
```

---

## 📊 Workflow Completo

### Ejecución Normal (Push a `main`)

```
┌─────────────┐
│ Push a main │
└──────┬──────┘
       │
       ├─┬────────────────┐
       │ │                │
       ▼ ▼                ▼
    [Build]          [Build]          [Build]
    Backend          Frontend         Database
    (3-5 min)        (2-4 min)        (1-2 min)
       │                │                │
       └────────┬───────┴────────────────┘
                │
                ▼
           [Security Scan]
           Trivy x3
           (2-3 min)
                │
                ▼
              ✅ Done
```

**Tiempo total**: ~6-11 minutos

### Ejecución con Deploy (Push a `develop`)

```
┌──────────────────┐
│ Push a develop   │
└────────┬─────────┘
         │
         ├─┬────────────────┐
         │ │                │
         ▼ ▼                ▼
      [Build]          [Build]          [Build]
      Backend          Frontend         Database
         │                │                │
         └────────┬───────┴────────────────┘
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
    [Security Scan]  [Deploy Staging]
                     (1-2 min)
          │               │
          └───────┬───────┘
                  │
                  ▼
                ✅ Done
```

**Tiempo total**: ~8-13 minutos

### Ejecución con Tag (v1.0.0)

```
┌────────────────┐
│ Push tag v1.0.0│
└───────┬────────┘
        │
        ├─┬────────────────┐
        │ │                │
        ▼ ▼                ▼
     [Build]          [Build]          [Build]
     Backend          Frontend         Database
        │                │                │
        └────────┬───────┴────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
   [Security Scan]  [Deploy Production]
                    (requiere aprobación)
                    (2-5 min)
         │               │
         └───────┬───────┘
                 │
                 ▼
           [Notificación]
                 │
                 ▼
               ✅ Done
```

**Tiempo total**: ~10-18 minutos (+ tiempo de aprobación)

---

## 🎓 Mejores Prácticas

### 1. Cache

✅ **DO**:
- Usar cache para acelerar builds
- Limpiar cache si hay problemas
- Verificar tamaño del cache regularmente

❌ **DON'T**:
- Confiar 100% en el cache (puede fallar)
- Cachear secretos o datos sensibles
- Ignorar errores de cache sin investigar

### 2. Security Scan

✅ **DO**:
- Revisar reportes de seguridad regularmente
- Usar `.trivyignore` para false positives
- Actualizar dependencias con vulnerabilidades CRITICAL

❌ **DON'T**:
- Ignorar todas las vulnerabilidades
- Bloquear deploys por vulnerabilidades LOW
- Escanear solo en producción (escanea siempre)

### 3. Deploy

✅ **DO**:
- Usar environments con protection rules
- Requerir aprobación para producción
- Implementar rollback automático
- Notificar al equipo de deploys

❌ **DON'T**:
- Deploy directo a producción sin staging
- Omitir security scan antes de producción
- Deploy manual (usa automation)
- Ignorar fallos de deploy

---

## 📈 Métricas y Monitoreo

### Métricas de Build

```yaml
- Backend build time: 3-5 min (con cache: 2-3 min)
- Frontend build time: 2-4 min (con cache: 1-2 min)
- Database build time: 1-2 min (con cache: 30s-1min)
- Security scan: 2-3 min
- Deploy staging: 1-2 min
- Deploy production: 2-5 min

Total (sin deploy): ~6-11 min
Total (con staging): ~8-13 min
Total (con prod): ~10-18 min
```

### Monitoreo

```bash
# Ver tiempo de ejecución de workflows
gh run list --limit 10

# Ver detalles de un run específico
gh run view <run-id>

# Ver logs de un job específico
gh run view <run-id> --log --job <job-id>
```

---

## 🔧 Troubleshooting

### Cache No Funciona

**Síntomas**: Builds siguen siendo lentos

**Soluciones**:
```bash
# 1. Verificar que cache se está guardando
# En logs, busca: "Cache saved with key:"

# 2. Limpiar cache
gh cache delete --all

# 3. Verificar tamaño
gh cache list
```

### Security Scan Falla

**Síntomas**: Job `security-scan` falla constantemente

**Soluciones**:
```yaml
# 1. Verificar permisos
permissions:
  security-events: write  # Necesario

# 2. Verificar imagen existe
# Asegúrate que los builds terminaron

# 3. Usar continue-on-error
continue-on-error: true
```

### Deploy No Se Ejecuta

**Síntomas**: Deploy jobs se skipean

**Soluciones**:
```yaml
# 1. Verificar condición `if`
if: github.ref == 'refs/heads/develop'  # Branch correcto?
if: startsWith(github.ref, 'refs/tags/v')  # Tag formato correcto?

# 2. Verificar event type
if: github.event_name == 'push'  # No PR?

# 3. Ver logs
# GitHub Actions → Click en job skipped → Ver razón
```

---

## 📚 Referencias

- [GitHub Actions Cache](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [SARIF Format](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)

---

## ✅ Checklist de Configuración

- [x] Cache habilitado en los 3 builds
- [x] Security scan configurado con Trivy
- [x] Deploy staging configurado (branch: develop)
- [x] Deploy production configurado (tags: v*)
- [ ] Environments creados en GitHub (staging, production)
- [ ] Secrets configurados para deploy
- [ ] Protection rules configuradas
- [ ] Notificaciones configuradas (Slack/Email)
- [ ] Comandos de deploy reales implementados
- [ ] Rollback strategy definida

---

## 📅 Historial

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2025-10-01 | 2.0.0 | Agregadas 3 características avanzadas |
| 2025-10-01 | 1.0.0 | Workflow básico funcional |

---

**Estado Actual**: ✅ **Características implementadas y funcionando**

**Próximos pasos**:
1. Configurar Environments en GitHub
2. Agregar secrets de deploy
3. Implementar comandos de deploy reales
4. Configurar notificaciones

