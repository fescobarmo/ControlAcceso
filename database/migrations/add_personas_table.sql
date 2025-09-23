-- Migración para crear la tabla de personas

-- Crear la tabla de personas
CREATE TABLE IF NOT EXISTS personas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20) DEFAULT 'RUN' CHECK (tipo_documento IN ('RUN', 'PASAPORTE', 'DNI', 'CARNET')),
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    foto_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'pendiente')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Añadir índices para optimización
CREATE INDEX IF NOT EXISTS idx_personas_numero_documento ON personas(numero_documento);
CREATE INDEX IF NOT EXISTS idx_personas_estado ON personas(estado);
CREATE INDEX IF NOT EXISTS idx_personas_tipo_documento ON personas(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_personas_created_by ON personas(created_by);

-- Insertar datos de ejemplo
INSERT INTO personas (nombre, apellido, tipo_documento, numero_documento, estado, created_by, updated_by) VALUES
('Juan Carlos', 'Pérez González', 'RUN', '12345678-9', 'activo', 1, 1),
('María Elena', 'Rodríguez Silva', 'RUN', '98765432-1', 'activo', 1, 1),
('Carlos Alberto', 'Martínez López', 'RUN', '11223344-5', 'pendiente', 1, 1),
('Ana Patricia', 'García Morales', 'PASAPORTE', 'AB123456', 'activo', 1, 1),
('Pedro Antonio', 'Fernández Torres', 'RUN', '55667788-0', 'inactivo', 1, 1);
