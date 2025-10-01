# Profundización: Función de Carga de la Base de Datos

## 🔍 Mecanismo de Inicialización de PostgreSQL

La carga de la base de datos en el sistema ControlAcceso utiliza el mecanismo nativo de PostgreSQL llamado **`docker-entrypoint-initdb.d`**. Este documento explica en detalle cómo funciona todo el proceso de inicialización y carga de datos.

---

## 📋 Flujo Completo de Carga (Paso a Paso)

### 1. Construcción de la Imagen Docker

El archivo `docker-compose.yml` define la construcción de la imagen de la base de datos:

```yaml
database:
  build:
    context: ./database
    dockerfile: Dockerfile
```

El `Dockerfile` de la base de datos copia los archivos de inicialización en el orden correcto:

```dockerfile
# Copiar scripts de inicialización
COPY schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY init-db.js /docker-entrypoint-initdb.d/02-init-db.js

# Configurar permisos
RUN chmod 644 /docker-entrypoint-initdb.d/*.sql /docker-entrypoint-initdb.d/*.js
```

#### ¿Por qué este orden?

- El **prefijo numérico** (`01-`, `02-`) garantiza la ejecución secuencial alfabética
- `01-schema.sql` primero crea toda la estructura de la base de datos
- `02-init-db.js` después puede ejecutar lógica adicional si es necesario
- PostgreSQL ejecuta estos scripts **solo si la base de datos está vacía**

---

### 2. Primera Ejecución del Contenedor

Cuando ejecutas `docker-compose up`, PostgreSQL detecta si existe el volumen de datos:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

**Comportamiento:**
- Si el directorio `/var/lib/postgresql/data` está **vacío** → ejecuta scripts de inicialización
- Si el directorio **contiene datos** → omite la inicialización (base de datos ya existe)

#### Verificación del Healthcheck

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-controlacceso}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

**Flujo del healthcheck:**
1. Espera 30 segundos inicial (`start_period`)
2. Ejecuta `pg_isready` cada 10 segundos
3. Requiere 5 checks exitosos consecutivos
4. Una vez "healthy" → permite que el backend inicie

---

### 3. Ejecución del Schema.sql (635 líneas)

El archivo `schema.sql` ejecuta múltiples operaciones en orden específico:

#### a) Extensiones y Preparación (Líneas 1-8)

```sql
-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Propósito:**
- Habilita la generación de UUIDs (Identificadores Únicos Universales)
- Usado en la tabla `usuarios` para identificadores seguros
- Previene colisiones en sistemas distribuidos

---

#### b) Creación de Tablas (Líneas 12-215)

Se crean **11 tablas principales** respetando el orden de dependencias:

##### Tabla 1: `roles` (línea 12)
```sql
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nivel_acceso INTEGER NOT NULL DEFAULT 1,
    permisos_especiales JSONB DEFAULT '{}',
    color VARCHAR(7) DEFAULT '#1976d2',
    icono VARCHAR(50) DEFAULT 'person',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Características:**
- Sin dependencias externas (tabla base)
- Almacena permisos especiales en formato JSONB (flexible)
- Color e icono para UI
- Soft delete con `is_active`

##### Tabla 2: `perfiles` (línea 28)
```sql
CREATE TABLE IF NOT EXISTS perfiles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos JSONB NOT NULL DEFAULT '{}',
    nivel_seguridad INTEGER NOT NULL DEFAULT 1,
    modulos_acceso TEXT[] DEFAULT '{}',
    restricciones_horarias JSONB DEFAULT '{"dias_semana": [1,2,3,4,5], "hora_inicio": "08:00", "hora_fin": "18:00"}',
    color VARCHAR(7) DEFAULT '#1976d2',
    icono VARCHAR(50) DEFAULT 'security',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Características:**
- Sistema de permisos granular con JSONB
- Array de módulos accesibles
- Restricciones horarias predefinidas
- Nivel de seguridad numérico (1-5)

##### Tabla 3: `usuarios` (línea 46)
```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(100),
    rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    perfil_id INTEGER NOT NULL REFERENCES perfiles(id) ON DELETE RESTRICT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'bloqueado', 'pendiente')),
    ultimo_acceso TIMESTAMP,
    intentos_fallidos INTEGER DEFAULT 0,
    fecha_expiracion_password DATE,
    telefono VARCHAR(20),
    direccion TEXT,
    foto_perfil VARCHAR(255),
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id)
);
```

**Características clave:**
- **Depende de:** `roles` y `perfiles`
- UUID para identificación segura
- Contraseña hasheada (nunca en texto plano)
- Control de intentos fallidos (prevención de fuerza bruta)
- Expiración de contraseña
- Auditoría con `created_by` y `updated_by`
- Metadata flexible en JSONB

##### Tabla 4: `areas` (línea 75)
```sql
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(255),
    nivel_acceso INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:**
- Define zonas físicas del edificio/instalación
- Nivel de acceso para control granular
- Sin dependencias externas

##### Tabla 5: `dispositivos` (línea 89)
```sql
CREATE TABLE IF NOT EXISTS dispositivos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    modelo VARCHAR(100),
    ubicacion VARCHAR(255),
    ip_address INET,
    mac_address MACADDR,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'mantenimiento', 'error')),
    configuracion JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Características:**
- **Depende de:** `areas`
- Tipos de datos especializados: `INET` (direcciones IP), `MACADDR` (direcciones MAC)
- Estados de mantenimiento
- Configuración flexible en JSONB

##### Tabla 6: `permisos_acceso` (línea 108)
```sql
CREATE TABLE IF NOT EXISTS permisos_acceso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    tipo_permiso VARCHAR(20) DEFAULT 'lectura' CHECK (tipo_permiso IN ('lectura', 'escritura', 'admin')),
    horario_inicio TIME DEFAULT '00:00:00',
    horario_fin TIME DEFAULT '23:59:59',
    dias_semana INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    granted_by INTEGER REFERENCES usuarios(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(usuario_id, area_id)
);
```

**Características avanzadas:**
- **Depende de:** `usuarios` y `areas`
- Control de horarios (hora inicio/fin)
- Días de semana permitidos (array de enteros 1-7)
- Permisos temporales con fechas de inicio/fin
- Trazabilidad de quién otorgó el permiso
- Constraint UNIQUE previene duplicados

##### Tabla 7: `logs_acceso` (línea 127)
```sql
CREATE TABLE IF NOT EXISTS logs_acceso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    dispositivo_id INTEGER REFERENCES dispositivos(id) ON DELETE SET NULL,
    tipo_acceso VARCHAR(20) NOT NULL CHECK (tipo_acceso IN ('entrada', 'salida', 'denegado', 'error')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    resultado VARCHAR(20) DEFAULT 'exitoso' CHECK (resultado IN ('exitoso', 'denegado', 'error')),
    motivo_denegacion TEXT,
    metadata JSONB
);
```

**Propósito:**
- **Depende de:** `usuarios`, `areas`, `dispositivos`
- Registro completo de todos los intentos de acceso
- Incluye accesos exitosos y denegados
- Información de red (IP, user agent)
- Metadata adicional en JSONB

##### Tabla 8: `sesiones` (línea 144)
```sql
CREATE TABLE IF NOT EXISTS sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Características:**
- **Depende de:** `usuarios`
- Tokens JWT para autenticación
- Refresh tokens para renovación
- Expiración automática
- Tracking de última actividad

##### Tabla 9: `auditoria` (línea 160)
```sql
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito crítico:**
- Registro inmutable de TODOS los cambios
- Guarda estado ANTES y DESPUÉS de cada modificación
- Trazabilidad completa del sistema
- Usado por triggers automáticos

##### Tabla 10: `configuracion_sistema` (línea 176)
```sql
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    tipo VARCHAR(50) DEFAULT 'string',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Uso:**
- Configuraciones dinámicas sin recompilación
- Timeouts, límites, modos de operación
- Tipado para validación

##### Tabla 11: `residentes` (línea 190)
```sql
CREATE TABLE IF NOT EXISTS residentes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    tipo_documento VARCHAR(20) DEFAULT 'RUN' CHECK (tipo_documento IN ('RUN', 'PASAPORTE', 'DNI')),
    documento VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion_residencia TEXT,
    numero_residencia VARCHAR(20),
    tipo_residencia VARCHAR(50),
    fecha_ingreso DATE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    tipo_residente VARCHAR(20) DEFAULT 'propietario' CHECK (tipo_residente IN ('propietario', 'arrendatario', 'invitado')),
    vehiculos JSONB DEFAULT '[]'::jsonb,
    mascotas JSONB DEFAULT '[]'::jsonb,
    ocupantes JSONB DEFAULT '[]'::jsonb,
    observaciones TEXT,
    foto_url VARCHAR(500),
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Características especiales:**
- **Depende de:** `usuarios`
- Tipos de documento chilenos (RUN) y extranjeros
- Arrays JSONB para vehículos, mascotas y ocupantes
- Diferenciación entre propietarios y arrendatarios

---

#### c) Índices para Optimización (Líneas 218-254)

Los índices aceleran significativamente las consultas más frecuentes:

##### Índices de Usuarios
```sql
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_id ON usuarios(perfil_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_created_at ON usuarios(created_at);
```

**Impacto de rendimiento:**
- `email` y `username`: Login 10-100x más rápido
- `rol_id` y `perfil_id`: JOIN 5-20x más rápido
- `estado`: Filtrado de usuarios activos instantáneo
- `created_at`: Ordenamiento temporal optimizado

##### Índices de Residentes
```sql
CREATE INDEX IF NOT EXISTS idx_residentes_documento ON residentes(documento);
CREATE INDEX IF NOT EXISTS idx_residentes_estado ON residentes(estado);
CREATE INDEX IF NOT EXISTS idx_residentes_tipo_residente ON residentes(tipo_residente);
CREATE INDEX IF NOT EXISTS idx_residentes_created_by ON residentes(created_by);
```

##### Índices de Logs de Acceso
```sql
CREATE INDEX IF NOT EXISTS idx_logs_acceso_usuario_id ON logs_acceso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_acceso_area_id ON logs_acceso(area_id);
CREATE INDEX IF NOT EXISTS idx_logs_acceso_timestamp ON logs_acceso(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_acceso_tipo_acceso ON logs_acceso(tipo_acceso);
```

**Crítico para:**
- Reportes de acceso por usuario
- Búsqueda por área
- Filtrado temporal (último mes, semana, etc.)
- Análisis de accesos denegados

##### Índices de Permisos
```sql
CREATE INDEX IF NOT EXISTS idx_permisos_acceso_usuario_id ON permisos_acceso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_permisos_acceso_area_id ON permisos_acceso(area_id);
```

##### Índices de Sesiones
```sql
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
CREATE INDEX IF NOT EXISTS idx_sesiones_expires_at ON sesiones(expires_at);
```

**Uso:**
- Validación de tokens en cada request
- Limpieza de sesiones expiradas
- Búsqueda de sesiones activas por usuario

##### Índices de Auditoría
```sql
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria(timestamp);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);
```

---

#### d) Triggers Automáticos (Líneas 256-321)

Los triggers ejecutan código automáticamente cuando ocurren eventos en las tablas.

##### Trigger 1: Actualización Automática de `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Aplicado a:**
```sql
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON perfiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispositivos_updated_at BEFORE UPDATE ON dispositivos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Beneficio:**
- Actualización automática, no requiere código de aplicación
- Consistencia garantizada
- No puede olvidarse

##### Trigger 2: Auditoría Automática

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos)
        VALUES (current_setting('app.current_user_id', true)::integer, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_anteriores, datos_nuevos)
        VALUES (current_setting('app.current_user_id', true)::integer, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_anteriores)
        VALUES (current_setting('app.current_user_id', true)::integer, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Aplicado a:**
```sql
CREATE TRIGGER audit_usuarios_trigger AFTER INSERT OR UPDATE OR DELETE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_permisos_acceso_trigger AFTER INSERT OR UPDATE OR DELETE ON permisos_acceso
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_logs_acceso_trigger AFTER INSERT OR UPDATE OR DELETE ON logs_acceso
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

**Qué registra:**
- **INSERT:** Solo los datos nuevos
- **UPDATE:** Datos antes y después del cambio
- **DELETE:** Solo los datos anteriores (ya no existen nuevos)
- **Metadata:** Usuario, timestamp, tabla, ID del registro

**Uso del contexto:**
```javascript
// En el backend, antes de cada operación:
await client.query(`SET app.current_user_id = ${userId}`);
// Ahora el trigger puede acceder a este valor
```

---

#### e) Datos Iniciales (Líneas 324-479)

##### 1. Roles (10 roles predefinidos)

```sql
INSERT INTO roles (nombre, descripcion, nivel_acceso, permisos_especiales, color, icono) VALUES
('Super Administrador', 'Control total del sistema con acceso a todas las funcionalidades', 10, 
 '{"all": true, "system_admin": true}', '#d32f2f', 'admin_panel_settings'),

('Administrador', 'Administración completa del sistema de control de acceso', 8, 
 '{"users": true, "areas": true, "devices": true, "reports": true, "settings": true}', '#f57c00', 'security'),

('Gerente', 'Gestión de áreas y supervisión de personal', 7, 
 '{"users": {"read": true, "write": true}, "areas": true, "reports": true, "analytics": true}', '#7b1fa2', 'supervisor_account'),

('Supervisor', 'Supervisión de áreas asignadas y gestión de personal', 6, 
 '{"users": {"read": true}, "areas": {"read": true, "write": true}, "reports": {"read": true}}', '#1976d2', 'manage_accounts'),

('Coordinador', 'Coordinación de actividades y gestión de accesos', 5, 
 '{"users": {"read": true}, "areas": {"read": true}, "access_control": true}', '#388e3c', 'group'),

('Usuario Avanzado', 'Usuario con acceso extendido a funcionalidades específicas', 4, 
 '{"areas": {"read": true, "write": true}, "profile": true, "reports": {"read": true}}', '#ff9800', 'person_add'),

('Usuario Estándar', 'Usuario básico con acceso a áreas autorizadas', 3, 
 '{"areas": {"read": true}, "profile": {"read": true, "write": true}}', '#2196f3', 'person'),

('Usuario Limitado', 'Usuario con acceso restringido a áreas específicas', 2, 
 '{"areas": {"read": true}, "profile": {"read": true}}', '#9e9e9e', 'person_outline'),

('Invitado', 'Acceso temporal y limitado al sistema', 1, 
 '{"areas": {"read": true, "temporary": true}}', '#757575', 'person_off'),

('Auditor', 'Solo lectura de reportes y logs del sistema', 2, 
 '{"reports": {"read": true}, "logs": {"read": true}, "audit": true}', '#607d8b', 'assessment')

ON CONFLICT (nombre) DO NOTHING;
```

**Jerarquía de niveles:**
- **10:** Super Administrador (acceso total)
- **8:** Administrador (gestión completa)
- **7:** Gerente (supervisión amplia)
- **6:** Supervisor (áreas específicas)
- **5:** Coordinador (operaciones)
- **4:** Usuario Avanzado
- **3:** Usuario Estándar
- **2:** Usuario Limitado / Auditor
- **1:** Invitado

##### 2. Perfiles (10 perfiles con permisos detallados)

```sql
INSERT INTO perfiles (nombre, descripcion, permisos, nivel_seguridad, modulos_acceso, restricciones_horarias, color, icono) VALUES
('Super Administrador del Sistema', 'Control total del sistema', 
 '{"all": true, "system": true, "users": true, "areas": true, "devices": true, "reports": true, "settings": true, "audit": true}', 
 5, 
 '{"dashboard", "usuarios", "areas", "dispositivos", "reportes", "configuracion", "auditoria", "sistema"}',
 '{"dias_semana": [1,2,3,4,5,6,7], "hora_inicio": "00:00", "hora_fin": "23:59"}',
 '#d32f2f', 'admin_panel_settings'),

('Administrador del Sistema', 'Administración completa', 
 '{"users": true, "areas": true, "devices": true, "reports": true, "settings": true, "audit": {"read": true}}', 
 4, 
 '{"dashboard", "usuarios", "areas", "dispositivos", "reportes", "configuracion"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "07:00", "hora_fin": "22:00"}',
 '#f57c00', 'security')

-- ... (8 perfiles más)
ON CONFLICT (nombre) DO NOTHING;
```

**Diferencia entre Roles y Perfiles:**
- **Roles:** Definen QUIÉN es el usuario (cargo organizacional)
- **Perfiles:** Definen QUÉ puede hacer (permisos técnicos)
- Un usuario tiene 1 rol + 1 perfil

##### 3. Usuario Administrador Inicial

```sql
INSERT INTO usuarios (nombre, apellido, email, username, password_hash, rol_id, perfil_id, estado) VALUES
('Admin', 'Sistema', 'admin@controlacceso.com', 'admin', 
 '$2a$10$rQZ8N3YqX9K2M1L4P7O6Q5R4S3T2U1V0W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0', 
 2, 2, 'activo')
ON CONFLICT (username) DO NOTHING;
```

**Credenciales iniciales:**
- **Username:** `admin`
- **Password:** (hasheada con bcrypt, ver `database/generate-admin-password.js`)
- **Rol:** Administrador (id: 2)
- **Perfil:** Administrador del Sistema (id: 2)

⚠️ **IMPORTANTE:** Cambiar estas credenciales en producción.

##### 4. Áreas (10 áreas predefinidas)

```sql
INSERT INTO areas (nombre, descripcion, ubicacion, nivel_acceso) VALUES
('Oficina Principal', 'Área principal de oficinas administrativas', 'Planta Baja - Ala Norte', 1),
('Sala de Reuniones', 'Sala para reuniones y presentaciones ejecutivas', 'Planta Baja - Centro', 2),
('Laboratorio de Investigación', 'Área de laboratorio con equipos especializados', 'Planta Alta - Ala Este', 3),
('Centro de Datos', 'Sala de servidores y equipos de cómputo', 'Sótano - Nivel 1', 4),
('Almacén de Materiales', 'Área de almacenamiento de materiales y suministros', 'Sótano - Nivel 2', 3),
('Estacionamiento Empleados', 'Estacionamiento exclusivo para empleados', 'Exterior - Nivel 0', 1),
('Área de Descanso', 'Zona de descanso y cafetería', 'Planta Baja - Ala Sur', 1),
('Sala de Capacitación', 'Sala para entrenamientos y capacitaciones', 'Planta Alta - Ala Oeste', 2),
('Oficinas Ejecutivas', 'Oficinas privadas para ejecutivos', 'Planta Alta - Centro', 3),
('Área de Mantenimiento', 'Zona de mantenimiento y servicios técnicos', 'Sótano - Nivel 3', 4)
ON CONFLICT (nombre) DO NOTHING;
```

**Niveles de acceso:**
- **Nivel 1:** Público (Oficina Principal, Estacionamiento, Descanso)
- **Nivel 2:** Restringido (Salas de Reuniones, Capacitación)
- **Nivel 3:** Confidencial (Laboratorio, Almacén, Ejecutivas)
- **Nivel 4:** Máxima Seguridad (Centro de Datos, Mantenimiento)

##### 5. Dispositivos (10 dispositivos)

```sql
INSERT INTO dispositivos (nombre, tipo, modelo, ubicacion, area_id, ip_address) VALUES
('Lector Principal', 'card_reader', 'HID ProxCard II Plus', 'Entrada Principal', 1, '192.168.1.100'),
('Lector Secundario', 'card_reader', 'HID ProxCard II Plus', 'Entrada Secundaria', 2, '192.168.1.101'),
('Terminal Administrativo', 'computer', 'Dell OptiPlex 7090', 'Oficina Administrativa', 1, '192.168.1.50'),
('Lector de Laboratorio', 'card_reader', 'HID iCLASS SE', 'Entrada Laboratorio', 3, '192.168.1.102'),
('Terminal de Datos', 'computer', 'HP EliteDesk 800', 'Centro de Datos', 4, '192.168.1.51'),
('Lector de Almacén', 'card_reader', 'HID ProxCard II', 'Entrada Almacén', 5, '192.168.1.103'),
('Lector de Estacionamiento', 'card_reader', 'HID ProxCard II', 'Entrada Estacionamiento', 6, '192.168.1.104'),
('Terminal de Recepción', 'computer', 'Lenovo ThinkCentre M90', 'Recepción', 1, '192.168.1.52'),
('Lector Ejecutivo', 'card_reader', 'HID iCLASS SE', 'Entrada Ejecutiva', 9, '192.168.1.105'),
('Terminal de Mantenimiento', 'computer', 'Dell OptiPlex 3080', 'Área Mantenimiento', 10, '192.168.1.53')
ON CONFLICT DO NOTHING;
```

**Tipos de dispositivos:**
- **card_reader:** Lectores de tarjetas de acceso
- **computer:** Terminales administrativas

##### 6. Configuración del Sistema

```sql
INSERT INTO configuracion_sistema (clave, valor, descripcion, tipo) VALUES
('session_timeout', '3600', 'Tiempo de sesión en segundos', 'integer'),
('max_login_attempts', '5', 'Máximo de intentos de login', 'integer'),
('password_expiry_days', '90', 'Días de expiración de contraseña', 'integer'),
('system_name', 'ControlAcceso Pro', 'Nombre del sistema', 'string'),
('maintenance_mode', 'false', 'Modo mantenimiento', 'boolean'),
('default_user_role', '8', 'ID del rol por defecto para nuevos usuarios', 'integer'),
('default_user_profile', '7', 'ID del perfil por defecto para nuevos usuarios', 'integer'),
('max_users_per_page', '25', 'Máximo de usuarios por página en listados', 'integer'),
('enable_audit_logs', 'true', 'Habilitar logs de auditoría', 'boolean'),
('backup_frequency_hours', '24', 'Frecuencia de respaldos en horas', 'integer')
ON CONFLICT (clave) DO NOTHING;
```

**Configuraciones clave:**
- **session_timeout:** 1 hora (3600 segundos)
- **max_login_attempts:** 5 intentos antes de bloqueo
- **password_expiry_days:** Contraseñas expiran cada 90 días

---

#### f) Vistas Útiles (Líneas 482-555)

Las vistas son "tablas virtuales" que simplifican consultas complejas.

##### Vista 1: `v_usuarios_completos`

```sql
CREATE VIEW v_usuarios_completos AS
SELECT 
    u.id,
    u.uuid,
    u.nombre,
    u.apellido,
    u.email,
    u.username,
    u.estado,
    u.ultimo_acceso,
    u.created_at,
    u.updated_at,
    r.nombre as rol_nombre,
    r.nivel_acceso as rol_nivel,
    r.color as rol_color,
    r.icono as rol_icono,
    p.nombre as perfil_nombre,
    p.permisos as perfil_permisos,
    p.nivel_seguridad as perfil_nivel_seguridad,
    p.color as perfil_color,
    p.icono as perfil_icono
FROM usuarios u
JOIN roles r ON u.rol_id = r.id
JOIN perfiles p ON u.perfil_id = p.id
WHERE u.is_active = true;
```

**Uso:**
```sql
-- En lugar de hacer 3 JOINs cada vez:
SELECT * FROM v_usuarios_completos WHERE email = 'admin@example.com';
```

##### Vista 2: `v_accesos_recientes`

```sql
CREATE VIEW v_accesos_recientes AS
SELECT 
    la.id,
    la.timestamp,
    la.tipo_acceso,
    la.resultado,
    u.nombre || ' ' || u.apellido as usuario_nombre,
    u.username,
    r.nombre as rol_nombre,
    a.nombre as area_nombre,
    d.nombre as dispositivo_nombre
FROM logs_acceso la
JOIN usuarios u ON la.usuario_id = u.id
JOIN roles r ON u.rol_id = r.id
JOIN areas a ON la.area_id = a.id
LEFT JOIN dispositivos d ON la.dispositivo_id = d.id
WHERE la.timestamp >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY la.timestamp DESC;
```

**Propósito:**
- Dashboard con accesos de los últimos 7 días
- Consulta simple: `SELECT * FROM v_accesos_recientes LIMIT 50`

##### Vista 3: `v_permisos_usuario`

```sql
CREATE VIEW v_permisos_usuario AS
SELECT 
    u.id as usuario_id,
    u.nombre || ' ' || u.apellido as usuario_nombre,
    u.username,
    r.nombre as rol_nombre,
    p.nombre as perfil_nombre,
    p.permisos as perfil_permisos,
    pa.area_id,
    a.nombre as area_nombre,
    pa.tipo_permiso,
    pa.horario_inicio,
    pa.horario_fin,
    pa.dias_semana
FROM usuarios u
JOIN roles r ON u.rol_id = r.id
JOIN perfiles p ON u.perfil_id = p.id
LEFT JOIN permisos_acceso pa ON u.id = pa.usuario_id
LEFT JOIN areas a ON pa.area_id = a.id
WHERE u.is_active = true AND pa.is_active = true;
```

**Uso:**
- Ver todos los permisos de un usuario en una sola consulta
- Reportes de acceso por área

---

#### g) Funciones Útiles (Líneas 558-634)

Las funciones encapsulan lógica compleja reutilizable.

##### Función 1: `get_user_permissions`

```sql
CREATE OR REPLACE FUNCTION get_user_permissions(user_id INTEGER)
RETURNS TABLE(area_id INTEGER, area_nombre VARCHAR, tipo_permiso VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT pa.area_id, a.nombre, pa.tipo_permiso
    FROM permisos_acceso pa
    JOIN areas a ON pa.area_id = a.id
    WHERE pa.usuario_id = user_id 
    AND pa.is_active = true
    AND (pa.fecha_fin IS NULL OR pa.fecha_fin >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;
```

**Uso desde SQL:**
```sql
SELECT * FROM get_user_permissions(123);
```

**Uso desde Node.js:**
```javascript
const result = await db.query('SELECT * FROM get_user_permissions($1)', [userId]);
console.log(result.rows); // [{area_id: 1, area_nombre: 'Oficina', tipo_permiso: 'lectura'}, ...]
```

##### Función 2: `check_user_access`

```sql
CREATE OR REPLACE FUNCTION check_user_access(
    p_user_id INTEGER,
    p_area_id INTEGER,
    p_tipo_acceso VARCHAR DEFAULT 'lectura'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_permiso VARCHAR;
    v_hora_actual TIME;
    v_dia_semana INTEGER;
BEGIN
    -- Obtener permiso del usuario
    SELECT tipo_permiso INTO v_permiso
    FROM permisos_acceso
    WHERE usuario_id = p_user_id 
    AND area_id = p_area_id
    AND is_active = true
    AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE);
    
    IF v_permiso IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar horario
    v_hora_actual := CURRENT_TIME;
    v_dia_semana := EXTRACT(DOW FROM CURRENT_DATE) + 1;
    
    -- Verificar si está en el horario permitido
    SELECT EXISTS(
        SELECT 1 FROM permisos_acceso
        WHERE usuario_id = p_user_id 
        AND area_id = p_area_id
        AND is_active = true
        AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
        AND v_hora_actual BETWEEN horario_inicio AND horario_fin
        AND v_dia_semana = ANY(dias_semana)
    ) INTO v_permiso;
    
    RETURN v_permiso;
END;
$$ LANGUAGE plpgsql;
```

**Uso:**
```sql
-- ¿Puede el usuario 5 acceder al área 3 en este momento?
SELECT check_user_access(5, 3, 'lectura');
-- Retorna: true o false
```

**Lógica implementada:**
1. ¿Tiene permiso activo? → Si no, retorna `false`
2. ¿Está dentro del horario permitido? → Verifica hora actual
3. ¿Es un día permitido? → Verifica día de la semana
4. Si todo OK → retorna `true`

##### Función 3: `get_users_by_role_stats`

```sql
CREATE OR REPLACE FUNCTION get_users_by_role_stats()
RETURNS TABLE(rol_nombre VARCHAR, total_usuarios BIGINT, usuarios_activos BIGINT, usuarios_inactivos BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.nombre,
        COUNT(u.id) as total_usuarios,
        COUNT(CASE WHEN u.estado = 'activo' THEN 1 END) as usuarios_activos,
        COUNT(CASE WHEN u.estado != 'activo' THEN 1 END) as usuarios_inactivos
    FROM roles r
    LEFT JOIN usuarios u ON r.id = u.rol_id AND u.is_active = true
    WHERE r.is_active = true
    GROUP BY r.id, r.nombre
    ORDER BY r.nivel_acceso DESC;
END;
$$ LANGUAGE plpgsql;
```

**Uso:**
```sql
SELECT * FROM get_users_by_role_stats();
```

**Resultado ejemplo:**
```
rol_nombre          | total_usuarios | usuarios_activos | usuarios_inactivos
--------------------|----------------|------------------|-------------------
Super Administrador | 2              | 2                | 0
Administrador       | 5              | 4                | 1
Gerente             | 10             | 9                | 1
...
```

---

## 🔄 Sistema de Migraciones

El proyecto incluye migraciones adicionales en `/database/migrations/`:

```
- add_auditoria_table.sql         (Tabla adicional de auditoría)
- add_personas_table.sql          (Tabla general de personas)
- add_residentes_table.sql        (Extensión de residentes)
- add_tipo_documento_to_visitas_simple.sql
- add_tipo_documento_to_visitas.sql
```

### ¿Cómo aplicar migraciones?

**Opción 1: Manualmente desde el contenedor**
```bash
docker exec -i controlacceso-db psql -U postgres -d controlacceso < database/migrations/add_personas_table.sql
```

**Opción 2: Desde el host (si PostgreSQL acepta conexiones)**
```bash
psql -h localhost -U postgres -d controlacceso -f database/migrations/add_personas_table.sql
```

**Opción 3: Script Node.js** (crear uno personalizado)
```javascript
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'controlacceso',
  user: 'postgres',
  password: 'postgres123',
  port: 5432
});

async function runMigration(filename) {
  const sql = fs.readFileSync(`database/migrations/${filename}`, 'utf8');
  await pool.query(sql);
  console.log(`✅ Migración ${filename} aplicada`);
}

runMigration('add_personas_table.sql');
```

### ⚠️ Importante sobre Migraciones

Las migraciones **NO se ejecutan automáticamente** con Docker. Solo los archivos en `/docker-entrypoint-initdb.d/` se ejecutan en la primera inicialización.

---

## ⚡ Healthcheck y Verificación

El healthcheck garantiza que la base de datos está lista antes de que otros servicios inicien:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-controlacceso}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

### Parámetros explicados:

- **test:** Comando que verifica el estado
  - `pg_isready` es una utilidad de PostgreSQL que verifica si el servidor acepta conexiones
  
- **interval:** 10 segundos entre cada check
  
- **timeout:** 5 segundos máximo para cada check
  
- **retries:** 5 intentos fallidos antes de marcar como "unhealthy"
  
- **start_period:** 30 segundos de "gracia" inicial
  - Durante este tiempo, los fallos no cuentan para los retries
  - Permite que PostgreSQL termine de inicializar

### Dependencias en docker-compose.yml:

```yaml
backend:
  depends_on:
    database:
      condition: service_healthy  # ← Espera a que database esté "healthy"
```

**Flujo:**
1. Database inicia → Estado: "starting"
2. Espera 30 segundos (start_period)
3. Ejecuta `pg_isready` cada 10 segundos
4. Después de 5 checks exitosos → Estado: "healthy"
5. Backend puede iniciar

---

## 💾 Persistencia de Datos

### Configuración del Volumen

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data/postgres
```

### ¿Qué significa esto?

**Tipo de volumen: Bind Mount**
- **NO es** un volumen Docker estándar
- **ES** un mapeo directo al sistema de archivos del host
- Los datos viven en `./data/postgres` (directorio local)

### Ventajas del Bind Mount:

✅ **Acceso directo:** Puedes ver los datos en tu máquina  
✅ **Backups fáciles:** Solo copia `./data/postgres`  
✅ **Portabilidad:** Mueve el directorio = mueves los datos  
✅ **Supervivencia:** Los datos persisten aunque borres los contenedores  

### Desventajas:

❌ **Permisos:** Problemas potenciales en sistemas Unix  
❌ **Rendimiento:** Ligeramente más lento que volúmenes nativos Docker  
❌ **Dependencia de ruta:** Depende de la estructura del proyecto  

### Comandos útiles:

**Ver el contenido del volumen:**
```bash
ls -la ./data/postgres/
```

**Backup manual:**
```bash
# Opción 1: Copiar todo el directorio
tar -czf backup-$(date +%Y%m%d).tar.gz ./data/postgres/

# Opción 2: Dump SQL (más portable)
docker exec controlacceso-db pg_dump -U postgres controlacceso > backup.sql
```

**Restaurar desde backup:**
```bash
# Desde SQL dump
docker exec -i controlacceso-db psql -U postgres -d controlacceso < backup.sql
```

**Limpiar datos (CUIDADO: Destructivo):**
```bash
# Detener contenedor
docker-compose down

# Borrar datos
rm -rf ./data/postgres/*

# Reiniciar (se ejecutarán los scripts de inicialización de nuevo)
docker-compose up -d database
```

---

## 📊 Diagrama de Flujo del Proceso de Carga

```
┌─────────────────────────────────────────────────────────────────┐
│                    docker-compose up                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Docker construye imagen "database"                              │
│ FROM postgres:15-alpine                                         │
│ COPY schema.sql → /docker-entrypoint-initdb.d/01-schema.sql    │
│ COPY init-db.js → /docker-entrypoint-initdb.d/02-init-db.js    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Contenedor "controlacceso-db" inicia                            │
│ Verifica: ¿/var/lib/postgresql/data está vacío?                │
└──────────────┬────────────────────────┬─────────────────────────┘
               │                        │
        [SÍ - Primera vez]       [NO - Ya existe]
               │                        │
               ▼                        ▼
┌──────────────────────────┐   ┌──────────────────────┐
│ Ejecuta scripts de       │   │ Omite inicialización │
│ inicialización:          │   │ Usa datos existentes │
│                          │   └──────────┬───────────┘
│ 1) 01-schema.sql         │              │
│    ├─ Extensiones        │              │
│    ├─ 11 Tablas          │              │
│    ├─ 25+ Índices        │              │
│    ├─ Triggers           │              │
│    ├─ Datos iniciales    │              │
│    ├─ Vistas             │              │
│    └─ Funciones          │              │
│                          │              │
│ 2) 02-init-db.js         │              │
│    (opcional)            │              │
└──────────┬───────────────┘              │
           │                              │
           └──────────────┬───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ PostgreSQL listo y aceptando conexiones                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Healthcheck inicia (después de 30s start_period)                │
│ Ejecuta cada 10s: pg_isready -U postgres -d controlacceso       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Después de 5 checks exitosos → Estado: "healthy"                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend puede iniciar (depends_on: service_healthy)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Resumen Ejecutivo

### ¿Cuándo se carga la base de datos?

**Solo en la PRIMERA ejecución**, cuando el directorio de datos está vacío.

### ¿Qué se carga?

1. **Estructura:** 11 tablas con relaciones completas
2. **Optimización:** 25+ índices para consultas rápidas
3. **Automatización:** 7 triggers para actualización y auditoría
4. **Datos iniciales:**
   - 10 roles
   - 10 perfiles
   - 1 usuario administrador
   - 10 áreas
   - 10 dispositivos
   - 10 configuraciones del sistema
5. **Utilidades:** 3 vistas y 3 funciones

### ¿Cómo resetear la base de datos?

```bash
# 1. Detener todo
docker-compose down

# 2. Borrar datos
rm -rf ./data/postgres/*

# 3. Reiniciar (se ejecuta schema.sql de nuevo)
docker-compose up -d
```

### ¿Cómo hacer backup?

```bash
# SQL dump (recomendado)
docker exec controlacceso-db pg_dump -U postgres controlacceso > backup-$(date +%Y%m%d).sql

# O copiar todo el directorio
tar -czf backup-$(date +%Y%m%d).tar.gz ./data/postgres/
```

### ¿Cómo aplicar migraciones?

```bash
# Desde el host
docker exec -i controlacceso-db psql -U postgres -d controlacceso < database/migrations/nombre-migracion.sql
```

---

## 🔐 Consideraciones de Seguridad

### Contraseñas por Defecto

⚠️ **IMPORTANTE:** El schema incluye contraseñas hasheadas por defecto. En producción:

1. **Genera una nueva contraseña:**
   ```bash
   node database/generate-admin-password.js
   ```

2. **Actualiza el hash en la base de datos:**
   ```sql
   UPDATE usuarios 
   SET password_hash = '$2a$10$NUEVO_HASH_AQUI' 
   WHERE username = 'admin';
   ```

### Variables de Entorno Sensibles

Nunca commitees en git:
- `DB_PASSWORD`
- `JWT_SECRET`
- Credenciales de admin

Usa un archivo `.env` (incluido en `.gitignore`):
```env
DB_PASSWORD=contraseña_super_segura_aquí
JWT_SECRET=clave_jwt_muy_larga_y_aleatoria
```

### Auditoría

Todos los cambios en tablas críticas se registran automáticamente en la tabla `auditoria` gracias a los triggers.

**Para ver cambios recientes:**
```sql
SELECT * FROM auditoria 
ORDER BY timestamp DESC 
LIMIT 50;
```

---

## 📚 Referencias

- [Documentación PostgreSQL: docker-entrypoint-initdb.d](https://hub.docker.com/_/postgres)
- [Triggers en PostgreSQL](https://www.postgresql.org/docs/current/triggers.html)
- [Funciones PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html)
- [Índices y Optimización](https://www.postgresql.org/docs/current/indexes.html)

---

## ✅ PROBLEMA CORREGIDO: IDs Hardcodeados

### Descripción del Problema (RESUELTO)

El schema original tenía un **problema potencial crítico** relacionado con los IDs hardcodeados. **Este problema ha sido CORREGIDO en la versión actual del schema.sql**.

```sql
-- Línea 328-339: Los roles se insertan SIN especificar IDs
INSERT INTO roles (nombre, descripcion, nivel_acceso, ...) VALUES
('Super Administrador', ..., 10, ...),  -- PostgreSQL asignará id = 1
('Administrador', ..., 8, ...),         -- PostgreSQL asignará id = 2
...

-- Línea 423: El usuario ASUME que 'Administrador' tiene id = 2
INSERT INTO usuarios (..., rol_id, perfil_id, ...) VALUES
('Admin', 'Sistema', ..., 2, 2, 'activo')  -- ⚠️ HARDCODED!
```

### ¿Cuándo Falla?

#### Escenario 1: Secuencia alterada
```sql
ALTER SEQUENCE roles_id_seq RESTART WITH 10;
-- Ahora los roles empiezan desde id = 10, no desde id = 1
-- El usuario con rol_id = 2 fallará con foreign key violation
```

#### Escenario 2: ON CONFLICT evita algunas inserciones
```sql
-- Si 'Super Administrador' ya existe:
INSERT INTO roles (nombre, ...) VALUES
('Super Administrador', ...),  -- ON CONFLICT DO NOTHING → No se inserta
('Administrador', ...);        -- Se inserta con id = 2 (por suerte coincide)

-- Pero si 'Administrador' ya existe:
-- Se inserta con el siguiente ID disponible (puede ser 11, 12, etc.)
```

#### Escenario 3: Borrado y reinserción
```sql
DELETE FROM roles WHERE id = 1;  -- Borra Super Administrador
-- Reinsertar crea nuevo ID (no reutiliza el 1)
INSERT INTO roles (nombre, ...) VALUES
('Super Administrador', ...);  -- id = 11 (siguiente en secuencia)
-- Ahora la tabla tiene IDs: 2, 3, 4, ..., 11
```

### Solución Implementada

El `schema.sql` actual ha sido corregido usando **IDs explícitos** en las tablas `roles` y `perfiles`:

**Roles (schema.sql líneas 329-350):**
```sql
INSERT INTO roles (id, nombre, descripcion, nivel_acceso, ...) VALUES
(1, 'Super Administrador', ..., 10, ...),
(2, 'Administrador', ..., 8, ...),  -- ✅ ID explícito garantizado
(3, 'Gerente', ..., 7, ...),
...
(10, 'Auditor', ..., 2, ...)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    ...
    updated_at = CURRENT_TIMESTAMP;

-- Actualizar la secuencia de roles para el siguiente ID
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
```

**Perfiles (schema.sql líneas 358-440):**
```sql
INSERT INTO perfiles (id, nombre, descripcion, permisos, ...) VALUES
(1, 'Super Administrador del Sistema', ..., 5, ...),
(2, 'Administrador del Sistema', ..., 4, ...),  -- ✅ ID explícito garantizado
(3, 'Gerente de Seguridad', ..., 4, ...),
...
(10, 'Auditor del Sistema', ..., 2, ...)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    permisos = EXCLUDED.permisos,
    ...
    updated_at = CURRENT_TIMESTAMP;

-- Actualizar la secuencia de perfiles para el siguiente ID
SELECT setval('perfiles_id_seq', (SELECT MAX(id) FROM perfiles));
```

**Usuario Admin (schema.sql líneas 450-452):**
```sql
-- NOTA: rol_id = 2 corresponde a 'Administrador' (definido arriba con ID explícito)
-- NOTA: perfil_id = 2 corresponde a 'Administrador del Sistema' (definido arriba con ID explícito)
INSERT INTO usuarios (nombre, apellido, email, username, password_hash, rol_id, perfil_id, estado) VALUES
('Admin', 'Sistema', 'admin@controlacceso.com', 'admin', '$2a$10$...', 2, 2, 'activo')
ON CONFLICT (username) DO NOTHING;
```

### Verificación Automática

El sistema incluye un script de verificación automática (`verify-integrity.sql`) que se ejecuta después de la carga inicial y valida:

✅ Que los 10 roles existen con IDs del 1 al 10  
✅ Que rol_id = 2 es 'Administrador'  
✅ Que los 10 perfiles existen con IDs del 1 al 10  
✅ Que perfil_id = 2 es 'Administrador del Sistema'  
✅ Que el usuario 'admin' existe y tiene rol_id = 2 y perfil_id = 2  
✅ Que no hay referencias huérfanas (foreign keys inválidos)  
✅ Que las secuencias están correctamente ajustadas  

Este script se ejecuta automáticamente en cada inicialización de la base de datos (Dockerfile línea 27).

### Soluciones Alternativas

#### Opción 1: IDs Explícitos (IMPLEMENTADA)

```sql
INSERT INTO roles (id, nombre, descripcion, nivel_acceso, ...) VALUES
(1, 'Super Administrador', ..., 10, ...),
(2, 'Administrador', ..., 8, ...),
(3, 'Gerente', ..., 7, ...),
...
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    updated_at = CURRENT_TIMESTAMP;

-- Ajustar secuencia después
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
```

**Ventajas:**
- IDs consistentes garantizados
- Fácil de referenciar desde otros INSERT
- ON CONFLICT DO UPDATE mantiene datos actualizados
- Idempotente (se puede ejecutar múltiples veces)

#### Opción 2: Subconsulta (Para scripts adicionales)

```sql
INSERT INTO usuarios (nombre, apellido, email, username, password_hash, rol_id, perfil_id, estado) 
SELECT 
    'Admin', 
    'Sistema', 
    'admin@controlacceso.com', 
    'admin', 
    '$2a$10$...',
    (SELECT id FROM roles WHERE nombre = 'Administrador'),  -- ✅ Busca por nombre
    (SELECT id FROM perfiles WHERE nombre = 'Administrador del Sistema'),
    'activo'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');
```

**Ventajas:**
- No depende de IDs hardcodeados
- Busca por nombre (más semántico)
- Funciona independiente del orden de inserción
- Útil para migraciones y scripts de datos

#### Opción 3: CTE (Common Table Expression)

```sql
WITH rol_admin AS (
    SELECT id FROM roles WHERE nombre = 'Administrador'
),
perfil_admin AS (
    SELECT id FROM perfiles WHERE nombre = 'Administrador del Sistema'
)
INSERT INTO usuarios (nombre, apellido, email, username, password_hash, rol_id, perfil_id, estado)
SELECT 'Admin', 'Sistema', 'admin@controlacceso.com', 'admin', '$2a$10$...', 
       rol_admin.id, perfil_admin.id, 'activo'
FROM rol_admin, perfil_admin
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');
```

**Ventajas:**
- Más legible para múltiples referencias
- Reutilizable para varios INSERT

### Comandos de Verificación

#### Verificación automática (se ejecuta en cada inicialización)
```bash
# El script verify-integrity.sql se ejecuta automáticamente
# Para ver los logs durante la inicialización:
docker logs controlacceso-db
```

#### Verificación manual
```bash
# Ejecutar script de verificación completo
docker exec controlacceso-db psql -U postgres -d controlacceso -f /docker-entrypoint-initdb.d/03-verify-integrity.sql

# O ejecutar desde el host
docker exec -i controlacceso-db psql -U postgres -d controlacceso < database/verify-integrity.sql
```

#### Verificación rápida del usuario admin
```bash
docker exec controlacceso-db psql -U postgres -d controlacceso -c "
SELECT 
    u.username,
    u.email,
    u.rol_id,
    r.nombre as rol,
    u.perfil_id,
    p.nombre as perfil,
    u.estado
FROM usuarios u
JOIN roles r ON u.rol_id = r.id
JOIN perfiles p ON u.perfil_id = p.id
WHERE u.username = 'admin';
"
```

**Salida esperada:**
```
 username |          email           | rol_id |      rol       | perfil_id |         perfil              | estado 
----------+--------------------------+--------+----------------+-----------+-----------------------------+--------
 admin    | admin@controlacceso.com  |      2 | Administrador  |         2 | Administrador del Sistema   | activo
```

### Archivos de Referencia

- `/database/schema.sql` - Schema corregido con IDs explícitos (ACTUAL)
- `/database/verify-integrity.sql` - Script de verificación automática (NUEVO)
- `/database/test-id-mismatch.sql` - Script de prueba que demuestra el problema original
- `/database/schema-fix-ids.sql` - Implementación de las 3 opciones de solución

---

## 📝 Notas Finales

Este documento describe la versión actual del sistema de carga de base de datos. Para cambios futuros:

1. Actualiza el `schema.sql`
2. Crea una migración en `/database/migrations/`
3. Documenta los cambios en este archivo
4. Aplica la migración a bases de datos existentes
5. Ejecuta el script de verificación para validar los cambios

### ✅ Estado Actual

- **Schema corregido:** IDs explícitos implementados en roles y perfiles
- **Verificación automática:** Script de integridad se ejecuta en cada inicialización
- **Documentación completa:** Problema identificado, solución implementada y verificada
- **Listo para producción:** Sin problemas conocidos de integridad referencial

### Historial de Cambios

**2025-10-01:** Corrección de IDs hardcodeados
- Implementados IDs explícitos en tablas `roles` y `perfiles`
- Agregado script de verificación automática `verify-integrity.sql`
- Actualizado Dockerfile para incluir verificación
- Documentación completa del problema y solución

**Fecha de última actualización:** 2025-10-01

