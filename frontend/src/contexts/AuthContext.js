import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener usuario actual al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Configurar el token en el header de autorización
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setError('Error al obtener información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      console.log('🔐 Intentando login con:', { 
        username, 
        apiBaseURL: api.defaults.baseURL,
        timeout: api.defaults.timeout,
        withCredentials: api.defaults.withCredentials,
        headers: api.defaults.headers
      });
      
      // Usar el endpoint de login correcto (sin health check)
      const response = await api.post('/api/auth/login', { username, password });
      
      console.log('📦 Respuesta del servidor:', response);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        console.log('✅ Login exitoso:', user);
        return { success: true };
      } else {
        console.log('❌ Login falló según respuesta del servidor:', response.data);
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('❌ Error completo en login:', {
        message: error.message,
        response: error.response,
        request: error.request,
        status: error.response?.status,
        data: error.response?.data
      });
      const message = error.response?.data?.message || error.message || 'Error en el inicio de sesión';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getCurrentUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
