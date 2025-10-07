const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones para Vercel Serverless
let pool;

const createPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      // Configuración optimizada para serverless
      max: 1, // Máximo 1 conexión por función
      min: 0, // Mínimo 0 conexiones
      idle: 1000, // 1 segundo idle
      acquire: 3000, // 3 segundos para adquirir conexión
      evict: 1000, // Evict después de 1 segundo
    });

    // Manejo de errores del pool
    pool.on('error', (err) => {
      console.error('Pool error:', err);
    });
  }
  return pool;
};

// Función para ejecutar queries
const query = async (text, params = []) => {
  const client = createPool();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Función para probar la conexión
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Función para cerrar el pool (útil para cleanup)
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

module.exports = {
  query,
  testConnection,
  closePool,
  pool: () => pool
};
