import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  Snackbar,
  InputAdornment,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Person,
  Home,
  Phone,
  Email,
  LocationOn,
  Car,
  Pets,
  CheckCircle as CheckCircleIcon,
  Block,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const Residente = () => {
  const theme = useTheme();
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingResidente, setEditingResidente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [estadisticas, setEstadisticas] = useState({});

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    tipo_documento: 'RUN',
    documento: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    direccion_residencia: '',
    numero_residencia: '',
    tipo_residencia: 'departamento',
    fecha_ingreso: '',
    estado: 'activo',
    tipo_residente: 'propietario',
    vehiculos: [],
    mascotas: [],
    ocupantes: [],
    observaciones: ''
  });

  useEffect(() => {
    fetchResidentes();
    fetchEstadisticas();
  }, []);

  const fetchResidentes = async () => {
    try {
      setLoading(true);
      console.log('📋 Iniciando fetch de residentes...');
      const response = await api.get('/api/residentes');
      console.log('📋 Respuesta de residentes:', response.data);
      
      if (response.data && response.data.success) {
        const residentesData = response.data.data?.residentes || response.data.data || [];
        setResidentes(Array.isArray(residentesData) ? residentesData : []);
        console.log('✅ Residentes cargados:', residentesData);
      } else {
        console.warn('⚠️ Respuesta de residentes sin éxito:', response.data);
        setResidentes([]);
      }
    } catch (error) {
      console.error('❌ Error obteniendo residentes:', error);
      setError('Error al cargar los residentes');
      setResidentes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Iniciando fetch de estadísticas de residentes...');
      const response = await api.get('/api/residentes/estadisticas');
      console.log('📊 Respuesta de estadísticas de residentes:', response.data);
      
      if (response.data && response.data.success) {
        const data = response.data.data || {};
        console.log('📊 Datos recibidos del backend:', data);
        setEstadisticas({
          total_residentes: data.total_residentes || 0,
          residentes_activos: data.residentes_activos || 0,
          propietarios: data.propietarios || 0,
          arrendatarios: data.arrendatarios || 0,
          residentes_hoy: data.residentes_hoy || 0
        });
        console.log('✅ Estadísticas de residentes actualizadas:', data);
      } else {
        console.warn('⚠️ Estadísticas de residentes sin éxito:', response.data);
        setEstadisticas({
          total_residentes: 0,
          residentes_activos: 0,
          propietarios: 0,
          arrendatarios: 0,
          residentes_hoy: 0
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de residentes:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      console.error('❌ Status del error:', error.response?.status);
      setEstadisticas({
        total_residentes: 0,
        residentes_activos: 0,
        propietarios: 0,
        arrendatarios: 0,
        residentes_hoy: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 Enviando datos del formulario:', formData);
      
      let response;
      if (editingResidente) {
        console.log('✏️ Actualizando residente existente:', editingResidente.id);
        response = await api.put(`/api/residentes/${editingResidente.id}`, formData);
        console.log('✅ Respuesta de actualización:', response.data);
        setSnackbar({
          open: true,
          message: 'Residente actualizado exitosamente',
          severity: 'success'
        });
      } else {
        console.log('➕ Creando nuevo residente...');
        response = await api.post('/api/residentes', formData);
        console.log('✅ Respuesta de creación:', response.data);
        setSnackbar({
          open: true,
          message: 'Residente creado exitosamente',
          severity: 'success'
        });
      }
      
      if (response.data && response.data.success) {
        setOpenModal(false);
        resetForm();
        fetchResidentes();
        fetchEstadisticas();
      }
    } catch (error) {
      console.error('❌ Error en operación:', error);
      setError(error.response?.data?.message || 'Error en la operación');
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error en la operación',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este residente?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.delete(`/api/residentes/${id}`);
      
      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Residente eliminado exitosamente',
          severity: 'success'
        });
        fetchResidentes();
        fetchEstadisticas();
      }
    } catch (error) {
      console.error('❌ Error eliminando residente:', error);
      setSnackbar({
        open: true,
        message: 'Error eliminando residente',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (residente) => {
    setEditingResidente(residente);
    setFormData({
      nombre: residente.nombre || '',
      apellido_paterno: residente.apellidoPaterno || '',
      apellido_materno: residente.apellidoMaterno || '',
      tipo_documento: residente.tipoDocumento || 'RUN',
      documento: residente.documento || '',
      fecha_nacimiento: residente.fecha_nacimiento || '',
      telefono: residente.telefono || '',
      email: residente.email || '',
      direccion_residencia: residente.direccionResidencia || '',
      numero_residencia: residente.numeroResidencia || '',
      tipo_residencia: residente.tipoResidencia || 'departamento',
      fecha_ingreso: residente.fecha_ingreso || '',
      estado: residente.estado || 'activo',
      tipo_residente: residente.tipoResidente || 'propietario',
      vehiculos: residente.vehiculos || [],
      mascotas: residente.mascotas || [],
      ocupantes: residente.ocupantes || [],
      observaciones: residente.observaciones || ''
    });
    setOpenModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      tipo_documento: 'RUN',
      documento: '',
      fecha_nacimiento: '',
      telefono: '',
      email: '',
      direccion_residencia: '',
      numero_residencia: '',
      tipo_residencia: 'departamento',
      fecha_ingreso: '',
      estado: 'activo',
      tipo_residente: 'propietario',
      vehiculos: [],
      mascotas: [],
      ocupantes: [],
      observaciones: ''
    });
    setEditingResidente(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const getTipoResidenteColor = (tipo) => {
    switch (tipo) {
      case 'propietario': return 'primary';
      case 'arrendatario': return 'secondary';
      case 'familiar': return 'info';
      default: return 'default';
    }
  };

  const filteredResidentes = residentes.filter(residente => {
    const matchesSearch = 
      residente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residente.apellidoPaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residente.documento?.includes(searchTerm) ||
      residente.direccionResidencia?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = !filterEstado || residente.estado === filterEstado;
    
    return matchesSearch && matchesEstado;
  });

  if (loading && residentes.length === 0) {
    return (
      <Layout>
        <Box sx={{ p: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 4, width: '100%' }}>
        {/* Título de la página */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ fontSize: '2rem', mr: 2, color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              Gestión de Residentes
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchEstadisticas}
            disabled={loadingStats}
            sx={{ minWidth: 120 }}
          >
            {loadingStats ? 'Actualizando...' : 'Actualizar'}
          </Button>
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.primary.main }}>
                      {loadingStats ? <CircularProgress size={24} /> : (estadisticas.total_residentes || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Total de Residentes
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                  }}>
                    <Person sx={{ color: theme.palette.primary.main, fontSize: '1.75rem' }} />
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
                      {loadingStats ? <CircularProgress size={24} /> : (estadisticas.residentes_activos || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Residentes Activos
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.info.main }}>
                      {loadingStats ? <CircularProgress size={24} /> : (estadisticas.propietarios || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Propietarios
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.1) 
                  }}>
                    <Home sx={{ color: theme.palette.info.main, fontSize: '1.75rem' }} />
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
                      {loadingStats ? <CircularProgress size={24} /> : (estadisticas.arrendatarios || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Arrendatarios
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.warning.main, 0.1) 
                  }}>
                    <Home sx={{ color: theme.palette.warning.main, fontSize: '1.75rem' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles de búsqueda y filtros */}
        <Card sx={{ mb: 3, p: 2, mt: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar residentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenModal}
                sx={{ minWidth: 150 }}
              >
                Nuevo Residente
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Tabla de residentes */}
        <Card>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Residente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Documento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Residencia</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResidentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron residentes
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidentes.map((residente) => (
                    <TableRow key={residente.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                            {residente.nombre?.charAt(0) || 'R'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {residente.nombre} {residente.apellidoPaterno} {residente.apellidoMaterno}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {residente.fecha_nacimiento}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {residente.tipoDocumento}: {residente.documento}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                            {residente.telefono}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email sx={{ fontSize: 16, mr: 0.5 }} />
                            {residente.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                            {residente.direccionResidencia} {residente.numeroResidencia}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {residente.tipoResidencia}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={residente.tipoResidente}
                          color={getTipoResidenteColor(residente.tipoResidente)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={residente.estado}
                          color={getEstadoColor(residente.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(residente)}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(residente.id)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Modal para crear/editar residente */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingResidente ? 'Editar Residente' : 'Nuevo Residente'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Información Personal */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                    Información Personal
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Materno"
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={formData.tipo_documento}
                      onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                      label="Tipo de Documento"
                    >
                      <MenuItem value="RUN">RUN</MenuItem>
                      <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
                      <MenuItem value="DNI">DNI</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Número de Documento"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                    Información de Residencia
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Dirección de Residencia"
                    value={formData.direccion_residencia}
                    onChange={(e) => setFormData({ ...formData, direccion_residencia: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Número"
                    value={formData.numero_residencia}
                    onChange={(e) => setFormData({ ...formData, numero_residencia: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Residencia</InputLabel>
                    <Select
                      value={formData.tipo_residencia}
                      onChange={(e) => setFormData({ ...formData, tipo_residencia: e.target.value })}
                      label="Tipo de Residencia"
                    >
                      <MenuItem value="departamento">Departamento</MenuItem>
                      <MenuItem value="casa">Casa</MenuItem>
                      <MenuItem value="oficina">Oficina</MenuItem>
                      <MenuItem value="local">Local Comercial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Ingreso"
                    type="date"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Residente</InputLabel>
                    <Select
                      value={formData.tipo_residente}
                      onChange={(e) => setFormData({ ...formData, tipo_residente: e.target.value })}
                      label="Tipo de Residente"
                    >
                      <MenuItem value="propietario">Propietario</MenuItem>
                      <MenuItem value="arrendatario">Arrendatario</MenuItem>
                      <MenuItem value="familiar">Familiar</MenuItem>
                      <MenuItem value="invitado">Invitado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      label="Estado"
                    >
                      <MenuItem value="activo">Activo</MenuItem>
                      <MenuItem value="inactivo">Inactivo</MenuItem>
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : (editingResidente ? 'Actualizar' : 'Crear')}
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Residente;
