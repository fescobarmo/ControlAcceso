-- Migración para crear la tabla de auditoría (bitácora)

-- Crear la tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Añadir índices para optimización
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria(timestamp);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);

-- Insertar datos de ejemplo
INSERT INTO auditoria (usuario_id, accion, timestamp) VALUES
(1, 'Usuario inició sesión', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(1, 'Usuario creó nueva visita', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, 'Usuario actualizó perfil', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(1, 'Usuario eliminó registro', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(1, 'Usuario exportó reporte', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(1, 'Usuario cambió configuración', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(1, 'Usuario accedió a dashboard', CURRENT_TIMESTAMP - INTERVAL '7 hours'),
(1, 'Usuario creó nueva persona', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
(1, 'Usuario actualizó residente', CURRENT_TIMESTAMP - INTERVAL '9 hours'),
(1, 'Usuario cerró sesión', CURRENT_TIMESTAMP - INTERVAL '10 hours');

