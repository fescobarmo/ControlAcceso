// Configuración de la aplicación
const config = {
  // API Configuration - URL actualizada del backend
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://controlacceso-backend-hu4iponzv-fescobarmo-gmailcoms-projects.vercel.app',
  
  // App Configuration
  APP_NAME: 'ControlAcceso',
  APP_VERSION: '1.0.0',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

// Debug de configuración - Mostrar siempre para diagnosticar
console.log('🔧 Configuración de la aplicación:');
console.log('📊 API_BASE_URL:', config.API_BASE_URL);
console.log('🌍 NODE_ENV:', config.NODE_ENV);
console.log('🔍 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🔍 Variables de entorno disponibles:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('🔍 Location:', window.location);
console.log('🔍 User Agent:', navigator.userAgent);
console.log('🔍 Configuración completa:', config);
console.log('🔍 Timestamp:', new Date().toISOString());

export default config;




