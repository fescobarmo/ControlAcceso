# 📝 Instrucciones: Ejecutar Schema en Supabase SQL Editor

## 🎯 Archivo a Usar

📄 **`supabase-schema.sql`** - Schema completo optimizado para Supabase

---

## 🚀 Pasos para Ejecutar

### 1. Abrir Supabase Dashboard

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto **ControlAcceso**

### 2. Abrir SQL Editor

1. En el menú lateral izquierdo, busca **SQL Editor**
2. Haz clic en **"New Query"** o **"+"** para crear un nuevo query

### 3. Copiar el Schema

**Opción A: Copiar desde el archivo**

```bash
# Abrir el archivo en tu editor
cat database/supabase-schema.sql

# O copiarlo al clipboard (macOS)
cat database/supabase-schema.sql | pbcopy
```

**Opción B: Abrir directamente**

1. Abre el archivo `database/supabase-schema.sql` en tu editor de código
2. Selecciona todo el contenido (Cmd/Ctrl + A)
3. Copia (Cmd/Ctrl + C)

### 4. Pegar en SQL Editor

1. Pega todo el contenido en el editor SQL de Supabase
2. **NO ejecutes todavía**, primero revisa el contenido

### 5. Revisar el Script

El script incluye:

- ✅ **Extensiones**: uuid-ossp, pgcrypto
- ✅ **13 Tablas**: roles, perfiles, usuarios, áreas, etc.
- ✅ **20+ Índices**: Para optimización
- ✅ **Triggers**: Para auditoría y updated_at
- ✅ **Datos Iniciales**: 10 roles, 10 perfiles, usuario admin, áreas, etc.
- ✅ **Vistas**: Para consultas complejas
- ✅ **Funciones**: Utilidades para permisos

### 6. Ejecutar el Script

1. Haz clic en el botón **"Run"** (esquina inferior derecha)
2. O presiona **Ctrl/Cmd + Enter**
3. **Espera**: La ejecución puede tardar 10-30 segundos

### 7. Verificar Ejecución

Si todo salió bien, verás:

```
Success. No rows returned
```

O múltiples mensajes de éxito en la consola.

---

## ✅ Verificación Post-Instalación

### Ver Tablas Creadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Resultado esperado**: 13 tablas

```
- areas
- auditoria
- configuracion_sistema
- dispositivos
- logs_acceso
- perfiles
- permisos_acceso
- residentes
- roles
- sesiones
- usuarios
```

### Ver Roles

```sql
SELECT id, nombre, nivel_acceso, color 
FROM roles 
ORDER BY nivel_acceso DESC;
```

**Resultado esperado**: 10 roles

### Ver Usuario Admin

```sql
SELECT id, username, email, estado, rol_id, perfil_id 
FROM usuarios 
WHERE username = 'admin';
```

**Resultado esperado**: 1 usuario

```
username: admin
email: admin@controlacceso.com
estado: activo
```

### Ver Áreas

```sql
SELECT id, nombre, ubicacion, nivel_acceso 
FROM areas;
```

**Resultado esperado**: 10 áreas

### Estadísticas

```sql
SELECT * FROM get_users_by_role_stats();
```

### Ver Vistas Creadas

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

**Resultado esperado**: 3 vistas

```
- v_usuarios_completos
- v_accesos_recientes
- v_permisos_usuario
```

---

## 🔐 Credenciales por Defecto

El script crea un usuario administrador:

```
Usuario: admin
Contraseña: Admin123!
Email: admin@controlacceso.com
```

⚠️ **IMPORTANTE**: 

**CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE EN PRODUCCIÓN**

Para cambiar la contraseña, desde tu aplicación backend usa bcrypt:

```javascript
const bcrypt = require('bcryptjs');
const newPassword = 'TuNuevaContraseñaSegura123!';
const hash = await bcrypt.hash(newPassword, 10);
// Luego actualiza en la BD
```

O desde SQL (requiere la extensión pgcrypto):

```sql
UPDATE usuarios 
SET password_hash = crypt('TuNuevaContraseñaSegura123!', gen_salt('bf', 10))
WHERE username = 'admin';
```

---

## 🛠️ Comandos Útiles

### Resetear Todo (⚠️ PELIGROSO)

```sql
-- ⚠️ ESTO BORRA TODAS LAS TABLAS Y DATOS
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Luego ejecuta el schema de nuevo
```

### Ver Tamaño de las Tablas

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Ver Índices

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Ver Triggers

```sql
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

### Backup Manual

```sql
-- Crear backup de roles y perfiles (por si acaso)
CREATE TABLE backup_roles AS SELECT * FROM roles;
CREATE TABLE backup_perfiles AS SELECT * FROM perfiles;
CREATE TABLE backup_usuarios AS SELECT * FROM usuarios;
```

---

## ❌ Solución de Problemas

### Error: "extension uuid-ossp does not exist"

**Causa**: Extensión no disponible (raro en Supabase)

**Solución**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "relation already exists"

**Causa**: Las tablas ya existen

**Solución**: El script usa `IF NOT EXISTS`, así que puedes ejecutarlo múltiples veces sin problema. Si quieres resetear:

```sql
-- Eliminar tablas específicas
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
-- etc...

-- O resetear todo (⚠️)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### Error: "permission denied"

**Causa**: Usuario sin permisos

**Solución**: Usa el usuario `postgres` (por defecto en Supabase)

### Script muy lento

**Causa**: Proyecto en plan gratuito o mucho tráfico

**Solución**: 
- Espera pacientemente
- Ejecuta en secciones (primero tablas, luego datos)
- Verifica en [status.supabase.com](https://status.supabase.com)

### Error en password_hash

**Causa**: El hash de bcrypt puede ser diferente

**Solución**: Genera un nuevo hash:

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('Admin123!', 10);
console.log(hash);
```

Luego actualiza el SQL con el nuevo hash.

---

## 📊 Estructura del Schema

```
┌─────────────────┐
│     roles       │ ←─┐
└─────────────────┘   │
                      │
┌─────────────────┐   │
│    perfiles     │ ←─┤
└─────────────────┘   │
                      │
┌─────────────────┐   │
│    usuarios     │───┘
└─────────────────┘
         │
         ├──→ permisos_acceso ──→ areas
         │
         ├──→ logs_acceso ──→ areas, dispositivos
         │
         ├──→ sesiones
         │
         └──→ auditoria
```

---

## 🎉 ¡Completado!

Si todo salió bien:

✅ 13 tablas creadas  
✅ 20+ índices creados  
✅ Triggers de auditoría activos  
✅ Datos iniciales cargados  
✅ Funciones y vistas disponibles  

**Próximos pasos:**

1. Conecta tu backend a Supabase
2. Prueba el login con `admin/Admin123!`
3. Cambia la contraseña del admin
4. Empieza a usar tu aplicación

---

## 📚 Referencias

- [Guía Completa Supabase](../GUIA_SUPABASE.md)
- [Inicio Rápido](../INICIO_RAPIDO_SUPABASE.md)
- [Documentación Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**¿Problemas?** Consulta la [Guía de Solución de Problemas](../GUIA_SUPABASE.md#solución-de-problemas)

