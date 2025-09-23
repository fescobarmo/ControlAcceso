const axios = require('axios');

// Configuración exacta del frontend
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    console.log('📊 Base URL:', config.baseURL);
    console.log('📦 Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    console.error('❌ Error completo:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request
    });
    return Promise.reject(error);
  }
);

// Función de login
async function testLogin() {
  try {
    console.log('🔐 Iniciando prueba de login...');
    console.log('📊 Configuración:', {
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout,
      withCredentials: api.defaults.withCredentials
    });
    
    const response = await api.post('/api/auth/login-simple', { 
      username: 'admin', 
      password: 'admin123' 
    });
    
    console.log('✅ Login exitoso:', response.data);
    return { success: true };
  } catch (error) {
    console.error('❌ Error en login:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    return { success: false, error: error.message };
  }
}

// Ejecutar prueba
testLogin().then(result => {
  console.log('🎯 Resultado final:', result);
  process.exit(result.success ? 0 : 1);
});


