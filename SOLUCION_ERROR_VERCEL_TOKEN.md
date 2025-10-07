# 🔧 Solución: Error de Credenciales de Vercel en GitHub Actions

## 🚨 Error Identificado

```
Error: No existing credentials found. Please run `vercel login` or pass "--token"
Learn More: https://err.sh/vercel/no-credentials-found
Error: Process completed with exit code 1.
```

**Causa**: El workflow de GitHub Actions no tiene configurado el token de Vercel para autenticarse.

---

## ✅ Solución: Configurar Token de Vercel en GitHub

### Paso 1: Obtener Token de Vercel

1. Ve a tu cuenta de Vercel: [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Haz clic en **"Create Token"**
3. Dale un nombre descriptivo: `GitHub Actions - ControlAcceso`
4. Selecciona el scope: **Full Account**
5. Haz clic en **"Create"**
6. **¡IMPORTANTE!**: Copia el token inmediatamente (solo se muestra una vez)

El token tendrá este formato:
```
vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 2: Agregar Token como Secreto en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/fescobarmo/ControlAcceso`
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, haz clic en **Secrets and variables** → **Actions**
4. Haz clic en **"New repository secret"**
5. Configura el secreto:
   - **Name**: `VERCEL_TOKEN`
   - **Value**: Pega el token que copiaste de Vercel
6. Haz clic en **"Add secret"**

### Paso 3: Obtener IDs de Vercel (Opcional pero Recomendado)

También necesitas los IDs de tus proyectos:

#### Para obtener VERCEL_ORG_ID y VERCEL_PROJECT_ID:

**Opción A: Desde la Terminal**
```bash
cd frontend
vercel link
# Esto creará un archivo .vercel/project.json

cat .vercel/project.json
# Verás algo como:
# {
#   "orgId": "team_xxxxxxxxxxxx",
#   "projectId": "prj_xxxxxxxxxxxx"
# }
```

**Opción B: Desde Vercel Dashboard**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → General
3. Busca "Project ID" y "Team ID"

#### Agregar estos secretos en GitHub:

Repite el Paso 2 para agregar:
- **Name**: `VERCEL_ORG_ID` → **Value**: Tu Team/Org ID
- **Name**: `VERCEL_PROJECT_ID_FRONTEND` → **Value**: ID del proyecto frontend
- **Name**: `VERCEL_PROJECT_ID_BACKEND` → **Value**: ID del proyecto backend

---

## 🔧 Actualizar Workflow de GitHub Actions

Si tienes workflows en `.github/workflows/`, actualízalos para usar los secretos:

### Ejemplo de Workflow Corregido:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_FRONTEND }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./backend
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./backend
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./backend
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_BACKEND }}
```

---

## 🎯 Solución Alternativa: Desactivar Workflows

Si no necesitas deployment automático desde GitHub Actions, puedes:

### Opción 1: Desactivar el Workflow

1. Ve a tu repositorio en GitHub
2. Actions → Selecciona el workflow problemático
3. Haz clic en los tres puntos (...) → **Disable workflow**

### Opción 2: Eliminar los Archivos de Workflow

```bash
cd /Users/fescobarmo/ControlAcceso
rm -rf .github/workflows/*.yml
git add .github/
git commit -m "chore: Remover workflows de GitHub Actions - deployment manual desde CLI"
git push origin main
```

### Opción 3: Usar Solo Vercel CLI (Recomendado)

En lugar de GitHub Actions, simplemente despliega manualmente:

```bash
# Frontend
cd frontend
vercel --prod

# Backend
cd ../backend
vercel --prod
```

**Ventajas**:
- ✅ Más simple
- ✅ Más rápido
- ✅ Control total sobre el deployment
- ✅ No requiere configurar secretos en GitHub

---

## 📋 Checklist de Configuración

### Si quieres usar GitHub Actions:
- [ ] ✅ Token de Vercel creado
- [ ] ✅ `VERCEL_TOKEN` agregado como secreto en GitHub
- [ ] ✅ `VERCEL_ORG_ID` agregado (opcional)
- [ ] ✅ `VERCEL_PROJECT_ID_FRONTEND` agregado (opcional)
- [ ] ✅ `VERCEL_PROJECT_ID_BACKEND` agregado (opcional)
- [ ] ✅ Workflow actualizado con los secretos
- [ ] ✅ Push de cambios a GitHub
- [ ] ✅ Workflow ejecutado exitosamente

### Si prefieres deployment manual:
- [ ] ✅ Workflows desactivados o eliminados
- [ ] ✅ Deployment con `vercel --prod` desde CLI
- [ ] ✅ Frontend y Backend actualizados

---

## 🔑 Secretos Necesarios en GitHub

| Secret Name | Descripción | Dónde Obtenerlo |
|------------|-------------|-----------------|
| `VERCEL_TOKEN` | Token de autenticación | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | ID de tu organización/equipo | `.vercel/project.json` o Vercel Dashboard |
| `VERCEL_PROJECT_ID_FRONTEND` | ID del proyecto frontend | `.vercel/project.json` o Vercel Dashboard |
| `VERCEL_PROJECT_ID_BACKEND` | ID del proyecto backend | `.vercel/project.json` o Vercel Dashboard |

---

## ⚠️ Notas de Seguridad

- ❌ **NUNCA** commitees el token de Vercel al repositorio
- ❌ **NUNCA** compartas el token públicamente
- ✅ **SIEMPRE** usa GitHub Secrets para tokens sensibles
- ✅ **ROTA** los tokens periódicamente por seguridad
- ✅ **LIMITA** el scope del token al mínimo necesario

---

## 🎯 Recomendación Final

**Para este proyecto, recomiendo usar deployment manual** con `vercel --prod` desde la CLI:

**Ventajas**:
- ✅ Más simple de configurar
- ✅ Sin necesidad de secretos en GitHub
- ✅ Control directo sobre los deployments
- ✅ Más rápido para proyectos pequeños

**Cuándo usar GitHub Actions**:
- ⚙️ Equipos grandes con múltiples colaboradores
- ⚙️ Necesidad de CI/CD completo
- ⚙️ Tests automáticos antes del deployment
- ⚙️ Deployments frecuentes (múltiples veces al día)

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el token esté correctamente copiado (sin espacios extras)
2. Asegúrate de que el token tenga los permisos correctos
3. Revisa los logs del workflow en GitHub Actions
4. Consulta la documentación de Vercel: [vercel.com/docs](https://vercel.com/docs)

---

**¡Con esto deberías poder solucionar el error de credenciales!** 🚀
