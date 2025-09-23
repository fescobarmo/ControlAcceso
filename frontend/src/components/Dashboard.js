import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Schedule,
} from '@mui/icons-material';
import api from '../utils/api';

const Dashboard = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: '40,689',
      change: '+8.5%',
      changeType: 'up',
      icon: <People sx={{ color: '#9c27b0' }} />,
      subtitle: 'Desde ayer'
    },
    {
      title: 'Total Accesos',
      value: '10,293',
      change: '+1.3%',
      changeType: 'up',
      icon: <ShoppingCart sx={{ color: '#ff9800' }} />,
      subtitle: 'Desde la semana pasada'
    },
    {
      title: 'Total Ventas',
      value: '$89,000',
      change: '-4.3%',
      changeType: 'down',
      icon: <AttachMoney sx={{ color: '#4caf50' }} />,
      subtitle: 'Desde ayer'
    },
    {
      title: 'Pendientes',
      value: '2,040',
      change: '+1.8%',
      changeType: 'up',
      icon: <Schedule sx={{ color: '#ff5722' }} />,
      subtitle: 'Desde ayer'
    }
  ];

  // Datos por defecto para el mapa de calor (en caso de error)
  const defaultHeatmapData = [
    { hora: '00:00-03:59', lunes: 8, martes: 4, miercoles: 12, jueves: 7, viernes: 15, sabado: 3, domingo: 1 },
    { hora: '04:00-07:59', lunes: 25, martes: 25, miercoles: 26, jueves: 29, viernes: 33, sabado: 11, domingo: 7 },
    { hora: '08:00-11:59', lunes: 189, martes: 201, miercoles: 185, jueves: 210, viernes: 217, sabado: 60, domingo: 45 },
    { hora: '12:00-15:59', lunes: 178, martes: 189, miercoles: 168, jueves: 183, viernes: 200, sabado: 53, domingo: 35 },
    { hora: '16:00-19:59', lunes: 177, martes: 185, miercoles: 173, jueves: 196, viernes: 217, sabado: 55, domingo: 42 },
    { hora: '20:00-23:59', lunes: 51, martes: 61, miercoles: 42, jueves: 68, viernes: 83, sabado: 16, domingo: 11 },
  ];

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 Iniciando fetch de datos del mapa de calor...');
      const response = await api.get('/api/access/heatmap?days=7');
      console.log('📊 Respuesta del mapa de calor:', response.data);
      
      if (response.data && response.data.success) {
        const realData = response.data.data;
        console.log('✅ Datos reales obtenidos:', realData);
        
        // Verificar si hay datos reales
        if (realData && realData.length > 0) {
          // Asegurar que todos los valores sean números y no undefined/null
          const processedData = realData.map(row => {
            const processedRow = { hora: row.hora };
            const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
            
            dias.forEach(dia => {
              // Convertir a número y asegurar que sea 0 si no hay datos
              processedRow[dia] = parseInt(row[dia]) || 0;
            });
            
            return processedRow;
          });
          
          console.log('✅ Datos procesados del mapa de calor:', processedData);
          setHeatmapData(processedData);
        } else {
          console.log('⚠️ No hay datos reales, usando datos por defecto');
          setHeatmapData(defaultHeatmapData);
        }
      } else {
        console.warn('⚠️ Respuesta del mapa de calor sin éxito:', response.data);
        setHeatmapData(defaultHeatmapData);
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos del mapa de calor:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      setError('Error al cargar los datos del mapa de calor. Mostrando datos de ejemplo.');
      setHeatmapData(defaultHeatmapData);
    } finally {
      setLoading(false);
    }
  };

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const diasLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getHeatmapColor = (value) => {
    if (value === 0) return '#f5f5f5';
    if (value <= 20) return '#e3f2fd';
    if (value <= 50) return '#bbdefb';
    if (value <= 100) return '#90caf9';
    if (value <= 150) return '#64b5f6';
    if (value <= 200) return '#42a5f5';
    return '#1976d2';
  };

  return (
    <Layout>
      <Box sx={{ p: 4, width: '100%' }}>
        {/* Título de la página */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 5 }}>
          Dashboard
        </Typography>

        {/* Tarjetas de estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                p: 2.5, 
                height: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: alpha(card.icon.props.sx.color, 0.1) 
                    }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {card.changeType === 'up' ? (
                      <TrendingUp sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                    ) : (
                      <TrendingDown sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: card.changeType === 'up' ? '#4caf50' : '#f44336',
                        fontWeight: 'bold'
                      }}
                    >
                      {card.change}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', ml: 0.5 }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Mapa de calor de accesos - Ancho completo */}
        <Card sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Mapa de Calor - Accesos Registrados (Agrupados cada 4 horas)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Última semana
              </Typography>
            </Box>
          </Box>

          {/* Mensaje de error */}
          {error && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Mapa de calor - Ancho completo sin scroll */}
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'center'
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Encabezados de días */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1, width: '100%', justifyContent: 'center' }}>
                  <Box sx={{ width: 120, flexShrink: 0 }} /> {/* Espacio para las horas */}
                  {diasLabels.map((dia, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 'calc((100% - 120px) / 7)',
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        color: 'grey.700'
                      }}
                    >
                      {dia}
                    </Box>
                  ))}
                </Box>

                {/* Filas del mapa de calor */}
                {heatmapData.map((row, horaIndex) => (
                  <Box key={horaIndex} sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                    {/* Etiqueta de hora */}
                    <Box sx={{
                      width: 120,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      fontSize: '0.875rem',
                      color: 'grey.600',
                      pr: 1,
                      flexShrink: 0
                    }}>
                      {row.hora}
                    </Box>

                    {/* Celdas del mapa de calor */}
                    {dias.map((dia, diaIndex) => (
                      <Box
                        key={diaIndex}
                        sx={{
                          width: 'calc((100% - 120px) / 7)',
                          height: 40,
                          backgroundColor: getHeatmapColor(row[dia]),
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: row[dia] > 100 ? 'white' : 'grey.700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            zIndex: 1
                          }
                        }}
                        title={`${diasLabels[diaIndex]} ${row.hora}: ${row[dia]} accesos`}
                      >
                        {row[dia]}
                      </Box>
                    ))}
                  </Box>
                ))}

                {/* Leyenda */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mt: 3,
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  width: '100%',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                    Leyenda:
                  </Typography>
                  {[
                    { label: '0', color: '#f5f5f5' },
                    { label: '1-20', color: '#e3f2fd' },
                    { label: '21-50', color: '#bbdefb' },
                    { label: '51-100', color: '#90caf9' },
                    { label: '101-150', color: '#64b5f6' },
                    { label: '151-200', color: '#42a5f5' },
                    { label: '200+', color: '#1976d2' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: item.color,
                        border: '1px solid #e0e0e0',
                        borderRadius: 0.5
                      }} />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Card>
      </Box>
    </Layout>
  );
};

export default Dashboard;
