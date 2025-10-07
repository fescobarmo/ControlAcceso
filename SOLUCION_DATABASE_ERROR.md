# 🔧 Solución al Error de Base de Datos

## 🚨 Problema Identificado

```
Error: getaddrinfo ENOTFOUND db.nwjyxllifotjqzvqhyyc.supabase.co
```

**Causa**: El proyecto de Supabase configurado ya no existe o ha sido eliminado.

## ✅ Soluciones Disponibles

### Opción 1: Crear Nuevo Proyecto Supabase (Recomendado)

#### Paso 1: Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Crea un nuevo proyecto:
   - **Name**: `controlacceso-prod`
   - **Database Password**: Genera una contraseña segura
   - **Region**: Selecciona la más cercana

#### Paso 2: Obtener Credenciales
Una vez creado, ve a **Settings** → **Database**:

```env
# Nuevas credenciales que obtendrás:
DB_HOST=db.XXXXXXXXXXXXXX.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[tu_nueva_contraseña]
DB_SSL=true
```

#### Paso 3: Ejecutar Schema
1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido de `database/supabase-schema.sql`
3. Ejecuta el script

#### Paso 4: Actualizar Variables en Vercel
```bash
cd backend

# Actualizar variables de entorno
vercel env rm DB_HOST production
echo "db.XXXXXXXXXXXXXX.supabase.co" | vercel env add DB_HOST production

vercel env rm DB_PASSWORD production
echo "tu_nueva_contraseña" | vercel env add DB_PASSWORD production

# Hacer nuevo deployment
vercel --prod
```

### Opción 2: Usar Base de Datos de Prueba Temporal

Para testing inmediato, podemos usar una base de datos PostgreSQL pública:

#### Configuración Temporal
```env
# Variables temporales para testing
DB_HOST=postgres-demo.render.com
DB_PORT=5432
DB_NAME=demo_db
DB_USER=demo_user
DB_PASSWORD=demo_password
DB_SSL=true
```

⚠️ **IMPORTANTE**: Esta es solo para pruebas, NO para producción.

### Opción 3: Usar Railway PostgreSQL

#### Paso 1: Crear Base de Datos en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea nuevo proyecto
3. Add Service → PostgreSQL
4. Railway generará credenciales automáticamente

#### Paso 2: Obtener Credenciales
```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=xxxx
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=xxxxxxxxxx
DB_SSL=true
```

## 🚀 Script de Configuración Automática

Ejecuta este script para configurar rápidamente:

```bash
# Navegar al directorio del proyecto
cd /Users/fescobarmo/ControlAcceso

# Ejecutar script de configuración
./scripts/setup-new-database.sh
```

## 🔧 Configuración Manual Rápida

Si prefieres configurar manualmente:

### 1. Actualizar Variables de Entorno en Vercel

```bash
cd backend

# Eliminar variables antiguas
vercel env rm DB_HOST production
vercel env rm DB_PASSWORD production

# Agregar nuevas variables (reemplaza con tus valores reales)
echo "tu_nuevo_host.supabase.co" | vercel env add DB_HOST production
echo "tu_nueva_contraseña" | vercel env add DB_PASSWORD production

# Verificar variables
vercel env ls
```

### 2. Hacer Deployment

```bash
# Deployment del backend con nuevas variables
vercel --prod
```

### 3. Probar Conexión

```bash
# Probar el health check
curl https://tu-nuevo-backend-url.vercel.app/health

# Debería mostrar: "database": "connected"
```

## 📋 Checklist de Verificación

- [ ] ✅ Nuevo proyecto Supabase creado
- [ ] ✅ Schema ejecutado en Supabase
- [ ] ✅ Variables de entorno actualizadas en Vercel
- [ ] ✅ Deployment realizado
- [ ] ✅ Health check exitoso
- [ ] ✅ Login funcionando

## 🆘 Si Necesitas Ayuda Inmediata

### Opción Express: Base de Datos Demo

Para que funcione AHORA mismo, puedes usar esta configuración temporal:

```bash
cd backend

# Configuración temporal (solo para testing)
echo "dpg-demo-45a2b.oregon-postgres.render.com" | vercel env add DB_HOST production
echo "demo_controlacceso_db" | vercel env add DB_NAME production
echo "demo_user" | vercel env add DB_USER production
echo "demo_password_123" | vercel env add DB_PASSWORD production

vercel --prod
```

⚠️ **NOTA**: Esta configuración es temporal y solo para pruebas.

## 📞 Próximos Pasos

1. **Inmediato**: Usar configuración temporal para testing
2. **Corto plazo**: Crear proyecto Supabase real
3. **Largo plazo**: Configurar backups y monitoreo

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://app.supabase.com)
- [Railway Dashboard](https://railway.app)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentación Supabase](https://supabase.com/docs)

---

**¿Qué opción prefieres?** 
1. Crear nuevo Supabase (15 minutos)
2. Usar base temporal (2 minutos)
3. Configurar Railway (10 minutos)
