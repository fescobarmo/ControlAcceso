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
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const VisitaExterna = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [visitasExternas, setVisitasExternas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingVisita, setEditingVisita] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalVisitasExternas, setTotalVisitasExternas] = useState(0);
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
    apellido: '',
    tipo_documento: 'RUN',
    documento: '',
    empresa: '',
    motivo: '',
    ubicacion_destino: '',
    telefono: '',
    email: '',
    ingreso_vehiculo: false,
    placa: '',
    tipo_visita: '',
    requiere_autorizacion: false,
    autorizacion_nombre: '',
    autorizacion_tipo: '',
    requiere_equipamiento: false,
    observaciones: ''
  });

  useEffect(() => {
    fetchVisitasExternas();
    fetchEstadisticas();
  }, [page, limit, searchTerm, estadoFilter, fechaFilter]);

  const fetchVisitasExternas = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page + 1, // El backend espera páginas basadas en 1
        limit: limit,
        search: searchTerm,
        estado: estadoFilter,
        fecha: fechaFilter
      });

      const response = await api.get(`/api/visitas-externas?${params}`);
      setVisitasExternas(response.data.data);
      setTotalVisitasExternas(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching visitas externas:', error);
      setError('Error al cargar las visitas externas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Iniciando fetch de estadísticas de visitas externas...');
      const response = await api.get('/api/visitas-externas/estadisticas');
      console.log('📊 Respuesta de estadísticas de visitas externas:', response.data);
      
      if (response.data && response.data.success) {
        const data = response.data.data || {};
        console.log('📊 Datos recibidos del backend:', data);
        // Mapear los nombres de propiedades del backend al frontend
        setEstadisticas({
          total_visitas_externas: data.total_visitas || 0,
          visitas_externas_activas: data.visitas_activas || 0,
          visitas_externas_completadas: data.visitas_completadas || 0,
          visitas_externas_canceladas: data.visitas_canceladas || 0
        });
        console.log('✅ Estadísticas de visitas externas actualizadas:', data);
      } else {
        console.warn('⚠️ Estadísticas de visitas externas sin éxito:', response.data);
        setEstadisticas({
          total_visitas_externas: 0,
          visitas_externas_activas: 0,
          visitas_externas_completadas: 0,
          visitas_externas_canceladas: 0
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de visitas externas:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Establecer valores por defecto en caso de error
      setEstadisticas({
        total_visitas_externas: 0,
        visitas_externas_activas: 0,
        visitas_externas_completadas: 0,
        visitas_externas_canceladas: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Enviando datos del formulario:', formData);
      
      if (editingVisita) {
        await api.put(`/api/visitas-externas/${editingVisita.id}`, formData);
        console.log('✅ Visita externa actualizada exitosamente');
        setSnackbar({
          open: true,
          message: 'Visita externa actualizada exitosamente',
          severity: 'success'
        });
      } else {
        const response = await api.post('/api/visitas-externas', formData);
        console.log('✅ Visita externa creada exitosamente:', response.data);
        setSnackbar({
          open: true,
          message: 'Visita externa registrada exitosamente',
          severity: 'success'
        });
      }
      
      // Cerrar el modal y limpiar formulario
      setOpenModal(false);
      resetForm();
      
      // Recargar datos
      await fetchVisitasExternas();
      await fetchEstadisticas();
      
      console.log('✅ Datos actualizados correctamente');
    } catch (error) {
      console.error('❌ Error saving visita externa:', error);
      setError('Error al guardar la visita externa. Por favor, intente nuevamente.');
      setSnackbar({
        open: true,
        message: 'Error al guardar la visita externa',
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
      apellido: visita.apellido || '',
      tipo_documento: visita.tipo_documento || 'RUN',
      documento: visita.documento || '',
      empresa: visita.empresa || '',
      motivo: visita.motivo || '',
      ubicacion_destino: visita.ubicacion_destino || '',
      telefono: visita.telefono || '',
      email: visita.email || '',
      ingreso_vehiculo: visita.ingreso_vehiculo || false,
      placa: visita.placa || '',
      tipo_visita: visita.tipo_visita || '',
      requiere_autorizacion: visita.requiere_autorizacion || false,
      autorizacion_nombre: visita.autorizacion_nombre || '',
      autorizacion_tipo: visita.autorizacion_tipo || '',
      requiere_equipamiento: visita.requiere_equipamiento || false,
      observaciones: visita.observaciones || ''
    });
    setOpenModal(true);
  };

  const handleRegistrarSalida = async (visita) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚪 Registrando salida para visita externa:', visita.id);
      
      const response = await api.put(`/api/visitas-externas/${visita.id}/salida`);
      console.log('✅ Salida registrada exitosamente:', response.data);
      
      setSnackbar({
        open: true,
        message: 'Salida registrada exitosamente',
        severity: 'success'
      });
      
      // Recargar datos
      await fetchVisitasExternas();
      await fetchEstadisticas();
      
    } catch (error) {
      console.error('❌ Error registrando salida:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error registrando salida',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (visita) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('❌ Cancelando visita externa:', visita.id);
      
      const response = await api.put(`/api/visitas-externas/${visita.id}/cancelar`);
      console.log('✅ Visita externa cancelada exitosamente:', response.data);
      
      setSnackbar({
        open: true,
        message: 'Visita externa cancelada exitosamente',
        severity: 'success'
      });
      
      // Recargar datos
      await fetchVisitasExternas();
      await fetchEstadisticas();
      
    } catch (error) {
      console.error('❌ Error cancelando visita externa:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error cancelando visita externa',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (visita) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Eliminando visita externa:', visita.id);
      
      const response = await api.delete(`/api/visitas-externas/${visita.id}`);
      console.log('✅ Visita externa eliminada exitosamente:', response.data);
      
      setSnackbar({
        open: true,
        message: 'Visita externa eliminada exitosamente',
        severity: 'success'
      });
      
      // Recargar datos
      await fetchVisitasExternas();
      await fetchEstadisticas();
      
    } catch (error) {
      console.error('❌ Error eliminando visita externa:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error eliminando visita externa',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      tipo_documento: 'RUN',
      documento: '',
      empresa: '',
      motivo: '',
      ubicacion_destino: '',
      telefono: '',
      email: '',
      ingreso_vehiculo: false,
      placa: '',
      tipo_visita: '',
      requiere_autorizacion: false,
      autorizacion_nombre: '',
      autorizacion_tipo: '',
      requiere_equipamiento: false,
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

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ingreso':
        return 'success';
      case 'salida':
        return 'warning';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'ingreso':
        return 'En Instalación';
      case 'salida':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado || 'Desconocido';
    }
  };

  const handleRefresh = () => {
    fetchVisitasExternas();
    fetchEstadisticas();
  };

  // Función para formatear RUN chileno
  const formatRUN = (run) => {
    if (!run) return '';
    
    // Remover todos los caracteres no numéricos excepto la K
    const cleanRun = run.replace(/[^0-9Kk]/g, '');
    
    if (cleanRun.length < 7) return cleanRun;
    
    // Formatear como XXXXXXXX-X
    const formatted = cleanRun.replace(/(\d{8})([Kk\d])/, '$1-$2');
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setEstadoFilter('todos');
    setFechaFilter('');
    setPage(1);
  };

  return (
    <Layout>
      <Box sx={{ p: 4, width: '100%' }}>
        {/* Título de la página */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
          <BusinessIcon sx={{ fontSize: '2rem', mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Visitas Externas
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
                        {estadisticas.total_visitas_externas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Total de Visitas Externas
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                  }}>
                    <BusinessIcon sx={{ color: theme.palette.primary.main, fontSize: '1.75rem' }} />
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
                        {estadisticas.visitas_externas_activas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Visitas Externas Activas
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
                        {estadisticas.visitas_externas_completadas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Visitas Externas Completadas
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
                        {estadisticas.visitas_externas_canceladas || 0}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Visitas Externas Canceladas
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
              placeholder="Buscar por nombre, documento o empresa..."
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
              Nueva Visita Externa
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

        {/* Tabla de visitas externas */}
        <Paper sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden', mb: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}>Nombre Completo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>Tipo y Número de Documento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Empresa</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>Vehículo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Fecha Ingreso</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Fecha Salida</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Observaciones</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Skeleton loading
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                    </TableRow>
                  ))
                ) : visitasExternas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron visitas externas
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visitasExternas.map((visita) => (
                    <TableRow key={visita.id} hover sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {visita.nombre} {visita.apellido}
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
                          {visita.empresa || 'N/A'}
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
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(visita)}
                            sx={{ 
                              color: theme.palette.primary.main,
                              '&:hover': { bgcolor: theme.palette.primary.light + '20' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          
                          {/* Botón de Salida - solo si está en ingreso */}
                          {visita.estado === 'ingreso' && (
                            <IconButton
                              size="small"
                              onClick={() => handleRegistrarSalida(visita)}
                              sx={{ 
                                color: theme.palette.warning.main,
                                '&:hover': { bgcolor: theme.palette.warning.light + '20' }
                              }}
                              title="Registrar Salida"
                            >
                              <ExitToAppIcon fontSize="small" />
                            </IconButton>
                          )}
                          
                          {/* Botón de Cancelar - solo si está en ingreso */}
                          {visita.estado === 'ingreso' && (
                            <IconButton
                              size="small"
                              onClick={() => handleCancelar(visita)}
                              sx={{ 
                                color: theme.palette.error.main,
                                '&:hover': { bgcolor: theme.palette.error.light + '20' }
                              }}
                              title="Cancelar Visita"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          )}
                          
                          {/* Botón de Eliminar - siempre disponible */}
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (window.confirm('¿Está seguro de que desea eliminar esta visita externa?')) {
                                handleDelete(visita);
                              }
                            }}
                            sx={{ 
                              color: theme.palette.error.main,
                              '&:hover': { bgcolor: theme.palette.error.light + '20' }
                            }}
                            title="Eliminar Visita"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {visitasExternas.length === 0 && !loading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron visitas externas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Intenta ajustar los filtros o crear una nueva visita externa
              </Typography>
            </Box>
          )}
          
          <TablePagination
            component="div"
            count={totalVisitasExternas}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(event) => {
              setLimit(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </Paper>

        {/* Modal para nueva/editar visita externa */}
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
            {editingVisita ? 'Editar Visita Externa' : 'Nueva Visita Externa'}
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
                  label="Apellido" 
                  value={formData.apellido} 
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} 
                  required 
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
                  placeholder={formData.tipo_documento === 'RUN' ? '12345678-9' : 'Número de documento'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Empresa" 
                  value={formData.empresa} 
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} 
                  required 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Motivo de la Visita" 
                  value={formData.motivo} 
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} 
                  required 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Ubicación de Destino" 
                  value={formData.ubicacion_destino} 
                  onChange={(e) => setFormData({ ...formData, ubicacion_destino: e.target.value })} 
                  required 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Teléfono" 
                  value={formData.telefono} 
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Email" 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
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
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Placa" 
                  value={formData.placa} 
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })} 
                  disabled={!formData.ingreso_vehiculo}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Visita</InputLabel>
                  <Select
                    value={formData.tipo_visita}
                    onChange={(e) => setFormData({ ...formData, tipo_visita: e.target.value })}
                    label="Tipo de Visita"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="comercial">Comercial</MenuItem>
                    <MenuItem value="tecnica">Técnica</MenuItem>
                    <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                    <MenuItem value="entrega">Entrega</MenuItem>
                    <MenuItem value="otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requiere_autorizacion}
                      onChange={(e) => setFormData({ ...formData, requiere_autorizacion: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Requiere autorización"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Nombre de quien autoriza" 
                  value={formData.autorizacion_nombre} 
                  onChange={(e) => setFormData({ ...formData, autorizacion_nombre: e.target.value })} 
                  disabled={!formData.requiere_autorizacion}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de autorización</InputLabel>
                  <Select
                    value={formData.autorizacion_tipo}
                    onChange={(e) => setFormData({ ...formData, autorizacion_tipo: e.target.value })}
                    label="Tipo de autorización"
                    disabled={!formData.requiere_autorizacion}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="propietario">Propietario/Arrendatario</MenuItem>
                    <MenuItem value="administrativo">Personal Administrativo</MenuItem>
                    <MenuItem value="otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requiere_equipamiento}
                      onChange={(e) => setFormData({ ...formData, requiere_equipamiento: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Requiere equipamiento"
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
                  placeholder={formData.requiere_equipamiento ? "Observaciones adicionales... (Incluir equipamiento entregado)" : "Observaciones adicionales..."}
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
              disabled={!formData.nombre || !formData.apellido || !formData.documento || !formData.empresa || !formData.motivo || !formData.ubicacion_destino}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 'bold',
                boxShadow: theme.shadows[2]
              }}
            >
              {editingVisita ? 'Actualizar' : 'Registrar'} Visita Externa
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

export default VisitaExterna;


