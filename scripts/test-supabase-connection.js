#!/usr/bin/env node

/**
 * Script para probar la conexión a Supabase
 * 
 * Uso:
 *   node scripts/test-supabase-connection.js
 * 
 * O con variables de entorno personalizadas:
 *   DB_HOST=db.xxx.supabase.co DB_PASSWORD=xxx node scripts/test-supabase-connection.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

async function testConnection() {
  log.section('🔍 Probando conexión a Supabase...');
  console.log('');

  // Configuración de la conexión
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  };

  // Verificar que tenemos las credenciales necesarias
  if (!config.host || !config.password) {
    log.error('Faltan credenciales de conexión');
    console.log('');
    log.info('Asegúrate de tener un archivo .env en la carpeta backend/ con:');
    console.log('  DB_HOST=db.xxxxx.supabase.co');
    console.log('  DB_PASSWORD=tu_password');
    console.log('');
    process.exit(1);
  }

  log.info(`Host: ${config.host}`);
  log.info(`Puerto: ${config.port}`);
  log.info(`Base de datos: ${config.database}`);
  log.info(`Usuario: ${config.user}`);
  log.info(`SSL: ${config.ssl ? 'Habilitado' : 'Deshabilitado'}`);
  console.log('');

  const client = new Client(config);

  try {
    // Intentar conectar
    log.section('📡 Conectando...');
    await client.connect();
    log.success('Conexión establecida exitosamente');
    console.log('');

    // Verificar versión de PostgreSQL
    log.section('📊 Información del servidor:');
    const versionResult = await client.query('SELECT version()');
    log.info(`PostgreSQL: ${versionResult.rows[0].version.split(',')[0]}`);

    // Verificar extensiones
    const extensionsResult = await client.query(
      "SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto')"
    );
    log.info(`Extensiones instaladas: ${extensionsResult.rows.map(r => r.extname).join(', ') || 'Ninguna'}`);
    console.log('');

    // Listar tablas existentes
    log.section('📋 Tablas en la base de datos:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      log.warning('No se encontraron tablas');
      console.log('');
      log.info('¿Necesitas migrar el schema?');
      log.info('Ejecuta: psql "postgresql://...conexión..." -f database/schema.sql');
      log.info('O copia database/schema.sql en Supabase SQL Editor');
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
      log.success(`Se encontraron ${tablesResult.rows.length} tablas`);
    }
    console.log('');

    // Si existen tablas, verificar datos básicos
    if (tablesResult.rows.length > 0) {
      log.section('📊 Estadísticas rápidas:');

      // Verificar tabla usuarios
      const tableExists = tablesResult.rows.some(r => r.table_name === 'usuarios');
      if (tableExists) {
        const userCount = await client.query('SELECT COUNT(*) FROM usuarios');
        log.info(`Usuarios registrados: ${userCount.rows[0].count}`);

        const roleCount = await client.query('SELECT COUNT(*) FROM roles');
        log.info(`Roles configurados: ${roleCount.rows[0].count}`);

        const perfilCount = await client.query('SELECT COUNT(*) FROM perfiles');
        log.info(`Perfiles configurados: ${perfilCount.rows[0].count}`);
      }
    }
    console.log('');

    // Test de escritura (opcional)
    log.section('✍️  Test de escritura...');
    try {
      await client.query('CREATE TEMP TABLE test_connection (id SERIAL, test_time TIMESTAMP)');
      await client.query('INSERT INTO test_connection (test_time) VALUES (NOW())');
      await client.query('DROP TABLE test_connection');
      log.success('Permisos de escritura: OK');
    } catch (writeError) {
      log.warning('No se pudo realizar el test de escritura');
      log.info(writeError.message);
    }
    console.log('');

    // Resumen final
    log.section('✅ RESUMEN:');
    log.success('La conexión a Supabase está funcionando correctamente');
    console.log('');
    log.info('Próximos pasos:');
    console.log('  1. Si no tienes tablas, ejecuta el schema: database/schema.sql');
    console.log('  2. Inicia el backend: cd backend && npm start');
    console.log('  3. Inicia el frontend: cd frontend && npm start');
    console.log('');

  } catch (error) {
    log.section('❌ ERROR DE CONEXIÓN:');
    log.error(error.message);
    console.log('');

    // Diagnóstico del error
    if (error.message.includes('password authentication failed')) {
      log.warning('El password es incorrecto');
      log.info('Verifica tu DB_PASSWORD en backend/.env');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      log.warning('No se pudo resolver el host');
      log.info('Verifica tu DB_HOST en backend/.env');
      log.info('Debe ser algo como: db.xxxxx.supabase.co');
    } else if (error.message.includes('timeout')) {
      log.warning('La conexión tardó demasiado');
      log.info('Verifica tu conexión a internet');
      log.info('Verifica que el firewall no bloquee el puerto 5432');
    } else if (error.message.includes('SSL')) {
      log.warning('Problema con SSL');
      log.info('Asegúrate de tener DB_SSL=true en backend/.env');
    }
    console.log('');

    // Información de ayuda
    log.section('🆘 Ayuda:');
    console.log('  1. Verifica tus credenciales en: https://app.supabase.com');
    console.log('     Settings > Database > Connection string');
    console.log('');
    console.log('  2. Asegúrate de que backend/.env tenga:');
    console.log('     DB_HOST=db.xxxxx.supabase.co');
    console.log('     DB_PASSWORD=tu_password_de_supabase');
    console.log('     DB_SSL=true');
    console.log('');
    console.log('  3. Consulta la guía completa: GUIA_SUPABASE.md');
    console.log('');

    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar el test
testConnection().catch((error) => {
  console.error('Error inesperado:', error);
  process.exit(1);
});

