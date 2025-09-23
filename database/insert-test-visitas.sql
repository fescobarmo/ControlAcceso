-- Script para insertar datos de prueba en la tabla visitas
-- Ejecutar este script en la base de datos para probar la funcionalidad

-- Primero, asegurarse de que la tabla existe y tiene la estructura correcta
-- Si la tabla no existe, crearla
CREATE TABLE IF NOT EXISTS visitas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    tipo_documento VARCHAR(20) DEFAULT 'RUN' NOT NULL,
    documento VARCHAR(20) NOT NULL,
    departamento VARCHAR(100),
    ingreso_vehiculo BOOLEAN DEFAULT FALSE,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_salida TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'ingreso' CHECK (estado IN ('ingreso', 'salida', 'cancelada')),
    observaciones TEXT,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
INSERT INTO visitas (nombre, apellido_paterno, apellido_materno, tipo_documento, documento, departamento, ingreso_vehiculo, estado, observaciones) VALUES
('Juan Carlos', 'González', 'Pérez', 'RUN', '12.345.678-9', 'Recursos Humanos', true, 'ingreso', 'Visita para entrevista de trabajo'),
('María Elena', 'Rodríguez', 'Silva', 'Pasaporte', 'AB123456', 'Administración', false, 'ingreso', 'Reunión de negocios'),
('Pedro Antonio', 'López', 'Martínez', 'DNI', '87654321', 'Tecnología', true, 'salida', 'Mantenimiento de equipos'),
('Ana Sofía', 'Hernández', 'García', 'RUN', '98.765.432-1', 'Marketing', false, 'ingreso', 'Presentación de propuesta'),
('Carlos Manuel', 'Torres', 'Vargas', 'Otro', 'LIC123456', 'Logística', true, 'cancelada', 'Entrega de materiales');

-- Verificar que los datos se insertaron correctamente
SELECT 
    id,
    nombre,
    apellido_paterno,
    apellido_materno,
    tipo_documento,
    documento,
    departamento,
    estado,
    fecha_ingreso,
    created_at
FROM visitas 
ORDER BY created_at DESC;

-- Mostrar estadísticas
SELECT 
    COUNT(*) as total_visitas,
    COUNT(CASE WHEN estado = 'ingreso' THEN 1 END) as visitas_activas,
    COUNT(CASE WHEN estado = 'salida' THEN 1 END) as visitas_completadas,
    COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as visitas_canceladas
FROM visitas;



