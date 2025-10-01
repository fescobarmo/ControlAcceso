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
  const [validationErrors, setValidationErrors] = useState({});

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

  const validateField = (fieldName, value) => {
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'nombre':
        if (!value || value.trim() === '' || value.trim().length < 2) {
          errors[fieldName] = 'El nombre es obligatorio (mín. 2 caracteres)';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'apellido_paterno':
        if (!value || value.trim() === '' || value.trim().length < 2) {
          errors[fieldName] = 'El apellido paterno es obligatorio (mín. 2 caracteres)';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'apellido_materno':
        if (!value || value.trim() === '' || value.trim().length < 2) {
          errors[fieldName] = 'El apellido materno es obligatorio (mín. 2 caracteres)';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'documento':
        if (!value || value.trim() === '' || value.trim().length < 3) {
          errors[fieldName] = 'El número de documento es obligatorio (mín. 3 caracteres)';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'fecha_nacimiento':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'La fecha de nacimiento es obligatoria';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'telefono':
        if (!value || value.trim() === '' || value.trim().length < 8) {
          errors[fieldName] = 'El teléfono es obligatorio (mín. 8 caracteres)';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'email':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'El email es obligatorio';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            errors[fieldName] = 'El formato del email no es válido';
          } else {
            delete errors[fieldName];
          }
        }
        break;
      case 'direccion_residencia':
        if (!value || value.trim() === '' || value.trim().length < 5) {
          errors[fieldName] = 'La dirección es obligatoria (mín. 5 caracteres)';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'numero_residencia':
        if (!value || value.trim() === '' || value.trim().length < 1) {
          errors[fieldName] = 'El número de residencia es obligatorio';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'fecha_ingreso':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'La fecha de ingreso es obligatoria';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'observaciones':
        if (!value || value.trim() === '' || value.trim().length < 5) {
          errors[fieldName] = 'Las observaciones son obligatorias (mín. 5 caracteres)';
        } else {
          delete errors[fieldName];
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const validateForm = () => {
    const errors = [];
    
    // Validar campos obligatorios con validación estricta
    if (!formData.nombre || formData.nombre.trim() === '' || formData.nombre.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }
    
    if (!formData.apellido_paterno || formData.apellido_paterno.trim() === '' || formData.apellido_paterno.trim().length < 2) {
      errors.push('El apellido paterno es obligatorio y debe tener al menos 2 caracteres');
    }
    
    if (!formData.apellido_materno || formData.apellido_materno.trim() === '' || formData.apellido_materno.trim().length < 2) {
      errors.push('El apellido materno es obligatorio y debe tener al menos 2 caracteres');
    }
    
    if (!formData.tipo_documento || formData.tipo_documento.trim() === '') {
      errors.push('El tipo de documento es obligatorio');
    }
    
    if (!formData.documento || formData.documento.trim() === '' || formData.documento.trim().length < 3) {
      errors.push('El número de documento es obligatorio y debe tener al menos 3 caracteres');
    }
    
    if (!formData.fecha_nacimiento || formData.fecha_nacimiento.trim() === '') {
      errors.push('La fecha de nacimiento es obligatoria');
    }
    
    if (!formData.telefono || formData.telefono.trim() === '' || formData.telefono.trim().length < 8) {
      errors.push('El teléfono es obligatorio y debe tener al menos 8 caracteres');
    }
    
    if (!formData.email || formData.email.trim() === '') {
      errors.push('El email es obligatorio');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.push('El formato del email no es válido');
      }
    }
    
    if (!formData.direccion_residencia || formData.direccion_residencia.trim() === '' || formData.direccion_residencia.trim().length < 5) {
      errors.push('La dirección de residencia es obligatoria y debe tener al menos 5 caracteres');
    }
    
    if (!formData.numero_residencia || formData.numero_residencia.trim() === '' || formData.numero_residencia.trim().length < 1) {
      errors.push('El número de residencia es obligatorio');
    }
    
    if (!formData.tipo_residencia || formData.tipo_residencia.trim() === '') {
      errors.push('El tipo de residencia es obligatorio');
    }
    
    if (!formData.fecha_ingreso || formData.fecha_ingreso.trim() === '') {
      errors.push('La fecha de ingreso es obligatoria');
    }
    
    if (!formData.estado || formData.estado.trim() === '') {
      errors.push('El estado es obligatorio');
    }
    
    if (!formData.tipo_residente || formData.tipo_residente.trim() === '') {
      errors.push('El tipo de residente es obligatorio');
    }
    
    if (!formData.observaciones || formData.observaciones.trim() === '' || formData.observaciones.trim().length < 5) {
      errors.push('Las observaciones son obligatorias y deben tener al menos 5 caracteres');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validar formulario antes de enviar
    const validationErrors = validateForm();
    console.log('🔍 [DEBUG] Errores de validación:', validationErrors);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setSnackbar({
        open: true,
        message: `Por favor complete todos los campos obligatorios: ${validationErrors.join('. ')}`,
        severity: 'error'
      });
      setLoading(false);
      return;
    }

    // Validación adicional: verificar que no hay campos vacíos
    const camposObligatorios = [
      'nombre', 'apellido_paterno', 'apellido_materno', 'tipo_documento', 
      'documento', 'fecha_nacimiento', 'telefono', 'email', 
      'direccion_residencia', 'numero_residencia', 'tipo_residencia', 
      'fecha_ingreso', 'estado', 'tipo_residente', 'observaciones'
    ];
    
    const camposVacios = camposObligatorios.filter(campo => {
      const valor = formData[campo];
      return !valor || valor.toString().trim() === '';
    });
    
    if (camposVacios.length > 0) {
      setError(`Los siguientes campos están vacíos: ${camposVacios.join(', ')}`);
      setSnackbar({
        open: true,
        message: `Los siguientes campos están vacíos: ${camposVacios.join(', ')}`,
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    try {
      // Todos los campos son obligatorios, enviar todos los datos
      const datosParaEnviar = { ...formData };
      
      // Limpiar espacios en blanco pero mantener todos los campos
      Object.keys(datosParaEnviar).forEach(key => {
        if (datosParaEnviar[key] && typeof datosParaEnviar[key] === 'string') {
          datosParaEnviar[key] = datosParaEnviar[key].trim();
        }
      });
      
      console.log('📝 Enviando datos del formulario:', datosParaEnviar);
      
      let response;
      if (editingResidente) {
        console.log('✏️ Actualizando residente existente:', editingResidente.id);
        response = await api.put(`/api/residentes/${editingResidente.id}`, datosParaEnviar);
        console.log('✅ Respuesta de actualización:', response.data);
        setSnackbar({
          open: true,
          message: 'Residente actualizado exitosamente',
          severity: 'success'
        });
      } else {
        console.log('➕ Creando nuevo residente...');
        response = await api.post('/api/residentes', datosParaEnviar);
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
    setValidationErrors({});
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
              {/* Nota sobre campos obligatorios */}
              <Alert severity="info" sx={{ mb: 3 }}>
                Todos los campos son obligatorios y deben completarse antes de guardar.
              </Alert>
              
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
                    label="Nombre *"
                    value={formData.nombre}
                    onChange={(e) => {
                      setFormData({ ...formData, nombre: e.target.value });
                      validateField('nombre', e.target.value);
                    }}
                    required
                    error={!!validationErrors.nombre}
                    helperText={validationErrors.nombre || ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno *"
                    value={formData.apellido_paterno}
                    onChange={(e) => {
                      setFormData({ ...formData, apellido_paterno: e.target.value });
                      validateField('apellido_paterno', e.target.value);
                    }}
                    required
                    error={!!validationErrors.apellido_paterno}
                    helperText={validationErrors.apellido_paterno || ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Materno *"
                    value={formData.apellido_materno}
                    onChange={(e) => {
                      setFormData({ ...formData, apellido_materno: e.target.value });
                      validateField('apellido_materno', e.target.value);
                    }}
                    required
                    error={!!validationErrors.apellido_materno}
                    helperText={validationErrors.apellido_materno || ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!formData.tipo_documento}>
                    <InputLabel>Tipo de Documento *</InputLabel>
                    <Select
                      value={formData.tipo_documento}
                      onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                      label="Tipo de Documento *"
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
                    label="Número de Documento *"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    required
                    error={!formData.documento || formData.documento.trim().length < 3}
                    helperText={(!formData.documento || formData.documento.trim().length < 3) ? "El número de documento es obligatorio (mín. 3 caracteres)" : ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento *"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => {
                      setFormData({ ...formData, fecha_nacimiento: e.target.value });
                      validateField('fecha_nacimiento', e.target.value);
                    }}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!!validationErrors.fecha_nacimiento}
                    helperText={validationErrors.fecha_nacimiento || ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono *"
                    value={formData.telefono}
                    onChange={(e) => {
                      setFormData({ ...formData, telefono: e.target.value });
                      validateField('telefono', e.target.value);
                    }}
                    required
                    error={!!validationErrors.telefono}
                    helperText={validationErrors.telefono || ""}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      validateField('email', e.target.value);
                    }}
                    required
                    error={!!validationErrors.email}
                    helperText={validationErrors.email || ""}
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
                    label="Dirección de Residencia *"
                    value={formData.direccion_residencia}
                    onChange={(e) => setFormData({ ...formData, direccion_residencia: e.target.value })}
                    required
                    error={!formData.direccion_residencia || formData.direccion_residencia.trim().length < 5}
                    helperText={(!formData.direccion_residencia || formData.direccion_residencia.trim().length < 5) ? "La dirección es obligatoria (mín. 5 caracteres)" : ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Número de Residencia *"
                    value={formData.numero_residencia}
                    onChange={(e) => setFormData({ ...formData, numero_residencia: e.target.value })}
                    required
                    error={!formData.numero_residencia || formData.numero_residencia.trim().length < 1}
                    helperText={(!formData.numero_residencia || formData.numero_residencia.trim().length < 1) ? "El número de residencia es obligatorio" : ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!formData.tipo_residencia}>
                    <InputLabel>Tipo de Residencia *</InputLabel>
                    <Select
                      value={formData.tipo_residencia}
                      onChange={(e) => setFormData({ ...formData, tipo_residencia: e.target.value })}
                      label="Tipo de Residencia *"
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
                    label="Fecha de Ingreso *"
                    type="date"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!formData.fecha_ingreso || formData.fecha_ingreso.trim() === ''}
                    helperText={(!formData.fecha_ingreso || formData.fecha_ingreso.trim() === '') ? "La fecha de ingreso es obligatoria" : ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!formData.tipo_residente}>
                    <InputLabel>Tipo de Residente *</InputLabel>
                    <Select
                      value={formData.tipo_residente}
                      onChange={(e) => setFormData({ ...formData, tipo_residente: e.target.value })}
                      label="Tipo de Residente *"
                    >
                      <MenuItem value="propietario">Propietario</MenuItem>
                      <MenuItem value="arrendatario">Arrendatario</MenuItem>
                      <MenuItem value="familiar">Familiar</MenuItem>
                      <MenuItem value="invitado">Invitado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!formData.estado}>
                    <InputLabel>Estado *</InputLabel>
                    <Select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      label="Estado *"
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
                    label="Observaciones *"
                    multiline
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    required
                    error={!formData.observaciones || formData.observaciones.trim().length < 5}
                    helperText={(!formData.observaciones || formData.observaciones.trim().length < 5) ? "Las observaciones son obligatorias (mín. 5 caracteres)" : ""}
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
