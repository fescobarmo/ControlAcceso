# 🚨 Solución: "No genera nada en Vercel"

## ❌ Problema Detectado

```
Error: No existing credentials found. Please run `vercel login`
```

**No has iniciado sesión en Vercel.** Por eso no se puede desplegar nada.

---

## ✅ Solución Paso a Paso

### Paso 1: Iniciar Sesión en Vercel

```bash
vercel login
```

**Opciones de login:**
- **Email**: Te enviará un link de verificación a tu correo
- **GitHub**: Login con tu cuenta de GitHub (recomendado)
- **GitLab**: Login con GitLab
- **Bitbucket**: Login con Bitbucket

**Recomendación:** Usa GitHub si tu proyecto ya está en GitHub.

---

### Paso 2: Verificar Autenticación

```bash
vercel whoami
```

Debe mostrar tu username de Vercel. Si muestra tu nombre, ¡ya estás listo!

---

### Paso 3: Deploy del Backend (Primero)

```bash
cd backend

# Link con Vercel (primera vez)
vercel

# Responde:
# Set up and deploy? → Yes
# Which scope? → Tu cuenta personal
# Link to existing project? → No
# What's your project's name? → controlacceso-backend
# In which directory is your code located? → ./
# Want to override the settings? → No

# Una vez configurado, deploy a producción
vercel --prod
```

**⚠️ IMPORTANTE:** Copia la URL que te da, algo como:
```
https://controlacceso-backend-xxx.vercel.app
```

---

### Paso 4: Configurar Variables de Entorno del Backend

Ahora que tienes el proyecto creado en Vercel, configura las variables:

#### Opción A: Desde el Dashboard (Más fácil)

1. Ve a: https://vercel.com/dashboard
2. Busca tu proyecto `controlacceso-backend`
3. Settings → Environment Variables
4. Agrega todas las variables (ver `VARIABLES_ENTORNO_VERCEL.md`)

#### Opción B: Desde la terminal

```bash
cd backend

# Base de datos
vercel env add DB_HOST production
# Cuando pregunte: db.xxxxxxxxxxxx.supabase.co

vercel env add DB_PORT production
# Cuando pregunte: 5432

vercel env add DB_NAME production
# Cuando pregunte: postgres

vercel env add DB_USER production
# Cuando pregunte: postgres

vercel env add DB_PASSWORD production
# Cuando pregunte: [tu-password-de-supabase]

vercel env add DB_SSL production
# Cuando pregunte: true

# JWT
vercel env add JWT_SECRET production
# Cuando pregunte: [genera uno con: openssl rand -base64 64]

vercel env add JWT_EXPIRES_IN production
# Cuando pregunte: 24h

# Continúa con el resto de variables...
```

---

### Paso 5: Re-deploy del Backend (Para aplicar variables)

```bash
cd backend
vercel --prod
```

Las variables de entorno solo se aplican después de un nuevo deploy.

---

### Paso 6: Deploy del Frontend

```bash
cd ../frontend

# Link con Vercel (primera vez)
vercel

# Responde:
# Set up and deploy? → Yes
# Which scope? → Tu cuenta personal
# Link to existing project? → No
# What's your project's name? → controlacceso-frontend
# In which directory is your code located? → ./
# Want to override the settings? → No

# Deploy a producción
vercel --prod
```

---

### Paso 7: Configurar Variables del Frontend

```bash
cd frontend

vercel env add REACT_APP_API_URL production
# URL del backend que copiaste antes

vercel env add REACT_APP_BACKEND_URL production
# Misma URL del backend

vercel env add REACT_APP_SUPABASE_URL production
# Tu URL de Supabase

vercel env add REACT_APP_SUPABASE_ANON_KEY production
# Tu anon key de Supabase
```

---

### Paso 8: Re-deploy del Frontend

```bash
cd frontend
vercel --prod
```

---

### Paso 9: Verificar que Todo Funciona

```bash
# Ver tus proyectos
vercel ls

# Ver las URLs de tus proyectos
vercel ls --prod

# Verificar que el backend responde
curl https://tu-backend-url.vercel.app/health

# Verificar que el frontend carga
curl -I https://tu-frontend-url.vercel.app
```

---

## 🎯 Resumen de Comandos (Orden Completo)

```bash
# 1. Login
vercel login

# 2. Verificar login
vercel whoami

# 3. Deploy backend
cd backend
vercel
vercel --prod

# 4. Configurar variables backend (Dashboard o CLI)
# ... agregar todas las variables ...

# 5. Re-deploy backend
vercel --prod

# 6. Deploy frontend
cd ../frontend
vercel
vercel --prod

# 7. Configurar variables frontend
# ... agregar variables del frontend ...

# 8. Re-deploy frontend
vercel --prod

# 9. Verificar
cd ..
vercel ls
```

---

## ⚠️ Problemas Comunes

### "No credentials found"
```bash
vercel login
```

### "Project not found"
- Primero debes hacer `vercel` (sin --prod) para crear/linkear el proyecto
- Luego `vercel --prod` para desplegar a producción

### "Build failed"
- Revisa los logs: `vercel logs [deployment-url]`
- Asegúrate de que las dependencias estén en `package.json`

### "Environment variables not working"
- Debes re-deployar después de agregar variables
- Las variables solo se aplican en el siguiente deploy

### "Cannot connect to database"
- Verifica que todas las variables de DB estén configuradas
- Asegúrate de que `DB_SSL=true`

---

## 📝 Script Automatizado (Después del Login)

Una vez que hayas hecho login, puedes usar el script:

```bash
npm run deploy:vercel
```

O el script interactivo:

```bash
./scripts/deploy-vercel.sh
```

---

## 🆘 ¿Necesitas Ayuda?

### Ver logs de un deployment
```bash
vercel logs [deployment-url]
```

### Ver deployments
```bash
vercel ls
```

### Remover un proyecto
```bash
vercel remove [project-name]
```

### Cambiar de cuenta
```bash
vercel logout
vercel login
```

---

## ✅ Checklist Final

- [ ] `vercel login` ejecutado
- [ ] `vercel whoami` muestra tu username
- [ ] Backend deployado (`cd backend && vercel --prod`)
- [ ] Variables del backend configuradas
- [ ] Backend re-deployado (para aplicar variables)
- [ ] Frontend deployado (`cd frontend && vercel --prod`)
- [ ] Variables del frontend configuradas (con URL del backend)
- [ ] Frontend re-deployado
- [ ] Ambos proyectos visibles en `vercel ls`
- [ ] Backend responde en `/health`
- [ ] Frontend carga correctamente

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación estará desplegada en Vercel.

**URLs típicas:**
- Frontend: `https://controlacceso-frontend.vercel.app`
- Backend: `https://controlacceso-backend.vercel.app`

**Próximos deploys:**
```bash
# Backend
cd backend && vercel --prod

# Frontend
cd frontend && vercel --prod

# O usa el script
npm run deploy:vercel
```

