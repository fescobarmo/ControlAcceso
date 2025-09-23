const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '.env.temp' });
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Headers de seguridad adicionales
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Servidor funcionando sin base de datos'
  });
});

// Endpoint de prueba simple
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de login simulado
app.post('/api/auth/login-simple', (req, res) => {
  const { username, password } = req.body;
  
  // Login simulado para admin/admin123
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login exitoso',
      token: 'jwt_token_simulado_123',
      user: {
        id: 1,
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@sistema.com',
        username: 'admin',
        role: {
          nombre: 'Administrador',
          nivel_acceso: 10
        },
        profile: {
          nombre: 'Administrador'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Endpoint para obtener usuario actual
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 1,
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@sistema.com',
      username: 'admin',
      role: {
        nombre: 'Administrador',
        nivel_acceso: 10
      },
      profile: {
        nombre: 'Administrador'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// Error handler global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor simple corriendo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔐 Login: admin / admin123`);
  console.log(`⚠️  Modo: Sin base de datos (solo para pruebas)`);
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal SIGINT. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal SIGTERM. Cerrando servidor...');
  process.exit(0);
});

