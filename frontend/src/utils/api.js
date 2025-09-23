import axios from 'axios';
import config from '../config/config';

// Configuración base de axios
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000, // Incrementar timeout para debugging
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Agregar para CORS
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token de autorización si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
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
    return Promise.reject(error);
  }
);

export default api;
