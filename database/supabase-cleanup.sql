-- =====================================================
-- SCRIPT DE LIMPIEZA PARA SUPABASE
-- =====================================================
-- 
-- ADVERTENCIA: Este script BORRA TODAS LAS TABLAS
-- Úsalo solo si quieres empezar desde cero
--
-- INSTRUCCIONES:
-- 1. Abre Supabase SQL Editor
-- 2. Copia y pega este script
-- 3. Ejecuta (Ctrl/Cmd + Enter)
-- 4. Luego ejecuta supabase-schema.sql
--
-- =====================================================

-- Eliminar vistas primero
DROP VIEW IF EXISTS v_permisos_usuario CASCADE;
DROP VIEW IF EXISTS v_accesos_recientes CASCADE;
DROP VIEW IF EXISTS v_usuarios_completos CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS get_users_by_role_stats() CASCADE;
DROP FUNCTION IF EXISTS check_user_access(INTEGER, INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_user_permissions(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Eliminar tablas en orden (respetando foreign keys)
DROP TABLE IF EXISTS logs_acceso CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS permisos_acceso CASCADE;
DROP TABLE IF EXISTS dispositivos CASCADE;
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS residentes CASCADE;
DROP TABLE IF EXISTS configuracion_sistema CASCADE;
DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Todas las tablas, vistas y funciones han sido eliminadas';
    RAISE NOTICE '📝 Ahora puedes ejecutar supabase-schema.sql para recrear todo';
END $$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta esto para verificar que todo se eliminó:
-- 
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;
--
-- Deberías ver 0 resultados (o solo tablas del sistema)
-- =====================================================

