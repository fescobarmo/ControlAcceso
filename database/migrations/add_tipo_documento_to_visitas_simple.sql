-- Migración simple para agregar campo tipo_documento a la tabla visitas
-- Compatible con MySQL, SQLite y PostgreSQL

-- Agregar el campo tipo_documento
ALTER TABLE visitas 
ADD COLUMN tipo_documento VARCHAR(20) DEFAULT 'RUN' NOT NULL;

-- Actualizar registros existentes para que tengan el valor por defecto
UPDATE visitas 
SET tipo_documento = 'RUN' 
WHERE tipo_documento IS NULL OR tipo_documento = '';

-- Agregar constraint para validar los valores (opcional, algunos sistemas no lo soportan)
-- ALTER TABLE visitas 
-- ADD CONSTRAINT check_tipo_documento 
-- CHECK (tipo_documento IN ('RUN', 'Pasaporte', 'DNI', 'Otro'));



