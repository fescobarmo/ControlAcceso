-- =====================================================
-- SOLUCIÓN AL PROBLEMA DE IDs HARDCODEADOS
-- =====================================================
-- Este archivo muestra cómo corregir el problema de los
-- IDs hardcodeados en el INSERT del usuario admin

-- =====================================================
-- SOLUCIÓN 1: Especificar IDs explícitamente (RECOMENDADO)
-- =====================================================

-- Insertar roles con IDs explícitos
INSERT INTO roles (id, nombre, descripcion, nivel_acceso, permisos_especiales, color, icono) VALUES
(1, 'Super Administrador', 'Control total del sistema con acceso a todas las funcionalidades', 10, '{"all": true, "system_admin": true}', '#d32f2f', 'admin_panel_settings'),
(2, 'Administrador', 'Administración completa del sistema de control de acceso', 8, '{"users": true, "areas": true, "devices": true, "reports": true, "settings": true}', '#f57c00', 'security'),
(3, 'Gerente', 'Gestión de áreas y supervisión de personal', 7, '{"users": {"read": true, "write": true}, "areas": true, "reports": true, "analytics": true}', '#7b1fa2', 'supervisor_account'),
(4, 'Supervisor', 'Supervisión de áreas asignadas y gestión de personal', 6, '{"users": {"read": true}, "areas": {"read": true, "write": true}, "reports": {"read": true}}', '#1976d2', 'manage_accounts'),
(5, 'Coordinador', 'Coordinación de actividades y gestión de accesos', 5, '{"users": {"read": true}, "areas": {"read": true}, "access_control": true}', '#388e3c', 'group'),
(6, 'Usuario Avanzado', 'Usuario con acceso extendido a funcionalidades específicas', 4, '{"areas": {"read": true, "write": true}, "profile": true, "reports": {"read": true}}', '#ff9800', 'person_add'),
(7, 'Usuario Estándar', 'Usuario básico con acceso a áreas autorizadas', 3, '{"areas": {"read": true}, "profile": {"read": true, "write": true}}', '#2196f3', 'person'),
(8, 'Usuario Limitado', 'Usuario con acceso restringido a áreas específicas', 2, '{"areas": {"read": true}, "profile": {"read": true}}', '#9e9e9e', 'person_outline'),
(9, 'Invitado', 'Acceso temporal y limitado al sistema', 1, '{"areas": {"read": true, "temporary": true}}', '#757575', 'person_off'),
(10, 'Auditor', 'Solo lectura de reportes y logs del sistema', 2, '{"reports": {"read": true}, "logs": {"read": true}, "audit": true}', '#607d8b', 'assessment')
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    nivel_acceso = EXCLUDED.nivel_acceso,
    permisos_especiales = EXCLUDED.permisos_especiales,
    color = EXCLUDED.color,
    icono = EXCLUDED.icono,
    updated_at = CURRENT_TIMESTAMP;

-- Insertar perfiles con IDs explícitos
INSERT INTO perfiles (id, nombre, descripcion, permisos, nivel_seguridad, modulos_acceso, restricciones_horarias, color, icono) VALUES
(1, 'Super Administrador del Sistema', 'Control total del sistema con acceso a todas las funcionalidades y configuraciones', 
 '{"all": true, "system": true, "users": true, "areas": true, "devices": true, "reports": true, "settings": true, "audit": true}', 
 5, 
 '{"dashboard", "usuarios", "areas", "dispositivos", "reportes", "configuracion", "auditoria", "sistema"}',
 '{"dias_semana": [1,2,3,4,5,6,7], "hora_inicio": "00:00", "hora_fin": "23:59"}',
 '#d32f2f', 'admin_panel_settings'),

(2, 'Administrador del Sistema', 'Administración completa del sistema de control de acceso', 
 '{"users": true, "areas": true, "devices": true, "reports": true, "settings": true, "audit": {"read": true}}', 
 4, 
 '{"dashboard", "usuarios", "areas", "dispositivos", "reportes", "configuracion"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "07:00", "hora_fin": "22:00"}',
 '#f57c00', 'security'),

(3, 'Gerente de Seguridad', 'Gestión de áreas de seguridad y supervisión de personal', 
 '{"users": {"read": true, "write": true}, "areas": true, "reports": true, "analytics": true, "access_control": true}', 
 4, 
 '{"dashboard", "usuarios", "areas", "reportes", "analiticas", "control_acceso"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "06:00", "hora_fin": "23:00"}',
 '#7b1fa2', 'supervisor_account'),

(4, 'Supervisor de Área', 'Supervisión de áreas asignadas y gestión de personal', 
 '{"users": {"read": true}, "areas": {"read": true, "write": true}, "reports": {"read": true}, "access_control": {"read": true}}', 
 3, 
 '{"dashboard", "usuarios", "areas", "reportes", "control_acceso"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "07:00", "hora_fin": "20:00"}',
 '#1976d2', 'manage_accounts'),

(5, 'Coordinador de Accesos', 'Coordinación de actividades y gestión de accesos', 
 '{"users": {"read": true}, "areas": {"read": true}, "access_control": true, "reports": {"read": true}}', 
 3, 
 '{"dashboard", "usuarios", "areas", "control_acceso", "reportes"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "08:00", "hora_fin": "18:00"}',
 '#388e3c', 'group'),

(6, 'Usuario Avanzado', 'Usuario con acceso extendido a funcionalidades específicas', 
 '{"areas": {"read": true, "write": true}, "profile": true, "reports": {"read": true}, "dashboard": true}', 
 2, 
 '{"dashboard", "areas", "perfil", "reportes"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "08:00", "hora_fin": "18:00"}',
 '#ff9800', 'person_add'),

(7, 'Usuario Estándar', 'Usuario básico con acceso a áreas autorizadas', 
 '{"areas": {"read": true}, "profile": {"read": true, "write": true}, "dashboard": true}', 
 2, 
 '{"dashboard", "areas", "perfil"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "08:00", "hora_fin": "18:00"}',
 '#2196f3', 'person'),

(8, 'Usuario Limitado', 'Usuario con acceso restringido a áreas específicas', 
 '{"areas": {"read": true}, "profile": {"read": true}, "dashboard": true}', 
 1, 
 '{"dashboard", "areas", "perfil"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "09:00", "hora_fin": "17:00"}',
 '#9e9e9e', 'person_outline'),

(9, 'Invitado Temporal', 'Acceso temporal y limitado al sistema', 
 '{"areas": {"read": true, "temporary": true}, "profile": {"read": true}}', 
 1, 
 '{"areas", "perfil"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "09:00", "hora_fin": "17:00"}',
 '#757575', 'person_off'),

(10, 'Auditor del Sistema', 'Solo lectura de reportes y logs del sistema', 
 '{"reports": {"read": true}, "logs": {"read": true}, "audit": true, "dashboard": true}', 
 2, 
 '{"dashboard", "reportes", "logs", "auditoria"}',
 '{"dias_semana": [1,2,3,4,5], "hora_inicio": "08:00", "hora_fin": "18:00"}',
 '#607d8b', 'assessment')
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos,
    nivel_seguridad = EXCLUDED.nivel_seguridad,
    modulos_acceso = EXCLUDED.modulos_acceso,
    restricciones_horarias = EXCLUDED.restricciones_horarias,
    color = EXCLUDED.color,
    icono = EXCLUDED.icono,
    updated_at = CURRENT_TIMESTAMP;

-- Actualizar secuencias para que el próximo ID sea correcto
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('perfiles_id_seq', (SELECT MAX(id) FROM perfiles));

-- Ahora el usuario admin con rol_id = 2 es seguro
INSERT INTO usuarios (nombre, apellido, email, username, password_hash, rol_id, perfil_id, estado) VALUES
('Admin', 'Sistema', 'admin@controlacceso.com', 'admin', 
 '$2a$10$rQZ8N3YqX9K2M1L4P7O6Q5R4S3T2U1V0W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0', 
 2, 2, 'activo')
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- SOLUCIÓN 2: Usar subconsulta para obtener IDs dinámicamente
-- =====================================================

-- Insertar usuario usando subconsulta (MÁS ROBUSTO)
INSERT INTO usuarios (nombre, apellido, email, username, password_hash, rol_id, perfil_id, estado) 
SELECT 
    'Admin', 
    'Sistema', 
    'admin@controlacceso.com', 
    'admin', 
    '$2a$10$rQZ8N3YqX9K2M1L4P7O6Q5R4S3T2U1V0W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0',
    (SELECT id FROM roles WHERE nombre = 'Administrador'),  -- ✅ Busca por nombre
    (SELECT id FROM perfiles WHERE nombre = 'Administrador del Sistema'),  -- ✅ Busca por nombre
    'activo'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');

-- =====================================================
-- SOLUCIÓN 3: Usar CTE (Common Table Expression)
-- =====================================================

WITH rol_admin AS (
    SELECT id FROM roles WHERE nombre = 'Administrador'
),
perfil_admin AS (
    SELECT id FROM perfiles WHERE nombre = 'Administrador del Sistema'
)
INSERT INTO usuarios (nombre, apellido, email, username, password_hash, rol_id, perfil_id, estado)
SELECT 
    'Admin',
    'Sistema',
    'admin@controlacceso.com',
    'admin',
    '$2a$10$rQZ8N3YqX9K2M1L4P7O6Q5R4S3T2U1V0W9X8Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0',
    rol_admin.id,
    perfil_admin.id,
    'activo'
FROM rol_admin, perfil_admin
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');

-- =====================================================
-- VENTAJAS DE CADA SOLUCIÓN
-- =====================================================

/*
SOLUCIÓN 1: IDs Explícitos
✅ Garantiza IDs consistentes siempre
✅ Fácil de referenciar desde otros INSERT
✅ ON CONFLICT DO UPDATE mantiene datos actualizados
❌ Requiere cambiar el schema.sql original
❌ Secuencias deben ajustarse manualmente

SOLUCIÓN 2: Subconsulta
✅ No depende de IDs hardcodeados
✅ Busca por nombre (más semántico)
✅ Funciona independiente del orden de inserción
✅ No requiere ajustar secuencias
❌ Falla si el rol/perfil no existe (pero eso es correcto)

SOLUCIÓN 3: CTE
✅ Más legible para múltiples referencias
✅ Busca por nombre
✅ Reutilizable para varios INSERT
✅ No depende de IDs hardcodeados
❌ Sintaxis más compleja

RECOMENDACIÓN: 
Para el schema.sql inicial → Solución 1 (IDs explícitos)
Para scripts de migración → Solución 2 o 3 (búsqueda por nombre)
*/

-- =====================================================
-- VERIFICACIÓN DE INTEGRIDAD
-- =====================================================

-- Script para verificar que el usuario admin tiene los roles correctos
DO $$
DECLARE
    v_rol_nombre VARCHAR;
    v_perfil_nombre VARCHAR;
BEGIN
    SELECT r.nombre, p.nombre 
    INTO v_rol_nombre, v_perfil_nombre
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    JOIN perfiles p ON u.perfil_id = p.id
    WHERE u.username = 'admin';
    
    IF v_rol_nombre = 'Administrador' AND v_perfil_nombre = 'Administrador del Sistema' THEN
        RAISE NOTICE '✅ Usuario admin correctamente configurado';
        RAISE NOTICE '   Rol: %', v_rol_nombre;
        RAISE NOTICE '   Perfil: %', v_perfil_nombre;
    ELSE
        RAISE WARNING '⚠️  Usuario admin tiene rol/perfil incorrecto!';
        RAISE WARNING '   Rol: % (esperado: Administrador)', v_rol_nombre;
        RAISE WARNING '   Perfil: % (esperado: Administrador del Sistema)', v_perfil_nombre;
    END IF;
END $$;

