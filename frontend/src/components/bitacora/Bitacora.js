import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { logAuditEvent, AUDIT_EVENTS } from '../../utils/audit';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Skeleton,
  TablePagination,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const Bitacora = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Estados
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados de paginación y filtros
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalEventos, setTotalEventos] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterNivel, setFilterNivel] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'general',
    nivel: 'info',
    ubicacion: '',
    responsable: '',
    observaciones: ''
  });

  // Tipos de eventos
  const tiposEventos = [
    { value: 'general', label: 'General' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'visita', label: 'Visita' },
    { value: 'acceso', label: 'Acceso' },
    { value: 'incidente', label: 'Incidente' },
    { value: 'sistema', label: 'Sistema' }
  ];

  // Niveles de eventos
  const nivelesEventos = [
    { value: 'info', label: 'Información', color: 'info' },
    { value: 'warning', label: 'Advertencia', color: 'warning' },
    { value: 'error', label: 'Error', color: 'error' },
    { value: 'success', label: 'Éxito', color: 'success' }
  ];

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total_eventos: 0,
    eventos_hoy: 0,
    eventos_seguridad: 0,
    eventos_incidentes: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    // Verificar autenticación antes de cargar datos
    const token = localStorage.getItem('token');
    console.log('🔑 Estado de autenticación:', token ? 'Autenticado' : 'No autenticado');
    
    if (token) {
      fetchBitacora();
      fetchEstadisticas();
    } else {
      console.warn('⚠️ Usuario no autenticado, no se pueden cargar los datos');
      setError('Usuario no autenticado');
    }
  }, [page, limit, searchTerm, filterTipo, filterNivel]);

  // Función para cargar la bitácora
  const fetchBitacora = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Iniciando fetch de bitácora...');
      console.log('🔑 Token en localStorage:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterTipo) params.append('tipo', filterTipo);
      if (filterNivel) params.append('nivel', filterNivel);

      console.log('📊 Parámetros de búsqueda:', params.toString());
      const response = await api.get(`/api/bitacora?${params}`);
      console.log('📊 Respuesta de bitácora:', response.data);
      
      if (response.data.success) {
        setBitacora(response.data.data || []);
        setTotalEventos(response.data.pagination?.total || 0);
        console.log('✅ Bitácora cargada exitosamente:', response.data.data?.length || 0, 'eventos');
      } else {
        console.warn('⚠️ Bitácora sin éxito:', response.data);
        setBitacora([]);
        setTotalEventos(0);
      }
    } catch (error) {
      console.error('❌ Error fetching bitacora:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      setError('Error al cargar la bitácora');
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cargar la bitácora',
        severity: 'error'
      });
      
      // Establecer valores por defecto en caso de error
      setBitacora([]);
      setTotalEventos(0);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar estadísticas
  const fetchEstadisticas = async () => {
    try {
      console.log('📊 Iniciando fetch de estadísticas de bitácora...');
      const response = await api.get('/api/bitacora/estadisticas');
      console.log('📊 Respuesta de estadísticas:', response.data);
      
      if (response.data.success) {
        setEstadisticas(response.data.data || {});
        console.log('✅ Estadísticas cargadas exitosamente');
      } else {
        console.warn('⚠️ Estadísticas sin éxito:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching estadisticas:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
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

  // Función para obtener el icono del tipo de evento
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'seguridad':
        return <SecurityIcon fontSize="small" />;
      case 'mantenimiento':
        return <BusinessIcon fontSize="small" />;
      case 'visita':
        return <EventIcon fontSize="small" />;
      case 'acceso':
        return <SecurityIcon fontSize="small" />;
      case 'incidente':
        return <WarningIcon fontSize="small" />;
      case 'sistema':
        return <InfoIcon fontSize="small" />;
      default:
        return <EventIcon fontSize="small" />;
    }
  };

  // Función para obtener el color del nivel
  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  // Función para obtener el icono del nivel
  const getNivelIcon = (nivel) => {
    switch (nivel) {
      case 'info':
        return <InfoIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      case 'success':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  // Función para limpiar formulario
  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'general',
      nivel: 'info',
      ubicacion: '',
      responsable: '',
      observaciones: ''
    });
    setEditingEvento(null);
  };

  // Función para abrir modal de edición
  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      tipo: evento.tipo || 'general',
      nivel: evento.nivel || 'info',
      ubicacion: evento.ubicacion || '',
      responsable: evento.responsable || '',
      observaciones: evento.observaciones || ''
    });
    setOpenModal(true);
  };

  // Función para eliminar evento
  const handleDelete = async (evento) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Eliminando evento de bitácora:', evento.id);
      
      const response = await api.delete(`/api/bitacora/${evento.id}`);
      console.log('✅ Evento eliminado exitosamente:', response.data);
      
      setSnackbar({
        open: true,
        message: 'Evento eliminado exitosamente',
        severity: 'success'
      });
      
      // Recargar datos
      await fetchBitacora();
      await fetchEstadisticas();
      
    } catch (error) {
      console.error('❌ Error eliminando evento:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error eliminando evento',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar formulario
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Enviando datos del formulario:', formData);
      
      if (editingEvento) {
        await api.put(`/api/bitacora/${editingEvento.id}`, formData);
        console.log('✅ Evento actualizado exitosamente');
        setSnackbar({
          open: true,
          message: 'Evento actualizado exitosamente',
          severity: 'success'
        });
      } else {
        const response = await api.post('/api/bitacora', formData);
        console.log('✅ Evento creado exitosamente:', response.data);
        setSnackbar({
          open: true,
          message: 'Evento registrado exitosamente',
          severity: 'success'
        });
      }
      
      // Cerrar el modal y limpiar formulario
      setOpenModal(false);
      resetForm();
      
      // Recargar datos
      await fetchBitacora();
      await fetchEstadisticas();
      
      console.log('✅ Datos actualizados correctamente');
    } catch (error) {
      console.error('❌ Error saving evento:', error);
      setError('Error al guardar el evento. Por favor, intente nuevamente.');
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al guardar el evento',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 4, width: '100%' }}>
        {/* Título de la página */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 2, fontSize: '2rem', color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Bitácora de Eventos
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => {
              fetchBitacora();
              fetchEstadisticas();
            }}
            sx={{ 
              borderRadius: 1, 
              fontSize: '0.8rem'
            }}
          >
            Actualizar
          </Button>
        </Box>

        {/* Tarjetas de estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.primary.main }}>
                      {estadisticas.total_eventos || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Total de Eventos
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                  }}>
                    <EventIcon sx={{ color: theme.palette.primary.main, fontSize: '1.75rem' }} />
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.success.main }}>
                      {estadisticas.eventos_hoy || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Eventos Hoy
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.warning.main }}>
                      {estadisticas.eventos_seguridad || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Eventos de Seguridad
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.warning.main, 0.1) 
                  }}>
                    <SecurityIcon sx={{ color: theme.palette.warning.main, fontSize: '1.75rem' }} />
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.error.main }}>
                      {estadisticas.eventos_incidentes || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Incidentes
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.error.main, 0.1) 
                  }}>
                    <WarningIcon sx={{ color: theme.palette.error.main, fontSize: '1.75rem' }} />
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
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'grey.500' }} />
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Evento</InputLabel>
                <Select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  label="Tipo de Evento"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los tipos</MenuItem>
                  {tiposEventos.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Nivel</InputLabel>
                <Select
                  value={filterNivel}
                  onChange={(e) => setFilterNivel(e.target.value)}
                  label="Nivel"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los niveles</MenuItem>
                  {nivelesEventos.map((nivel) => (
                    <MenuItem key={nivel.value} value={nivel.value}>
                      {nivel.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetForm();
                  setOpenModal(true);
                }}
                sx={{ 
                  borderRadius: 2,
                  height: 40,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Nuevo Evento
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de eventos */}
        <Paper sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden', mb: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}>Usuario</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Acción</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>Perfil</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>Fecha y Hora</TableCell>
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
                    </TableRow>
                  ))
                ) : bitacora.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron eventos en la bitácora
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bitacora.map((evento) => (
                    <TableRow key={evento.id} hover sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {evento.user ? `${evento.user.nombre || ''} ${evento.user.apellido || ''}`.trim() || evento.user.username : 'Sistema'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {evento.accion || 'Evento de Sistema'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={evento.user?.profile?.nombre || 'Sin perfil'} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatDate(evento.timestamp || evento.fecha_creacion)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(evento)}
                            sx={{ 
                              color: theme.palette.primary.main,
                              '&:hover': { bgcolor: theme.palette.primary.light + '20' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (window.confirm('¿Está seguro de que desea eliminar este evento?')) {
                                handleDelete(evento);
                              }
                            }}
                            sx={{ 
                              color: theme.palette.error.main,
                              '&:hover': { bgcolor: theme.palette.error.light + '20' }
                            }}
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
          
          {bitacora.length === 0 && !loading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron eventos en la bitácora
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Intenta ajustar los filtros o crear un nuevo evento
              </Typography>
            </Box>
          )}
          
          <TablePagination
            component="div"
            count={totalEventos}
            page={page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            rowsPerPage={limit}
            onRowsPerPageChange={(event) => {
              setLimit(parseInt(event.target.value, 10));
              setPage(1);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </Paper>

        {/* Modal para nuevo/editar evento */}
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
            {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Título del Evento" 
                  value={formData.titulo} 
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} 
                  required 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Descripción" 
                  value={formData.descripcion} 
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                  multiline
                  rows={3}
                  required 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Evento</InputLabel>
                  <Select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    label="Tipo de Evento"
                    sx={{ borderRadius: 2 }}
                  >
                    {tiposEventos.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Nivel</InputLabel>
                  <Select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    label="Nivel"
                    sx={{ borderRadius: 2 }}
                  >
                    {nivelesEventos.map((nivel) => (
                      <MenuItem key={nivel.value} value={nivel.value}>
                        {nivel.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Ubicación" 
                  value={formData.ubicacion} 
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Responsable" 
                  value={formData.responsable} 
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })} 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Observaciones" 
                  value={formData.observaciones} 
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} 
                  multiline
                  rows={2}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenModal(false)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !formData.titulo || !formData.descripcion}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              {loading ? 'Guardando...' : (editingEvento ? 'Actualizar' : 'Guardar')}
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

export default Bitacora;

