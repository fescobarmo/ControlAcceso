# 🐳 Configurar Docker Hub (Opcional)

## 📋 Resumen

Este documento explica cómo configurar Docker Hub para el proyecto ControlAcceso. 

**Nota**: Docker Hub es **opcional**. El proyecto ya funciona con GitHub Container Registry (GHCR).

---

## ❓ ¿Necesito Docker Hub?

### ✅ Usa Docker Hub si:
- Quieres que tus imágenes sean públicas y fáciles de encontrar
- Ya tienes una cuenta de Docker Hub
- Necesitas más visibilidad para tu proyecto
- Quieres aprovechar las funciones de Docker Hub (README automático, webhooks, etc.)

### 🚫 NO necesitas Docker Hub si:
- Solo vas a usar GitHub Container Registry (GHCR)
- Tus imágenes son privadas
- Prefieres mantener todo en el ecosistema de GitHub

---

## 🎯 Opción 1: Mantener Docker Hub Deshabilitado (Actual)

**Estado actual**: El workflow `dockerhub-push.yml` está **deshabilitado**.

No necesitas hacer nada. El proyecto funciona perfectamente con GHCR:
```
ghcr.io/fescobarmo/controlacceso-backend:latest
ghcr.io/fescobarmo/controlacceso-frontend:latest
ghcr.io/fescobarmo/controlacceso-database:latest
```

---

## 🔧 Opción 2: Habilitar Docker Hub

Si decides usar Docker Hub, sigue estos pasos:

### Paso 1: Crear Cuenta en Docker Hub

1. Ve a: https://hub.docker.com/signup
2. Crea una cuenta gratuita
3. Verifica tu email
4. Inicia sesión

### Paso 2: Crear Token de Acceso

1. **Ve a tu perfil**:
   - Click en tu nombre de usuario (arriba derecha)
   - Click en "Account Settings"

2. **Genera un Access Token**:
   - Ve a "Security" → "Personal access tokens"
   - Click en "Generate New Token"
   - **Nombre del token**: `GitHub-Actions-ControlAcceso`
   - **Permisos**: `Read & Write` (o `Read, Write & Delete`)
   - Click en "Generate"
   
3. **⚠️ COPIA EL TOKEN INMEDIATAMENTE**:
   ```
   dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   **No podrás verlo de nuevo**. Guárdalo en un lugar seguro temporalmente.

### Paso 3: Configurar Secrets en GitHub

1. **Ve a tu repositorio en GitHub**:
   ```
   https://github.com/fescobarmo/ControlAcceso
   ```

2. **Abre Settings**:
   - Click en "Settings" (arriba del repo)

3. **Ve a Secrets and variables**:
   - Click en "Secrets and variables" → "Actions"

4. **Agrega los secrets**:

   **Secret 1: DOCKERHUB_USERNAME**
   - Click en "New repository secret"
   - Name: `DOCKERHUB_USERNAME`
   - Secret: `tu-usuario-de-dockerhub` (por ejemplo: `fescobarmo`)
   - Click en "Add secret"

   **Secret 2: DOCKERHUB_TOKEN**
   - Click en "New repository secret"
   - Name: `DOCKERHUB_TOKEN`
   - Secret: `dckr_pat_xxxxxxxxxx` (el token que copiaste)
   - Click en "Add secret"

### Paso 4: Actualizar el Workflow

Edita `.github/workflows/dockerhub-push.yml`:

```yaml
name: Docker Hub Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  workflow_dispatch:

env:
  DOCKERHUB_NAMESPACE: fescobarmo  # ⬅️ CAMBIA ESTO por tu usuario de Docker Hub
  IMAGE_NAME: controlacceso
```

### Paso 5: Hacer Commit y Push

```bash
cd /Users/fescobarmo/ControlAcceso

git add .github/workflows/dockerhub-push.yml
git commit -m "feat: Habilitar Docker Hub con credenciales configuradas"
git push origin main
```

### Paso 6: Verificar

1. **Verifica el workflow en GitHub**:
   - Ve a: https://github.com/fescobarmo/ControlAcceso/actions
   - El workflow "Docker Hub Push" debería ejecutarse
   - Verifica que todos los jobs completen exitosamente

2. **Verifica las imágenes en Docker Hub**:
   - Ve a: https://hub.docker.com/u/fescobarmo
   - Deberías ver:
     - `fescobarmo/controlacceso-backend`
     - `fescobarmo/controlacceso-frontend`
     - `fescobarmo/controlacceso-database`

---

## 📊 Comparación: GHCR vs Docker Hub

| Característica | GHCR | Docker Hub |
|----------------|------|------------|
| **Integración con GitHub** | ✅ Nativa | ⚠️ Requiere configuración |
| **Público/Privado** | ✅ Gratis ilimitado | ⚠️ 1 repo privado gratis |
| **Límite de pulls** | ✅ Sin límite para autenticados | ⚠️ 200/6h anónimo, 5000/día autenticado |
| **Visibilidad** | ⚠️ Menos conocido | ✅ Más popular |
| **README en registry** | ⚠️ No | ✅ Sí |
| **Webhooks** | ⚠️ Limitados | ✅ Completos |
| **Precio** | ✅ Gratis | ✅ Gratis (con límites) |

---

## 🔐 Seguridad de Tokens

### ✅ Buenas Prácticas

1. **Nunca compartas los tokens**:
   - ❌ No los subas a Git
   - ❌ No los pongas en el código
   - ❌ No los compartas en chat/email
   - ✅ Usa GitHub Secrets

2. **Usa permisos mínimos**:
   - Para CI/CD: `Read & Write` es suficiente
   - No uses `Read, Write & Delete` a menos que lo necesites

3. **Rota tokens periódicamente**:
   - Cada 90 días es una buena práctica
   - Revoca tokens viejos

4. **Un token por servicio**:
   - Crea un token específico para GitHub Actions
   - No reutilices tokens personales

### 🚨 Si Comprometes un Token

1. **Revoca el token inmediatamente**:
   - Ve a Docker Hub → Security → Personal access tokens
   - Click en "Revoke" junto al token comprometido

2. **Genera un nuevo token**:
   - Crea uno nuevo siguiendo Paso 2

3. **Actualiza el secret en GitHub**:
   - Settings → Secrets → DOCKERHUB_TOKEN → Update

---

## 🧪 Probar Localmente

Antes de hacer push a GitHub, puedes probar localmente:

```bash
# 1. Login a Docker Hub
docker login -u tu-usuario
# Te pedirá la contraseña o token

# 2. Construir imagen
docker build -t tu-usuario/controlacceso-backend:test ./backend

# 3. Push de prueba
docker push tu-usuario/controlacceso-backend:test

# 4. Verificar en Docker Hub
# https://hub.docker.com/r/tu-usuario/controlacceso-backend

# 5. Limpiar
docker rmi tu-usuario/controlacceso-backend:test
docker logout
```

---

## 📝 Checklist de Configuración

- [ ] Cuenta de Docker Hub creada
- [ ] Token de acceso generado
- [ ] `DOCKERHUB_USERNAME` agregado a GitHub Secrets
- [ ] `DOCKERHUB_TOKEN` agregado a GitHub Secrets
- [ ] `DOCKERHUB_NAMESPACE` actualizado en el workflow
- [ ] Workflow descomentado (triggers habilitados)
- [ ] Commit y push realizados
- [ ] Workflow ejecutado exitosamente
- [ ] Imágenes visibles en Docker Hub

---

## 🐛 Troubleshooting

### Error: "Username and password required"

**Causa**: Los secrets no están configurados o tienen nombres incorrectos.

**Solución**:
1. Verifica que los secrets existen en: Settings → Secrets and variables → Actions
2. Los nombres DEBEN ser exactamente:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
3. Si usas token, debe ser un Personal Access Token, no tu contraseña

### Error: "unauthorized: authentication required"

**Causa**: El token no tiene permisos suficientes o está revocado.

**Solución**:
1. Verifica que el token tiene permisos `Read & Write`
2. Genera un nuevo token si es necesario
3. Actualiza `DOCKERHUB_TOKEN` en GitHub Secrets

### Error: "repository name must be lowercase"

**Causa**: El nombre en `DOCKERHUB_NAMESPACE` tiene mayúsculas.

**Solución**:
```yaml
# ❌ INCORRECTO
DOCKERHUB_NAMESPACE: FescobarMo

# ✅ CORRECTO
DOCKERHUB_NAMESPACE: fescobarmo
```

### Error: "denied: requested access to the resource is denied"

**Causa**: El namespace no existe o no tienes permisos.

**Solución**:
1. Verifica que `DOCKERHUB_NAMESPACE` es tu nombre de usuario
2. O crea una organización en Docker Hub y usa ese nombre

---

## 💡 Recomendación

Para este proyecto, **recomiendo mantener solo GHCR** porque:

1. ✅ Ya está funcionando
2. ✅ Integración nativa con GitHub
3. ✅ Sin límites de pull
4. ✅ Repositorios privados ilimitados
5. ✅ Menos configuración

**Habilita Docker Hub solo si**:
- Quieres máxima visibilidad pública
- Necesitas funciones específicas de Docker Hub
- Ya tienes un ecosistema en Docker Hub

---

## 🔗 Referencias

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Managing Access Tokens](https://docs.docker.com/security/for-developers/access-tokens/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [docker/login-action](https://github.com/docker/login-action)

---

## 📅 Historial

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2025-10-01 | 1.0.0 | Documentación inicial |

---

**Estado Actual**: Docker Hub workflow está **DESHABILITADO** ✅

**Para habilitar**: Sigue la sección "Opción 2: Habilitar Docker Hub"

