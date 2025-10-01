-- =====================================================
-- SCRIPT DE PRUEBA: Problema de IDs no coincidentes
-- =====================================================
-- Este script demuestra qué sucede cuando los IDs 
-- de roles/perfiles no coinciden con lo esperado

-- Limpiar tablas de prueba
DROP TABLE IF EXISTS test_usuarios CASCADE;
DROP TABLE IF EXISTS test_roles CASCADE;
DROP TABLE IF EXISTS test_perfiles CASCADE;

-- Crear tablas de prueba
CREATE TABLE test_roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE test_perfiles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE test_usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES test_roles(id) ON DELETE RESTRICT,
    perfil_id INTEGER NOT NULL REFERENCES test_perfiles(id) ON DELETE RESTRICT
);

-- =====================================================
-- ESCENARIO 1: Primera ejecución (FUNCIONA)
-- =====================================================
INSERT INTO test_roles (nombre) VALUES
('Super Administrador'),  -- id = 1
('Administrador'),        -- id = 2
('Gerente')               -- id = 3
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO test_perfiles (nombre) VALUES
('Super Administrador del Sistema'),  -- id = 1
('Administrador del Sistema'),        -- id = 2
('Gerente de Seguridad')              -- id = 3
ON CONFLICT (nombre) DO NOTHING;

-- Usuario asume que 'Administrador' es id = 2
INSERT INTO test_usuarios (username, rol_id, perfil_id) VALUES
('admin', 2, 2)  -- FUNCIONA porque 'Administrador' ES id = 2
ON CONFLICT (username) DO NOTHING;

SELECT 'ESCENARIO 1: Primera ejecución' as escenario;
SELECT u.username, r.nombre as rol, p.nombre as perfil 
FROM test_usuarios u
JOIN test_roles r ON u.rol_id = r.id
JOIN test_perfiles p ON u.perfil_id = p.id;

-- =====================================================
-- ESCENARIO 2: Secuencia alterada (FALLA)
-- =====================================================
DELETE FROM test_usuarios;
DELETE FROM test_roles;
DELETE FROM test_perfiles;

-- Simular que la secuencia fue alterada
ALTER SEQUENCE test_roles_id_seq RESTART WITH 10;
ALTER SEQUENCE test_perfiles_id_seq RESTART WITH 20;

INSERT INTO test_roles (nombre) VALUES
('Super Administrador'),  -- id = 10 (NO 1)
('Administrador'),        -- id = 11 (NO 2) ⚠️
('Gerente')               -- id = 12 (NO 3)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO test_perfiles (nombre) VALUES
('Super Administrador del Sistema'),  -- id = 20
('Administrador del Sistema'),        -- id = 21 ⚠️
('Gerente de Seguridad')              -- id = 22
ON CONFLICT (nombre) DO NOTHING;

-- Intentar insertar usuario con rol_id = 2
BEGIN;
    INSERT INTO test_usuarios (username, rol_id, perfil_id) VALUES
    ('admin', 2, 2);  -- ❌ ERROR: Foreign key violation
    SELECT 'ESCENARIO 2: ERROR - rol_id 2 no existe' as resultado;
EXCEPTION WHEN foreign_key_violation THEN
    ROLLBACK;
    SELECT 'ESCENARIO 2: ERROR - Foreign key violation detectado!' as resultado;
END;

SELECT 'ESCENARIO 2: Secuencia alterada - IDs actuales:' as escenario;
SELECT id, nombre FROM test_roles;
SELECT id, nombre FROM test_perfiles;

-- =====================================================
-- ESCENARIO 3: ON CONFLICT evita inserción (PROBLEMA)
-- =====================================================
DELETE FROM test_usuarios;
DELETE FROM test_roles;
DELETE FROM test_perfiles;

-- Resetear secuencias
ALTER SEQUENCE test_roles_id_seq RESTART WITH 1;
ALTER SEQUENCE test_perfiles_id_seq RESTART WITH 1;

-- Primera ejecución: insertar 'Super Administrador' primero
INSERT INTO test_roles (nombre) VALUES
('Super Administrador')  -- id = 1
ON CONFLICT (nombre) DO NOTHING;

-- Segunda ejecución: intenta insertar todos, pero Super Admin ya existe
INSERT INTO test_roles (nombre) VALUES
('Super Administrador'),  -- ON CONFLICT → NO se inserta (ya existe)
('Administrador'),        -- id = 2 ✅ (correcto)
('Gerente')               -- id = 3
ON CONFLICT (nombre) DO NOTHING;

-- Perfiles similar
INSERT INTO test_perfiles (nombre) VALUES
('Super Administrador del Sistema')  -- id = 1
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO test_perfiles (nombre) VALUES
('Super Administrador del Sistema'),  -- ON CONFLICT → NO se inserta
('Administrador del Sistema'),        -- id = 2 ✅ (por suerte coincide)
('Gerente de Seguridad')              -- id = 3
ON CONFLICT (nombre) DO NOTHING;

-- Este caso FUNCIONA pero es frágil
INSERT INTO test_usuarios (username, rol_id, perfil_id) VALUES
('admin', 2, 2)  -- ✅ Por suerte coincide
ON CONFLICT (username) DO NOTHING;

SELECT 'ESCENARIO 3: ON CONFLICT parcial' as escenario;
SELECT u.username, r.nombre as rol, p.nombre as perfil 
FROM test_usuarios u
JOIN test_roles r ON u.rol_id = r.id
JOIN test_perfiles p ON u.perfil_id = p.id;

-- =====================================================
-- ESCENARIO 4: Borrado y reinserción (FALLA)
-- =====================================================
DELETE FROM test_usuarios;
DELETE FROM test_roles WHERE nombre = 'Super Administrador';  -- Borra el id = 1

-- Reinsertar
INSERT INTO test_roles (nombre) VALUES
('Super Administrador'),  -- id = 4 (siguiente en la secuencia, NO 1) ⚠️
('Administrador'),        -- Ya existe con id = 2
('Gerente')               -- Ya existe con id = 3
ON CONFLICT (nombre) DO NOTHING;

-- Ahora tenemos:
-- id = 2: Administrador (correcto)
-- id = 3: Gerente
-- id = 4: Super Administrador (debería ser 1)

SELECT 'ESCENARIO 4: Después de borrado y reinserción' as escenario;
SELECT id, nombre FROM test_roles ORDER BY id;

-- Limpiar
DROP TABLE IF EXISTS test_usuarios CASCADE;
DROP TABLE IF EXISTS test_roles CASCADE;
DROP TABLE IF EXISTS test_perfiles CASCADE;

-- =====================================================
-- CONCLUSIÓN
-- =====================================================
SELECT '
⚠️  PROBLEMA IDENTIFICADO:
- Los INSERT de roles/perfiles NO especifican IDs explícitos
- Los IDs son SERIAL (auto-incrementales)
- El usuario se inserta con rol_id = 2 HARDCODED
- Si la secuencia cambia, los IDs no coinciden
- Resultado: ERROR de integridad referencial o datos incorrectos
' as conclusion;

