# 🔐 Cómo se Conecta GitHub con Docker

## 📋 Introducción

Este documento explica el mecanismo completo de conexión entre GitHub Actions y los registries de Docker, específicamente **GitHub Container Registry (GHCR)**.

**Conceptos clave**:
- Autenticación automática con `GITHUB_TOKEN`
- GitHub Container Registry (ghcr.io)
- Permisos y seguridad
- Flujo completo de login y push

---

## 🎯 Tipos de Conexión

### 1. GitHub Container Registry (GHCR) - ghcr.io

Es el registry **nativo de GitHub**, donde estamos publicando nuestras imágenes.

#### Autenticación Automática

```yaml
- name: Login a GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io                      # GitHub Container Registry
    username: ${{ github.actor }}           # Tu usuario de GitHub
    password: ${{ secrets.GITHUB_TOKEN }}   # Token automático
```

#### ¿Cómo funciona?

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions Runner                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  1. Workflow se dispara                                 │
│     └─> GitHub genera GITHUB_TOKEN automáticamente     │
│                                                         │
│  2. docker/login-action@v3 ejecuta                      │
│     └─> docker login ghcr.io -u fescobarmo -p <token>  │
│                                                         │
│  3. Docker guarda credenciales en                       │
│     └─> ~/.docker/config.json                          │
│                                                         │
│  4. docker push puede autenticarse                      │
│     └─> Lee ~/.docker/config.json                      │
│     └─> Usa token para autenticar con ghcr.io          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Variables Clave Explicadas

### `github.actor`

```yaml
username: ${{ github.actor }}
```

**¿Qué es?**
- Tu nombre de usuario de GitHub
- En este caso: `fescobarmo`
- GitHub lo proporciona automáticamente en el contexto

**Ejemplo real**:
```yaml
# En el workflow se ve así:
username: ${{ github.actor }}

# GitHub lo convierte a:
username: fescobarmo
```

---

### `secrets.GITHUB_TOKEN`

```yaml
password: ${{ secrets.GITHUB_TOKEN }}
```

**¿Qué es?**

Es un **token de autenticación temporal** que GitHub genera **automáticamente** para cada workflow run.

**Características**:
- ✅ **Automático**: No necesitas crearlo manualmente
- ✅ **Temporal**: Solo válido durante el workflow run
- ✅ **Seguro**: Se revoca automáticamente al terminar
- ✅ **Con permisos**: Definidos en el workflow

**Ciclo de vida**:
```
Workflow inicia → GitHub genera token → Token válido → Workflow termina → Token revocado
                  (automático)          (1-2 horas)    (automático)
```

---

### Permisos del GITHUB_TOKEN

En nuestro workflow:
```yaml
permissions:
  contents: read          # Leer código del repo
  packages: write         # Escribir en GitHub Packages (GHCR)
  pull-requests: read     # Leer info de PRs
  security-events: write  # Escribir resultados de security scan
```

**¿Qué significa `packages: write`?**

```
packages: write
    ^        ^
    |        └─ Puede PUSH imágenes a GHCR
    └────────── GitHub Container Registry = GitHub Packages
```

**Sin** `packages: write`:
```bash
docker push ghcr.io/fescobarmo/controlacceso-backend:latest
# Error: denied: permission_denied: write_package
```

**Con** `packages: write`:
```bash
docker push ghcr.io/fescobarmo/controlacceso-backend:latest
# ✅ The push refers to repository [ghcr.io/fescobarmo/controlacceso-backend]
```

---

## 🔄 Flujo Completo de Conexión

### Paso a Paso

```
1️⃣  TRIGGER
    └─> git push origin main
         └─> GitHub recibe push
              └─> Dispara workflow docker-build.yml

2️⃣  WORKFLOW INICIA
    └─> GitHub Actions crea runner (VM Ubuntu)
         └─> Genera GITHUB_TOKEN con permisos definidos
              └─> Token: ghp_abc123def456...xyz789

3️⃣  CHECKOUT CÓDIGO
    └─> actions/checkout@v4
         └─> Clona repo en /home/runner/work/ControlAcceso

4️⃣  SETUP BUILDX
    └─> docker/setup-buildx-action@v3
         └─> Instala Docker Buildx
              └─> buildx version: v0.11.2

5️⃣  LOGIN A GHCR (AQUÍ LA CONEXIÓN)
    └─> docker/login-action@v3
         └─> registry: ghcr.io
         └─> username: fescobarmo (de github.actor)
         └─> password: ghp_abc123... (de GITHUB_TOKEN)
         
         Ejecuta internamente:
         docker login ghcr.io \
           --username fescobarmo \
           --password-stdin <<< "ghp_abc123..."
         
         Respuesta de ghcr.io:
         ✅ Login Succeeded
         
         Guarda en:
         ~/.docker/config.json
         {
           "auths": {
             "ghcr.io": {
               "auth": "base64(fescobarmo:ghp_abc123...)"
             }
           }
         }

6️⃣  BUILD IMAGEN
    └─> docker/build-push-action@v5
         └─> Construye imagen backend
              └─> Tags: ghcr.io/fescobarmo/controlacceso-backend:latest

7️⃣  PUSH IMAGEN (USA LA CONEXIÓN)
    └─> docker push ghcr.io/fescobarmo/controlacceso-backend:latest
         └─> Docker lee ~/.docker/config.json
              └─> Encuentra auth para ghcr.io
                   └─> Usa token para autenticar
                        └─> GHCR verifica token con GitHub API
                             └─> GitHub valida: ✅ Token válido + permisos OK
                                  └─> GHCR acepta push
                                       └─> Imagen subida exitosamente

8️⃣  WORKFLOW TERMINA
    └─> GitHub revoca GITHUB_TOKEN
         └─> Token ya no funciona
              └─> Runner se destruye
```

---

## 🔐 Detalles de Autenticación

### ¿Qué hace `docker login`?

```bash
docker login ghcr.io -u fescobarmo -p ghp_abc123...
```

#### Proceso interno:

```
1. Docker envía credenciales a ghcr.io
   POST https://ghcr.io/v2/
   Authorization: Basic base64(fescobarmo:ghp_abc123...)

2. GHCR recibe y valida con GitHub API
   GET https://api.github.com/user
   Authorization: Bearer ghp_abc123...
   
   GitHub responde:
   {
     "login": "fescobarmo",
     "id": 12345,
     "permissions": ["packages:write"]
   }

3. GHCR verifica permisos
   ✅ Usuario válido: fescobarmo
   ✅ Token válido: ghp_abc123...
   ✅ Permiso packages:write: Sí
   
4. GHCR responde a Docker
   200 OK
   {
     "token": "eyJhbGciOiJSUzI1NiIs...",  # Token JWT temporal
     "expires_in": 300                      # 5 minutos
   }

5. Docker guarda token JWT
   ~/.docker/config.json
   
6. Futuros requests usan el JWT
   docker push → Usa JWT → GHCR acepta
```

---

## 🆚 GitHub Container Registry vs Docker Hub

### GHCR (ghcr.io) - Lo que usamos

```yaml
registry: ghcr.io
username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}  # Automático
```

#### Ventajas

- ✅ Token automático (GITHUB_TOKEN)
- ✅ Integrado con GitHub
- ✅ Sin configuración adicional
- ✅ Mismo billing que GitHub
- ✅ Permisos granulares por repo
- ✅ Gratis para repos públicos
- ✅ Sin rate limits estrictos

#### Imágenes resultantes

```
ghcr.io/fescobarmo/controlacceso-backend:latest
ghcr.io/fescobarmo/controlacceso-frontend:latest
ghcr.io/fescobarmo/controlacceso-database:latest
```

---

### Docker Hub (docker.io) - Alternativa

```yaml
registry: docker.io  # o registry.hub.docker.com
username: ${{ secrets.DOCKERHUB_USERNAME }}     # Manual
password: ${{ secrets.DOCKERHUB_TOKEN }}        # Manual
```

#### Requiere configuración manual

1. **Crear cuenta en Docker Hub**: https://hub.docker.com
2. **Generar Access Token**: Account Settings → Security → New Access Token
3. **Agregar secrets en GitHub**:
   - Settings → Secrets → New repository secret
   - `DOCKERHUB_USERNAME`: tu-usuario
   - `DOCKERHUB_TOKEN`: dckr_pat_abc123...

#### Ventajas

- ✅ Más conocido
- ✅ Mayor ecosistema
- ✅ Docker pull por defecto

#### Desventajas

- ❌ Requiere configuración manual
- ❌ Tokens separados
- ❌ Rate limits más estrictos
- ❌ Pull limits para usuarios anónimos

---

## 📊 Comparación de Tokens

| Aspecto | GITHUB_TOKEN | Docker Hub Token |
|---------|--------------|------------------|
| **Creación** | Automático | Manual |
| **Duración** | Por workflow run | Permanente (hasta revocar) |
| **Scope** | Repo específico | Toda la cuenta |
| **Permisos** | Definidos en workflow | Full access o read-only |
| **Revocación** | Automática | Manual |
| **Seguridad** | Alta (temporal) | Media (permanente) |
| **Configuración** | 0 pasos | 3+ pasos |

---

## 🔍 Ver la Conexión en Acción

### En GitHub Actions Logs

Cuando ejecutas el workflow, verías:

```
Run docker/login-action@v3
  with:
    registry: ghcr.io
    username: fescobarmo
    password: ***

Logging in to ghcr.io...
Login Succeeded
```

**Nota**: El password se muestra como `***` por seguridad.

---

### En el Código del Workflow

```yaml
# Archivo: .github/workflows/docker-build.yml

# Define permisos del GITHUB_TOKEN
permissions:
  packages: write    # ← Permite push a GHCR

jobs:
  build-backend:
    steps:
      # 1. Login a GHCR
      - name: Login a GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io                    # Dónde
          username: ${{ github.actor }}         # Quién (fescobarmo)
          password: ${{ secrets.GITHUB_TOKEN }} # Cómo (token auto)
      
      # 2. Build imagen
      - name: Construir y pushear Backend
        uses: docker/build-push-action@v5
        with:
          push: true                           # ← Usa la conexión del login
          tags: ghcr.io/fescobarmo/controlacceso-backend:latest
```

---

## 🛡️ Seguridad

### ¿Por qué es seguro?

```
1. Token temporal
   └─> Solo válido durante el workflow
       └─> Se revoca automáticamente
           └─> No puede usarse después

2. Permisos mínimos
   └─> Solo packages:write
       └─> No puede modificar código
           └─> No puede eliminar repo

3. Scope limitado
   └─> Solo este repo
       └─> No afecta otros repos
           └─> Aislamiento por proyecto

4. Auditado
   └─> Todos los push se registran
       └─> Security → Packages
           └─> Trazabilidad completa

5. Sin exposición
   └─> Token nunca se imprime en logs
       └─> Se muestra como ***
           └─> Imposible de extraer
```

---

### Buenas Prácticas de Seguridad

#### 1. Usar permisos mínimos

```yaml
# ✅ BIEN - Solo lo necesario
permissions:
  contents: read
  packages: write

# ❌ MAL - Demasiado permisivo
permissions: write-all
```

---

#### 2. No hardcodear credenciales

```yaml
# ❌ MAL - Credenciales en código
password: "ghp_abc123def456..."

# ✅ BIEN - Usar secrets
password: ${{ secrets.GITHUB_TOKEN }}
```

---

#### 3. Validar origen del workflow

```yaml
# Solo ejecutar en repo principal
if: github.repository == 'fescobarmo/ControlAcceso'
```

---

## 📍 Ubicación de las Imágenes

### En GitHub

Las imágenes pushadas se ven en:

```
https://github.com/fescobarmo?tab=packages

Packages
├─ controlacceso-backend
│  ├─ latest (hace 2 horas)
│  ├─ main (hace 2 horas)
│  └─ main-abc123 (hace 2 horas)
├─ controlacceso-frontend
│  └─ ...
└─ controlacceso-database
   └─ ...
```

### Pull de las Imágenes

#### Repositorio Público

```bash
# Cualquiera puede hacer pull (repo público)
docker pull ghcr.io/fescobarmo/controlacceso-backend:latest

# Sin necesidad de docker login
```

#### Repositorio Privado

```bash
# Necesitarías autenticarte primero
echo $GITHUB_TOKEN | docker login ghcr.io -u fescobarmo --password-stdin
docker pull ghcr.io/fescobarmo/controlacceso-backend:latest
```

---

## 🎯 Diagrama de Conexión Completo

```
GitHub Actions                    GHCR (ghcr.io)                 GitHub API
     │                                 │                              │
     │ 1. Genera GITHUB_TOKEN          │                              │
     │    (con packages:write)         │                              │
     │                                 │                              │
     │ 2. docker login ghcr.io         │                              │
     │    -u fescobarmo                │                              │
     │    -p <GITHUB_TOKEN>            │                              │
     ├────────────────────────────────>│                              │
     │                                 │                              │
     │                                 │ 3. Valida token              │
     │                                 ├─────────────────────────────>│
     │                                 │                              │
     │                                 │ 4. Token válido ✅           │
     │                                 │<─────────────────────────────┤
     │                                 │    User: fescobarmo          │
     │                                 │    Perms: packages:write     │
     │                                 │                              │
     │ 5. Login Succeeded              │                              │
     │<────────────────────────────────┤                              │
     │    Token JWT guardado           │                              │
     │                                 │                              │
     │ 6. docker build                 │                              │
     │    (construye imagen)           │                              │
     │                                 │                              │
     │ 7. docker push imagen            │                              │
     │    (usa token del login)        │                              │
     ├────────────────────────────────>│                              │
     │                                 │                              │
     │                                 │ 8. Verifica permisos         │
     │                                 │    (usa JWT)                 │
     │                                 │                              │
     │ 9. Push exitoso ✅              │                              │
     │<────────────────────────────────┤                              │
     │    Layers uploaded              │                              │
     │                                 │                              │
     │ 10. Workflow termina            │                              │
     │     (token se revoca)           │                              │
     │                                 │                              │
```

---

## 💻 Ejemplo Completo

### Workflow Completo

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

# ← PASO 1: Definir permisos
permissions:
  contents: read      # Leer código
  packages: write     # Push a GHCR

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      # ← PASO 2: Checkout código
      - name: Checkout
        uses: actions/checkout@v4
      
      # ← PASO 3: Setup Buildx
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      # ← PASO 4: LOGIN (LA CONEXIÓN)
      - name: Login a GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      # ← PASO 5: Build y Push (usa la conexión)
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/mi-app:latest
```

### Ejecución Real

```bash
# Trigger
git push origin main

# GitHub Actions ejecuta:

# 1. Genera token
GITHUB_TOKEN=ghp_abc123def456...xyz789

# 2. Login
docker login ghcr.io -u fescobarmo -p $GITHUB_TOKEN
# Login Succeeded

# 3. Build
docker buildx build --tag ghcr.io/fescobarmo/mi-app:latest ./backend

# 4. Push
docker push ghcr.io/fescobarmo/mi-app:latest
# The push refers to repository [ghcr.io/fescobarmo/mi-app]
# latest: digest: sha256:abc123... size: 1234

# 5. Cleanup
# Token se revoca automáticamente
```

---

## 🔧 Troubleshooting

### Error: Permission denied

```
Error: denied: permission_denied: write_package
```

**Causa**: Falta permiso `packages: write`

**Solución**:
```yaml
permissions:
  packages: write  # ← Agregar esto
```

---

### Error: Unauthorized

```
Error: unauthorized: authentication required
```

**Causa**: No se ejecutó `docker login` antes de `docker push`

**Solución**:
```yaml
# Asegúrate que login está ANTES de build-push
- name: Login a GHCR
  uses: docker/login-action@v3
  # ...

- name: Build and Push
  uses: docker/build-push-action@v5
  # ...
```

---

### Error: Invalid credentials

```
Error: Error response from daemon: Get "https://ghcr.io/v2/": invalid credentials
```

**Causa**: Token inválido o expirado

**Solución**:
```yaml
# Verificar que usas GITHUB_TOKEN (no otro token)
password: ${{ secrets.GITHUB_TOKEN }}  # ← Correcto
```

---

## 📚 Referencias

- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GITHUB_TOKEN Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [docker/login-action](https://github.com/docker/login-action)
- [docker/build-push-action](https://github.com/docker/build-push-action)

---

## 🎉 Resumen

### Puntos Clave

1. **GITHUB_TOKEN**: Generado automáticamente, no necesitas crearlo
2. **ghcr.io**: Registry nativo de GitHub, integración perfecta
3. **docker/login-action**: Maneja la autenticación por ti
4. **packages: write**: Permiso necesario en el workflow
5. **Temporal**: Token solo válido durante el workflow
6. **Seguro**: Revocación automática al terminar
7. **Sin configuración**: Cero pasos manuales requeridos

---

### Flujo Simplificado

```
1. Workflow inicia → GitHub genera token
2. Login a GHCR → Usa token automático
3. Build imagen → Construye Docker image
4. Push imagen → Usa credenciales del login
5. Workflow termina → Token revocado
```

---

### Ventajas de GHCR

✅ **Automático**: Sin configuración manual  
✅ **Seguro**: Tokens temporales y revocados  
✅ **Integrado**: Parte del ecosistema GitHub  
✅ **Gratuito**: Para repos públicos  
✅ **Rápido**: Infraestructura optimizada  

---

**¿Preguntas sobre la conexión GitHub-Docker?** Consulta este documento o los logs de GitHub Actions. 🚀

