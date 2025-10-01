-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE INTEGRIDAD
-- =====================================================
-- Este script verifica que la carga inicial de la base
-- de datos se realizó correctamente y que no hay
-- problemas de integridad referencial

-- =====================================================
-- 1. VERIFICAR ROLES
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
    v_expected_ids INTEGER[] := ARRAY[1,2,3,4,5,6,7,8,9,10];
    v_actual_ids INTEGER[];
BEGIN
    -- Contar roles
    SELECT COUNT(*) INTO v_count FROM roles WHERE is_active = true;
    
    IF v_count < 10 THEN
        RAISE WARNING '⚠️  Solo hay % roles activos (se esperan 10)', v_count;
    ELSE
        RAISE NOTICE '✅ Roles: % roles encontrados', v_count;
    END IF;
    
    -- Verificar IDs específicos
    SELECT ARRAY_AGG(id ORDER BY id) INTO v_actual_ids 
    FROM roles WHERE id IN (1,2,3,4,5,6,7,8,9,10);
    
    IF v_actual_ids = v_expected_ids THEN
        RAISE NOTICE '✅ Roles: IDs 1-10 están presentes correctamente';
    ELSE
        RAISE WARNING '⚠️  Roles: IDs esperados no coinciden';
        RAISE WARNING '   Esperados: %', v_expected_ids;
        RAISE WARNING '   Actuales:  %', v_actual_ids;
    END IF;
    
    -- Verificar que rol_id = 2 es 'Administrador'
    SELECT COUNT(*) INTO v_count 
    FROM roles 
    WHERE id = 2 AND nombre = 'Administrador';
    
    IF v_count = 1 THEN
        RAISE NOTICE '✅ Roles: ID 2 = "Administrador" verificado';
    ELSE
        RAISE EXCEPTION '❌ ERROR CRÍTICO: rol_id = 2 NO es "Administrador"!';
    END IF;
END $$;

-- =====================================================
-- 2. VERIFICAR PERFILES
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
    v_expected_ids INTEGER[] := ARRAY[1,2,3,4,5,6,7,8,9,10];
    v_actual_ids INTEGER[];
BEGIN
    -- Contar perfiles
    SELECT COUNT(*) INTO v_count FROM perfiles WHERE is_active = true;
    
    IF v_count < 10 THEN
        RAISE WARNING '⚠️  Solo hay % perfiles activos (se esperan 10)', v_count;
    ELSE
        RAISE NOTICE '✅ Perfiles: % perfiles encontrados', v_count;
    END IF;
    
    -- Verificar IDs específicos
    SELECT ARRAY_AGG(id ORDER BY id) INTO v_actual_ids 
    FROM perfiles WHERE id IN (1,2,3,4,5,6,7,8,9,10);
    
    IF v_actual_ids = v_expected_ids THEN
        RAISE NOTICE '✅ Perfiles: IDs 1-10 están presentes correctamente';
    ELSE
        RAISE WARNING '⚠️  Perfiles: IDs esperados no coinciden';
        RAISE WARNING '   Esperados: %', v_expected_ids;
        RAISE WARNING '   Actuales:  %', v_actual_ids;
    END IF;
    
    -- Verificar que perfil_id = 2 es 'Administrador del Sistema'
    SELECT COUNT(*) INTO v_count 
    FROM perfiles 
    WHERE id = 2 AND nombre = 'Administrador del Sistema';
    
    IF v_count = 1 THEN
        RAISE NOTICE '✅ Perfiles: ID 2 = "Administrador del Sistema" verificado';
    ELSE
        RAISE EXCEPTION '❌ ERROR CRÍTICO: perfil_id = 2 NO es "Administrador del Sistema"!';
    END IF;
END $$;

-- =====================================================
-- 3. VERIFICAR USUARIO ADMIN
-- =====================================================
DO $$
DECLARE
    v_rol_nombre VARCHAR;
    v_perfil_nombre VARCHAR;
    v_rol_id INTEGER;
    v_perfil_id INTEGER;
    v_count INTEGER;
BEGIN
    -- Verificar que existe el usuario admin
    SELECT COUNT(*) INTO v_count FROM usuarios WHERE username = 'admin';
    
    IF v_count = 0 THEN
        RAISE EXCEPTION '❌ ERROR CRÍTICO: Usuario "admin" no existe!';
    ELSIF v_count > 1 THEN
        RAISE WARNING '⚠️  Hay % usuarios con username "admin" (debería ser 1)', v_count;
    ELSE
        RAISE NOTICE '✅ Usuario: Usuario "admin" existe';
    END IF;
    
    -- Obtener información del usuario admin
    SELECT u.rol_id, u.perfil_id, r.nombre, p.nombre 
    INTO v_rol_id, v_perfil_id, v_rol_nombre, v_perfil_nombre
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    JOIN perfiles p ON u.perfil_id = p.id
    WHERE u.username = 'admin' AND u.is_active = true;
    
    -- Verificar IDs
    IF v_rol_id = 2 AND v_perfil_id = 2 THEN
        RAISE NOTICE '✅ Usuario: IDs correctos (rol_id=2, perfil_id=2)';
    ELSE
        RAISE EXCEPTION '❌ ERROR CRÍTICO: Usuario admin tiene IDs incorrectos! rol_id=%, perfil_id=%', v_rol_id, v_perfil_id;
    END IF;
    
    -- Verificar nombres
    IF v_rol_nombre = 'Administrador' AND v_perfil_nombre = 'Administrador del Sistema' THEN
        RAISE NOTICE '✅ Usuario: Rol y Perfil correctos';
        RAISE NOTICE '   Rol:    %', v_rol_nombre;
        RAISE NOTICE '   Perfil: %', v_perfil_nombre;
    ELSE
        RAISE EXCEPTION '❌ ERROR CRÍTICO: Usuario admin tiene rol/perfil incorrectos!';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICAR INTEGRIDAD REFERENCIAL
-- =====================================================
DO $$
DECLARE
    v_orphan_usuarios INTEGER;
    v_orphan_permisos INTEGER;
    v_orphan_logs INTEGER;
BEGIN
    -- Usuarios huérfanos (rol_id o perfil_id inválido)
    SELECT COUNT(*) INTO v_orphan_usuarios
    FROM usuarios u
    WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.id = u.rol_id)
       OR NOT EXISTS (SELECT 1 FROM perfiles p WHERE p.id = u.perfil_id);
    
    IF v_orphan_usuarios > 0 THEN
        RAISE WARNING '⚠️  Hay % usuarios con rol_id o perfil_id inválido', v_orphan_usuarios;
    ELSE
        RAISE NOTICE '✅ Integridad: No hay usuarios huérfanos';
    END IF;
    
    -- Permisos huérfanos
    SELECT COUNT(*) INTO v_orphan_permisos
    FROM permisos_acceso pa
    WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.id = pa.usuario_id)
       OR NOT EXISTS (SELECT 1 FROM areas a WHERE a.id = pa.area_id);
    
    IF v_orphan_permisos > 0 THEN
        RAISE WARNING '⚠️  Hay % permisos con usuario_id o area_id inválido', v_orphan_permisos;
    ELSE
        RAISE NOTICE '✅ Integridad: No hay permisos huérfanos';
    END IF;
    
    -- Logs huérfanos
    SELECT COUNT(*) INTO v_orphan_logs
    FROM logs_acceso la
    WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.id = la.usuario_id)
       OR NOT EXISTS (SELECT 1 FROM areas a WHERE a.id = la.area_id);
    
    IF v_orphan_logs > 0 THEN
        RAISE WARNING '⚠️  Hay % logs con usuario_id o area_id inválido', v_orphan_logs;
    ELSE
        RAISE NOTICE '✅ Integridad: No hay logs huérfanos';
    END IF;
END $$;

-- =====================================================
-- 5. VERIFICAR SECUENCIAS
-- =====================================================
DO $$
DECLARE
    v_roles_seq INTEGER;
    v_perfiles_seq INTEGER;
    v_usuarios_seq INTEGER;
    v_roles_max INTEGER;
    v_perfiles_max INTEGER;
    v_usuarios_max INTEGER;
BEGIN
    -- Obtener valores de secuencias
    SELECT last_value INTO v_roles_seq FROM roles_id_seq;
    SELECT last_value INTO v_perfiles_seq FROM perfiles_id_seq;
    SELECT last_value INTO v_usuarios_seq FROM usuarios_id_seq;
    
    -- Obtener valores máximos de tablas
    SELECT COALESCE(MAX(id), 0) INTO v_roles_max FROM roles;
    SELECT COALESCE(MAX(id), 0) INTO v_perfiles_max FROM perfiles;
    SELECT COALESCE(MAX(id), 0) INTO v_usuarios_max FROM usuarios;
    
    -- Verificar roles
    IF v_roles_seq >= v_roles_max THEN
        RAISE NOTICE '✅ Secuencias: roles_id_seq = % (max_id = %)', v_roles_seq, v_roles_max;
    ELSE
        RAISE WARNING '⚠️  roles_id_seq (%) < max_id (%) - Puede causar conflictos', v_roles_seq, v_roles_max;
    END IF;
    
    -- Verificar perfiles
    IF v_perfiles_seq >= v_perfiles_max THEN
        RAISE NOTICE '✅ Secuencias: perfiles_id_seq = % (max_id = %)', v_perfiles_seq, v_perfiles_max;
    ELSE
        RAISE WARNING '⚠️  perfiles_id_seq (%) < max_id (%) - Puede causar conflictos', v_perfiles_seq, v_perfiles_max;
    END IF;
    
    -- Verificar usuarios
    IF v_usuarios_seq >= v_usuarios_max THEN
        RAISE NOTICE '✅ Secuencias: usuarios_id_seq = % (max_id = %)', v_usuarios_seq, v_usuarios_max;
    ELSE
        RAISE WARNING '⚠️  usuarios_id_seq (%) < max_id (%) - Puede causar conflictos', v_usuarios_seq, v_usuarios_max;
    END IF;
END $$;

-- =====================================================
-- 6. VERIFICAR ÁREAS Y DISPOSITIVOS
-- =====================================================
DO $$
DECLARE
    v_areas_count INTEGER;
    v_dispositivos_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_areas_count FROM areas WHERE is_active = true;
    SELECT COUNT(*) INTO v_dispositivos_count FROM dispositivos WHERE is_active = true;
    
    IF v_areas_count >= 10 THEN
        RAISE NOTICE '✅ Áreas: % áreas activas encontradas', v_areas_count;
    ELSE
        RAISE WARNING '⚠️  Solo hay % áreas activas (se esperan al menos 10)', v_areas_count;
    END IF;
    
    IF v_dispositivos_count >= 10 THEN
        RAISE NOTICE '✅ Dispositivos: % dispositivos activos encontrados', v_dispositivos_count;
    ELSE
        RAISE WARNING '⚠️  Solo hay % dispositivos activos (se esperan al menos 10)', v_dispositivos_count;
    END IF;
END $$;

-- =====================================================
-- 7. RESUMEN FINAL
-- =====================================================
SELECT '
╔════════════════════════════════════════════════════════════════╗
║           VERIFICACIÓN DE INTEGRIDAD COMPLETADA                ║
╚════════════════════════════════════════════════════════════════╝

Si todos los checks son ✅, la base de datos está correctamente inicializada.

Para verificar el usuario admin manualmente:

SELECT 
    u.username,
    u.email,
    r.nombre as rol,
    p.nombre as perfil,
    u.estado
FROM usuarios u
JOIN roles r ON u.rol_id = r.id
JOIN perfiles p ON u.perfil_id = p.id
WHERE u.username = ''admin'';

' as resumen;

-- Mostrar información del usuario admin
SELECT 
    u.id,
    u.username,
    u.email,
    u.rol_id,
    r.nombre as rol_nombre,
    u.perfil_id,
    p.nombre as perfil_nombre,
    u.estado,
    u.created_at
FROM usuarios u
JOIN roles r ON u.rol_id = r.id
JOIN perfiles p ON u.perfil_id = p.id
WHERE u.username = 'admin';

