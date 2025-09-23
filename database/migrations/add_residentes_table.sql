-- Migración para crear la tabla residentes
-- Fecha: 2025-01-22

-- Crear la tabla residentes
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

-- Crear índices para la tabla residentes
CREATE INDEX IF NOT EXISTS idx_residentes_documento ON residentes(documento);
CREATE INDEX IF NOT EXISTS idx_residentes_estado ON residentes(estado);
CREATE INDEX IF NOT EXISTS idx_residentes_tipo_residente ON residentes(tipo_residente);
CREATE INDEX IF NOT EXISTS idx_residentes_created_by ON residentes(created_by);

-- Insertar algunos datos de ejemplo
INSERT INTO residentes (nombre, apellido_paterno, apellido_materno, tipo_documento, documento, fecha_nacimiento, telefono, email, direccion_residencia, numero_residencia, tipo_residencia, fecha_ingreso, estado, tipo_residente, created_by) VALUES
('Juan', 'Pérez', 'González', 'RUN', '12345678-9', '1985-03-15', '+56912345678', 'juan.perez@email.com', 'Av. Principal 123', '101', 'Departamento', '2020-01-15', 'activo', 'propietario', 1),
('María', 'Rodríguez', 'Silva', 'RUN', '98765432-1', '1990-07-22', '+56987654321', 'maria.rodriguez@email.com', 'Av. Principal 123', '102', 'Departamento', '2021-03-10', 'activo', 'arrendatario', 1),
('Carlos', 'López', 'Martínez', 'RUN', '11223344-5', '1988-11-08', '+56911223344', 'carlos.lopez@email.com', 'Av. Principal 123', '103', 'Departamento', '2019-08-20', 'activo', 'propietario', 1);

COMMIT;
