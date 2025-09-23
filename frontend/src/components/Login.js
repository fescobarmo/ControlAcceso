import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Person,
  Lock,
  Security,
} from '@mui/icons-material';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('🚀 Iniciando sesión con:', { 
      username: credentials.username 
    });
    
    try {
      // Login tradicional con backend
      console.log('🔐 Usando login tradicional con backend...');
      console.log('📍 Llamando a login function...');
      
      const result = await login(credentials.username, credentials.password);
      
      console.log('📦 Resultado del login:', result);
      
      if (result && result.success) {
        console.log('✅ Login exitoso, redirigiendo...');
        navigate('/dashboard');
      } else {
        const errorMsg = result?.message || 'Error en el inicio de sesión';
        console.error('❌ Login falló:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      setError(error.message || 'Error en el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };




  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: 'white'
    }}>
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <Grid container sx={{ minHeight: '80vh', borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
          
          {/* Panel Izquierdo - Bienvenida */}
          <Grid item xs={12} md={5} sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Formas abstractas de fondo */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              right: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              zIndex: 1
            }} />
            
            {/* Contenido del panel izquierdo */}
            <Box sx={{ zIndex: 2, textAlign: 'center', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                ¡Bueno verte de nuevo!
              </Typography>
              
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                BIENVENIDO
              </Typography>
              
              <Box sx={{ 
                width: 60, 
                height: 3, 
                background: 'white', 
                mx: 'auto', 
                mb: 3,
                borderRadius: 2
              }} />
              
              <Typography variant="body1" sx={{ 
                opacity: 0.9, 
                maxWidth: 300,
                lineHeight: 1.6
              }}>
                Sistema de control de acceso moderno y seguro. 
                Gestiona usuarios, permisos y monitorea accesos 
                de manera eficiente y confiable.
              </Typography>
              
              <Security sx={{ 
                fontSize: 80, 
                mt: 4, 
                opacity: 0.7,
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }} />
            </Box>
          </Grid>

          {/* Panel Derecho - Formulario */}
          <Grid item xs={12} md={7} sx={{
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 6
          }}>
            <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
              <Typography variant="h4" sx={{ 
                color: '#1976d2', 
                fontWeight: 'bold', 
                textAlign: 'center',
                mb: 4
              }}>
                Iniciar Sesión
              </Typography>
              
              {/* Mostrar errores */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  placeholder="Usuario"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  variant="standard"
                  required
                  autoFocus
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'grey.500' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      '&:before': { borderBottom: '1px solid #e0e0e0' },
                      '&:hover:before': { borderBottom: '2px solid #1976d2' },
                      '&:after': { borderBottom: '2px solid #1976d2' }
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  placeholder="Contraseña"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  variant="standard"
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'grey.500' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      '&:before': { borderBottom: '1px solid #e0e0e0' },
                      '&:hover:before': { borderBottom: '2px solid #1976d2' },
                      '&:after': { borderBottom: '2px solid #1976d2' }
                    }
                  }}
                />
                
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                    }
                  }}
                >
                  {loading ? 'Iniciando...' : 'Iniciar Sesión →'}
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    ¿No tienes una cuenta?{' '}
                    <Typography 
                      component="span" 
                      sx={{ 
                        color: '#1976d2', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Registrarse
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
