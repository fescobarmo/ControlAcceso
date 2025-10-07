const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/database-serverless');

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// Middleware de CORS - Configuración simplificada
const allowedOrigins = [
  'https://controlacceso-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin check:', origin);
    
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Origin permitido:', origin);
      return callback(null, true);
    }
    
    // También permitir desde variables de entorno
    const envOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
    if (envOrigin && origin === envOrigin) {
      console.log('CORS: Origin permitido desde env:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Origin rechazado:', origin);
    return callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers de seguridad adicionales
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0-serverless'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API Serverless funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0-serverless'
  });
});

// Importar rutas serverless
const authRoutes = require('./routes/auth-serverless');

// Usar rutas
app.use('/api/auth', authRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Control de Acceso - Serverless',
    version: '2.0.0-serverless',
    status: 'running',
    endpoints: {
      health: '/health',
      test: '/api/test',
      auth: '/api/auth'
    },
    deployment: {
      platform: 'Vercel Serverless',
      database: 'Supabase PostgreSQL',
      frontend: 'Vercel Static'
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Exportar la app para Vercel
module.exports = app;
