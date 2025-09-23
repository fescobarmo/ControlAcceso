import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  InputAdornment,
  Container,
  Divider,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ExitToApp as ExitIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const Visitas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Modo de prueba para diagnosticar problemas de conexión
  const [testMode, setTestMode] = useState(false);
  
  const [visitas, setVisitas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingVisita, setEditingVisita] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalVisitas, setTotalVisitas] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [fechaFilter, setFechaFilter] = useState('');
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    tipo_documento: 'RUN',
    documento: '',
    departamento: '',
    ingreso_vehiculo: false,
    observaciones: ''
  });

  useEffect(() => {
    // Probar conexión al cargar el componente
    testBackendConnection();
    fetchVisitas();
    fetchEstadisticas();
  }, [page, limit, searchTerm, estadoFilter, fechaFilter]);

  // Función para probar la conexión con el backend
  const testBackendConnection = async () => {
    try {
      console.log('🧪 Probando conexión con el backend...');
      // Probar primero el endpoint directo
      const testResponse = await api.get('/api/test');
      console.log('✅ Test de conexión directo exitoso:', testResponse.data);
      
      // Luego probar el endpoint específico de visitas
      const visitasResponse = await api.get('/api/visitas/test');
      console.log('✅ Test de visitas exitoso:', visitasResponse.data);
      
      setTestMode(false);
      setError(null);
    } catch (error) {
      console.error('❌ Test de conexión falló:', error);
      setTestMode(true);
      
      if (error.response?.status === 404) {
        setError(`Endpoint no encontrado: ${error.config?.url}. Verifique la configuración del backend.`);
      } else {
        setError('Modo de prueba activado - Problemas de conexión detectados');
      }
    }
  };

  const fetchVisitas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando fetch de visitas...');
      console.log('🔗 URL base:', api.defaults.baseURL);
      console.log('🔑 Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
      console.log('🧪 Modo de prueba:', testMode);
      
      const params = new URLSearchParams({
        page: page + 1,
        limit: limit,
        search: searchTerm,
        estado: estadoFilter,
        fecha: fechaFilter
      });

      console.log('📋 Parámetros de búsqueda:', params.toString());
      
      // Usar el endpoint normal
      const endpoint = '/api/visitas';
      const response = await api.get(`${endpoint}?${params}`);
      
      console.log('📊 Respuesta completa del backend:', response);
      console.log('📊 Datos de visitas:', response.data);
      console.log('📊 Paginación:', response.data.pagination);
      
      if (response.data && response.data.success) {
        setVisitas(response.data.data || []);
        setTotalVisitas(response.data.pagination?.total || 0);
        console.log('✅ Visitas cargadas exitosamente:', response.data.data?.length || 0);
      } else {
        console.warn('⚠️ Respuesta del backend sin éxito:', response.data);
        setVisitas([]);
        setTotalVisitas(0);
        setError('El backend no devolvió datos válidos');
      }
    } catch (error) {
      console.error('❌ Error completo en fetchVisitas:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response?.status === 401) {
        setError('Error de autenticación. Por favor, inicie sesión nuevamente.');
        // Redirigir al login si no hay token
        if (!localStorage.getItem('token')) {
          window.location.href = '/login';
        }
      } else if (error.response?.status === 404) {
        setError(`Endpoint no encontrado: ${error.config?.url}. Verifique la configuración del backend.`);
      } else if (error.response?.status >= 500) {
        setError('Error del servidor. Por favor, intente más tarde.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Error de conexión de red. Verifique su conexión a internet.');
      } else {
        setError(`Error al cargar las visitas: ${error.message || 'Error desconocido'}`);
      }
      
      setVisitas([]);
      setTotalVisitas(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Iniciando fetch de estadísticas de visitas...');
      const response = await api.get('/api/visitas/estadisticas');
      console.log('📊 Respuesta de estadísticas de visitas:', response.data);
      
      if (response.data && response.data.success) {
        const data = response.data.data || {};
        console.log('📊 Datos recibidos del backend:', data);
        // Mapear los nombres de propiedades del backend al frontend
        setEstadisticas({
          total_visitas: data.total_visitas || 0,
          visitas_activas: data.visitas_activas || 0,
          visitas_completadas: data.visitas_completadas || 0,
          visitas_canceladas: data.visitas_canceladas || 0
        });
        console.log('✅ Estadísticas de visitas actualizadas:', data);
      } else {
        console.warn('⚠️ Estadísticas de visitas sin éxito:', response.data);
        setEstadisticas({
          total_visitas: 0,
          visitas_activas: 0,
          visitas_completadas: 0,
          visitas_canceladas: 0
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de visitas:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Establecer valores por defecto en caso de error
      setEstadisticas({
        total_visitas: 0,
        visitas_activas: 0,
        visitas_completadas: 0,
        visitas_canceladas: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Función para formatear RUN chileno
  const formatRUN = (run) => {
    if (!run) return '';
    
    // Remover todos los caracteres no numéricos
    const cleanRun = run.replace(/\D/g, '');
    
    if (cleanRun.length < 7) return cleanRun;
    
    // Formatear como XX.XXX.XXX-X
    const formatted = cleanRun.replace(/(\d{1,2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    return formatted;
  };

  // Función para manejar cambios en el documento según el tipo
  const handleDocumentoChange = (e) => {
    const { value } = e.target;
    let formattedValue = value;
    
    if (formData.tipo_documento === 'RUN') {
      formattedValue = formatRUN(value);
    }
    
    setFormData({ ...formData, documento: formattedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validación del lado del cliente
      if (!formData.nombre || !formData.documento || !formData.departamento) {
        throw new Error('Los campos nombre, documento y departamento son obligatorios');
      }
      
      console.log('📝 Enviando datos del formulario:', formData);
      
      let response;
      if (editingVisita) {
        console.log('✏️ Actualizando visita existente:', editingVisita.id);
        response = await api.put(`/api/visitas/${editingVisita.id}`, formData);
        console.log('✅ Respuesta de actualización:', response.data);
        setSnackbar({
          open: true,
          message: 'Visita actualizada exitosamente',
          severity: 'success'
        });
      } else {
        console.log('➕ Creando nueva visita...');
        response = await api.post('/api/visitas', formData);
        console.log('✅ Respuesta de creación:', response.data);
        setSnackbar({
          open: true,
          message: 'Visita registrada exitosamente',
          severity: 'success'
        });
      }
      
      // Limpiar formulario y recargar datos
      setFormData({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        tipo_documento: 'RUN',
        documento: '',
        departamento: '',
        ingreso_vehiculo: false,
        observaciones: ''
      });
      setEditingVisita(null);
      
      // Cerrar el modal
      setOpenModal(false);
      
      // Recargar datos
      await fetchVisitas();
      await fetchEstadisticas();
      
    } catch (error) {
      console.error('❌ Error completo en handleSubmit:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      setError(`Error al ${editingVisita ? 'actualizar' : 'crear'} la visita: ${error.message || 'Error desconocido'}`);
      setSnackbar({
        open: true,
        message: `Error al ${editingVisita ? 'actualizar' : 'crear'} la visita`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visita) => {
    setEditingVisita(visita);
    setFormData({
      nombre: visita.nombre || '',
      apellido_paterno: visita.apellido_paterno || '',
      apellido_materno: visita.apellido_materno || '',
      tipo_documento: visita.tipo_documento || 'RUN',
      documento: visita.documento || '',
      departamento: visita.departamento || '',
      ingreso_vehiculo: visita.ingreso_vehiculo || false,
      observaciones: visita.observaciones || ''
    });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta visita?')) {
      try {
        await api.delete(`/api/visitas/${id}`);
        setSnackbar({
          open: true,
          message: 'Visita eliminada exitosamente',
          severity: 'success'
        });
        fetchVisitas();
        fetchEstadisticas();
      } catch (error) {
        console.error('Error deleting visita:', error);
        setSnackbar({
          open: true,
          message: 'Error al eliminar la visita',
          severity: 'error'
        });
      }
    }
  };

  const handleRegistrarSalida = async (id) => {
    try {
      await api.put(`/api/visitas/${id}/salida`);
      setSnackbar({
        open: true,
        message: 'Salida registrada exitosamente',
        severity: 'success'
      });
      fetchVisitas();
      fetchEstadisticas();
    } catch (error) {
      console.error('Error registering salida:', error);
      setSnackbar({
        open: true,
        message: 'Error al registrar la salida',
        severity: 'error'
      });
    }
  };

  const handleCancelar = async (id) => {
    try {
      await api.put(`/api/visitas/${id}/cancelar`);
      setSnackbar({
        open: true,
        message: 'Visita cancelada exitosamente',
        severity: 'success'
      });
      fetchVisitas();
      fetchEstadisticas();
    } catch (error) {
      console.error('Error canceling visita:', error);
      setSnackbar({
        open: true,
        message: 'Error al cancelar la visita',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      tipo_documento: 'RUN',
      documento: '',
      departamento: '',
      ingreso_vehiculo: false,
      observaciones: ''
    });
    setEditingVisita(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, dateString);
      return '-';
    }
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      ingreso: 'En Ingreso',
      salida: 'Completada',
      cancelada: 'Cancelada'
    };
    return labels[estado] || estado;
  };

  const getEstadoColor = (estado) => {
    const colors = {
      ingreso: 'primary',
      salida: 'success',
      cancelada: 'error'
    };
    return colors[estado] || 'default';
  };

  const handleRefresh = () => {
    fetchVisitas();
    fetchEstadisticas();
  };

  return (
    <Layout>
      <Box sx={{ p: 4, width: '100%' }}>
        {/* Título de la página */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
          <BookIcon sx={{ fontSize: '2rem', mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Libro de Visitas
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: -2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '70%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    {loadingStats ? (
                      <CircularProgress size={24} sx={{ color: theme.palette.primary.main, mb: 0.5 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.primary.main }}>
                        {estadisticas.total_visitas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Total de Visitas
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                  }}>
                    <BookIcon sx={{ color: theme.palette.primary.main, fontSize: '1.75rem' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '70%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    {loadingStats ? (
                      <CircularProgress size={24} sx={{ color: theme.palette.success.main, mb: 0.5 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.success.main }}>
                        {estadisticas.visitas_activas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Visitas Activas
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.success.main, 0.1) 
                  }}>
                    <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: '1.75rem' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '70%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    {loadingStats ? (
                      <CircularProgress size={24} sx={{ color: theme.palette.warning.main, mb: 0.5 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.warning.main }}>
                        {estadisticas.visitas_completadas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Visitas Completadas
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.warning.main, 0.1) 
                  }}>
                    <ExitToAppIcon sx={{ color: theme.palette.warning.main, fontSize: '1.75rem' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              height: '70%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    {loadingStats ? (
                      <CircularProgress size={24} sx={{ color: theme.palette.error.main, mb: 0.5 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.error.main }}>
                        {estadisticas.visitas_canceladas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Visitas Canceladas
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.error.main, 0.1) 
                  }}>
                    <CancelIcon sx={{ color: theme.palette.error.main, fontSize: '1.75rem' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y búsqueda */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              Filtros y Búsqueda
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap' }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre, documento o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: '200px',
                flex: '1 1 auto',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                },
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: '150px', flex: '0 0 auto' }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                label="Estado"
                sx={{
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.grey[300],
                  },
                }}
              >
                <MenuItem value="todos">Todos los Estados</MenuItem>
                <MenuItem value="ingreso">En Ingreso</MenuItem>
                <MenuItem value="salida">Completadas</MenuItem>
                <MenuItem value="cancelada">Canceladas</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              size="small"
              type="date"
              value={fechaFilter}
              onChange={(e) => setFechaFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: '150px',
                flex: '0 0 auto',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                },
              }}
            />
            
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenModal(true);
              }}
              sx={{
                borderRadius: 1,
                py: 0.5,
                px: 2,
                fontWeight: 'bold',
                boxShadow: theme.shadows[1],
                fontSize: '0.8rem',
                flex: '0 0 auto',
                '&:hover': {
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              Nueva Visita
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ 
                borderRadius: 1, 
                fontSize: '0.8rem',
                flex: '0 0 auto',
                ml: 'auto'
              }}
            >
              Actualizar
            </Button>
          </Box>
        </Paper>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Indicador de modo de prueba */}
        {testMode && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography>
                🧪 <strong>Modo de Prueba Activado</strong> - Usando rutas temporales sin autenticación
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={testBackendConnection}
                sx={{ ml: 2 }}
              >
                Probar Conexión
              </Button>
            </Box>
          </Alert>
        )}

        {/* Tabla de visitas */}
        <Paper sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden', mb: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}>Nombre Completo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>Tipo y Número de Documento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Departamento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>Vehículo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Fecha Ingreso</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Fecha Salida</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Observaciones</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visitas.map((visita) => (
                  <TableRow key={visita.id} hover sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {visita.nombre} {visita.apellido_paterno} {visita.apellido_materno}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${visita.tipo_documento || 'RUN'} ${visita.documento}`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {visita.departamento}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={visita.ingreso_vehiculo ? 'Sí' : 'No'} 
                        size="small" 
                        color={visita.ingreso_vehiculo ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatDate(visita.fecha_ingreso)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {visita.fecha_salida ? formatDate(visita.fecha_salida) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getEstadoLabel(visita.estado)} 
                        size="small" 
                        color={getEstadoColor(visita.estado)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {visita.observaciones || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {visita.estado === 'ingreso' && (
                          <IconButton
                            size="small"
                            onClick={() => handleRegistrarSalida(visita.id)}
                            sx={{ 
                              color: theme.palette.success.main,
                              '&:hover': { bgcolor: theme.palette.success.light + '20' }
                            }}
                            title="Registrar Salida"
                          >
                            <ExitIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(visita)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.light + '20' }
                          }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(visita.id)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': { bgcolor: theme.palette.error.light + '20' }
                          }}
                          title="Eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {visitas.length === 0 && !loading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron visitas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Intenta ajustar los filtros o crear una nueva visita
              </Typography>
            </Box>
          )}
          
          <TablePagination
            component="div"
            count={totalVisitas}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </Paper>

        {/* Modal para nueva/editar visita */}
        <Dialog 
          open={openModal} 
          onClose={() => setOpenModal(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main, 
            color: 'white',
            fontWeight: 'bold'
          }}>
            {editingVisita ? 'Editar Visita' : 'Nueva Visita'}
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Nombre" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                  required 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Apellido Paterno" 
                  value={formData.apellido_paterno} 
                  onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Apellido Materno" 
                  value={formData.apellido_materno} 
                  onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={formData.tipo_documento}
                    onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                    label="Tipo de Documento"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="RUN">RUN</MenuItem>
                    <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                    <MenuItem value="DNI">DNI</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Documento de Identidad" 
                  value={formData.documento} 
                  onChange={handleDocumentoChange}
                  required 
                  placeholder={formData.tipo_documento === 'RUN' ? '12.345.678-9' : 'Número de documento'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Departamento que visita" 
                  value={formData.departamento} 
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })} 
                  required 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.ingreso_vehiculo}
                      onChange={(e) => setFormData({ ...formData, ingreso_vehiculo: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Ingreso con vehículo"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Observaciones" 
                  value={formData.observaciones} 
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} 
                  multiline 
                  rows={3} 
                  placeholder="Observaciones adicionales..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setOpenModal(false)}
              variant="outlined"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading || !formData.nombre || !formData.documento || !formData.departamento}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 'bold',
                boxShadow: theme.shadows[2]
              }}
            >
              {loading ? 'Guardando...' : (editingVisita ? 'Actualizar' : 'Registrar') + ' Visita'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Visitas;


