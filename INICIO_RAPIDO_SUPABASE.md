# 🚀 Inicio Rápido - Despliegue en Supabase

Esta guía te llevará desde cero hasta tener tu aplicación funcionando en Supabase en **menos de 15 minutos**.

## ⚡ Pasos Rápidos

### 1️⃣ Crear Proyecto en Supabase (3 minutos)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Name**: `controlacceso`
   - **Password**: (genera una segura y guárdala)
   - **Region**: Selecciona la más cercana
3. Espera a que se cree el proyecto (~2 minutos)

### 2️⃣ Configurar Variables de Entorno (2 minutos)

Ejecuta el script de configuración automática:

```bash
cd /Users/fescobarmo/ControlAcceso
./scripts/setup-supabase.sh
```

El script te pedirá:
- **Host de Supabase**: Encuéntralo en Settings > Database > Host
- **Password**: El que creaste en el paso 1
- **JWT Secret**: (se genera automáticamente)
- **URLs**: Usa las que te proporciona (o localhost para desarrollo)

### 3️⃣ Migrar Base de Datos (5 minutos)

Opción A: **Script automático** (recomendado)

```bash
./scripts/migrate-to-supabase.sh
```

Opción B: **Manual desde Supabase**

1. Abre [app.supabase.com](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega el contenido de `database/schema.sql`
5. Click en "Run"

### 4️⃣ Verificar Conexión (1 minuto)

```bash
node scripts/test-supabase-connection.js
```

Deberías ver: ✅ La conexión a Supabase está funcionando correctamente

### 5️⃣ Iniciar Aplicación Localmente (2 minutos)

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend** (en otra terminal):
```bash
cd frontend
npm install
npm start
```

**Abrir navegador:** http://localhost:3000

---

## 🌐 Desplegar en Producción

Una vez que todo funcione localmente, despliega a producción:

### Backend → Railway

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio GitHub
3. Configura las variables de entorno desde `backend/.env`
4. Railway te dará una URL: `https://tu-app.railway.app`

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

Sigue las instrucciones y configura:
- `REACT_APP_API_URL` = URL de tu backend en Railway

---

## 📊 Credenciales por Defecto

Si ejecutaste el schema completo, deberías tener un usuario admin:

```
Usuario: admin
Contraseña: Admin123!
```

⚠️ **IMPORTANTE**: Cambia esta contraseña inmediatamente en producción.

---

## 🆘 ¿Problemas?

### No puedo conectarme a Supabase
```bash
# Verifica tus credenciales
cat backend/.env

# Prueba la conexión
node scripts/test-supabase-connection.js
```

### El backend no inicia
```bash
# Verifica que todas las dependencias estén instaladas
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Error de CORS
- Asegúrate de que `FRONTEND_URL` en `backend/.env` coincida con la URL de tu frontend
- En desarrollo, debería ser `http://localhost:3000`

### No veo las tablas en Supabase
- Ve a **SQL Editor** en Supabase
- Ejecuta: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
- Si no hay tablas, ejecuta `database/schema.sql` manualmente

---

## 📚 Documentación Completa

Para una guía detallada con todas las opciones de despliegue:

👉 **[GUIA_SUPABASE.md](./GUIA_SUPABASE.md)**

---

## ✅ Checklist

- [ ] Proyecto creado en Supabase
- [ ] Variables de entorno configuradas (`backend/.env` y `frontend/.env`)
- [ ] Base de datos migrada (schema.sql ejecutado)
- [ ] Conexión verificada (test-supabase-connection.js)
- [ ] Backend corriendo en http://localhost:3001
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Puedo hacer login con admin/Admin123!

---

## 🎯 Siguientes Pasos

1. **Crear usuarios reales** (elimina el usuario de prueba)
2. **Configurar roles y permisos** según tus necesidades
3. **Cambiar el JWT_SECRET** en producción
4. **Configurar backups automáticos** en Supabase
5. **Agregar dominio personalizado**

---

**¿Todo listo?** 🎉 ¡Tu aplicación está corriendo en Supabase!

**¿Necesitas ayuda?** Consulta [GUIA_SUPABASE.md](./GUIA_SUPABASE.md) o los logs de error.

