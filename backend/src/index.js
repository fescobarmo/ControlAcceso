const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
  credentials: true
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

// Health check endpoint - simple version for serverless
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Backend is running'
  });
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Lazy load routes to avoid initialization issues
app.use('/api/auth', (req, res, next) => {
  try {
    const authRoutes = require('./routes/auth');
    authRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading auth routes:', error);
    res.status(500).json({ error: 'Auth routes not available', message: error.message });
  }
});

app.use('/api/users', (req, res, next) => {
  try {
    const userRoutes = require('./routes/users');
    userRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading user routes:', error);
    res.status(500).json({ error: 'User routes not available', message: error.message });
  }
});

app.use('/api/residents', (req, res, next) => {
  try {
    const residentRoutes = require('./routes/residents');
    residentRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading resident routes:', error);
    res.status(500).json({ error: 'Resident routes not available', message: error.message });
  }
});

app.use('/api/visitas', (req, res, next) => {
  try {
    const visitaRoutes = require('./routes/visitas');
    visitaRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading visita routes:', error);
    res.status(500).json({ error: 'Visita routes not available', message: error.message });
  }
});

app.use('/api/areas', (req, res, next) => {
  try {
    const areaRoutes = require('./routes/areas');
    areaRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading area routes:', error);
    res.status(500).json({ error: 'Area routes not available', message: error.message });
  }
});

app.use('/api/dispositivos', (req, res, next) => {
  try {
    const dispositivoRoutes = require('./routes/dispositivos');
    dispositivoRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading dispositivo routes:', error);
    res.status(500).json({ error: 'Dispositivo routes not available', message: error.message });
  }
});

app.use('/api/bitacora', (req, res, next) => {
  try {
    const bitacoraRoutes = require('./routes/bitacora');
    bitacoraRoutes(req, res, next);
  } catch (error) {
    console.error('Error loading bitacora routes:', error);
    res.status(500).json({ error: 'Bitacora routes not available', message: error.message });
  }
});

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Control de Acceso',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      test: '/api/test',
      auth: '/api/auth',
      users: '/api/users',
      residents: '/api/residents',
      visitas: '/api/visitas',
      areas: '/api/areas',
      dispositivos: '/api/dispositivos',
      bitacora: '/api/bitacora'
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Función de inicialización para modo servidor (local) - solo si no estamos en Vercel
if (process.env.VERCEL !== '1' && require.main === module) {
  const initializeApp = async () => {
    try {
      console.log('🚀 Iniciando aplicación en modo local...');
      
      // Conectar a la base de datos
      const { testConnection, syncDatabase } = require('./config/database');
      const { seedInitialData } = require('./seeds/initialData');
      
      console.log('📊 Probando conexión a la base de datos...');
      const isConnected = await testConnection();
      
      if (!isConnected) {
        console.error('❌ No se pudo conectar a la base de datos. Saliendo...');
        process.exit(1);
      }

      // Sincronizar modelos
      await syncDatabase(false);

      // Cargar datos iniciales
      console.log('🌱 Cargando datos iniciales...');
      await seedInitialData();

      // Iniciar servidor
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
        console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      });

    } catch (error) {
      console.error('❌ Error inicializando la aplicación:', error);
      process.exit(1);
    }
  };

  // Manejo de señales de terminación
  process.on('SIGINT', () => {
    console.log('\n🛑 Recibida señal SIGINT. Cerrando servidor...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Recibida señal SIGTERM. Cerrando servidor...');
    process.exit(0);
  });

  // Inicializar
  initializeApp();
}

// Exportar la app para Vercel/Serverless
module.exports = app;
