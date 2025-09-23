-- Migración para agregar campo tipo_documento a la tabla visitas
-- Ejecutar este script en la base de datos para actualizar la estructura

-- Agregar el campo tipo_documento
ALTER TABLE visitas 
ADD COLUMN tipo_documento VARCHAR(20) DEFAULT 'RUN' NOT NULL;

-- Crear el tipo ENUM si no existe (PostgreSQL)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_visitas_tipo_documento') THEN
        CREATE TYPE enum_visitas_tipo_documento AS ENUM ('RUN', 'Pasaporte', 'DNI', 'Otro');
    END IF;
END $$;

-- Actualizar el campo para usar el tipo ENUM
ALTER TABLE visitas 
ALTER COLUMN tipo_documento TYPE enum_visitas_tipo_documento 
USING tipo_documento::enum_visitas_tipo_documento;

-- Agregar constraint para validar los valores
ALTER TABLE visitas 
ADD CONSTRAINT check_tipo_documento 
CHECK (tipo_documento IN ('RUN', 'Pasaporte', 'DNI', 'Otro'));

-- Actualizar registros existentes para que tengan el valor por defecto
UPDATE visitas 
SET tipo_documento = 'RUN' 
WHERE tipo_documento IS NULL OR tipo_documento = '';

-- Comentario sobre la migración
COMMENT ON COLUMN visitas.tipo_documento IS 'Tipo de documento de identidad: RUN, Pasaporte, DNI u Otro';



