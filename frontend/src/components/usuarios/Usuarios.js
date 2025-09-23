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
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Switch,
  FormControlLabel,
  CircularProgress,
  Pagination,
  TablePagination,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Search,
  FilterList,
  Person,
  Security,
  AdminPanelSettings,
  SupervisorAccount,
  Group,
  PersonAdd,
  PersonOutline,
  PersonOff,
  Assessment,
  CheckCircle as CheckCircleIcon,
  Block,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const Usuarios = () => {
  const theme = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [estadisticas, setEstadisticas] = useState({
    total_usuarios: 0,
    usuarios_activos: 0,
    usuarios_inactivos: 0,
    usuarios_bloqueados: 0
  });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    rol_id: '',
    perfil_id: '',
    telefono: '',
    direccion: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // 5 registros por página como solicitado
    total: 0,
    totalPages: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🚀 Componente Usuarios montado, cargando datos...');
    loadInitialData();
  }, []);

  // Log cuando cambien los estados
  useEffect(() => {
    console.log('📊 Estado actual - Roles:', roles.length, 'Perfiles:', perfiles.length);
  }, [roles, perfiles]);

  // Cargar usuarios cuando cambien los filtros
  useEffect(() => {
    loadUsers();
  }, [pagination.page, searchTerm, filterRol, filterEstado]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos iniciales...');
      
      const [rolesRes, perfilesRes] = await Promise.all([
        api.get('/api/roles'),
        api.get('/api/perfiles')
      ]);

      console.log('📊 Respuesta de roles:', rolesRes.data);
      console.log('📊 Respuesta de perfiles:', perfilesRes.data);

      // Filtrar roles únicos por nombre
      const rolesUnicos = (rolesRes.data.data || []).filter((rol, index, self) => 
        index === self.findIndex(r => r.nombre === rol.nombre)
      );
      
      // Filtrar perfiles únicos por nombre
      const perfilesUnicos = (perfilesRes.data.data || []).filter((perfil, index, self) => 
        index === self.findIndex(p => p.nombre === perfil.nombre)
      );

      setRoles(rolesUnicos);
      setPerfiles(perfilesUnicos);
      
      console.log('✅ Roles únicos cargados:', rolesUnicos);
      console.log('✅ Perfiles únicos cargados:', perfilesUnicos);
      
      // Establecer valores por defecto
      if (rolesUnicos.length > 0) {
        setFormData(prev => ({ ...prev, rol_id: rolesUnicos[0].id }));
        console.log('🎯 Rol por defecto establecido:', rolesUnicos[0].id);
      }
      if (perfilesUnicos.length > 0) {
        setFormData(prev => ({ ...prev, perfil_id: perfilesUnicos[0].id }));
        console.log('🎯 Perfil por defecto establecido:', perfilesUnicos[0].id);
      }
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      setSnackbar({
        open: true,
        message: 'Error cargando datos iniciales',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        rol: filterRol,
        estado: filterEstado
      });

      const response = await api.get(`/api/users?${params}`);
      setUsuarios(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0
      }));
      
      // Calcular estadísticas
      const usuarios = response.data.data || [];
      const stats = {
        total_usuarios: response.data.pagination?.total || 0,
        usuarios_activos: usuarios.filter(u => u.estado === 'activo').length,
        usuarios_inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
        usuarios_bloqueados: usuarios.filter(u => u.estado === 'bloqueado').length
      };
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setSnackbar({
        open: true,
        message: 'Error cargando usuarios',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Las contraseñas no coinciden',
        severity: 'error'
      });
      return;
    }

    try {
      if (editingUser) {
        // Actualizar usuario existente
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
          delete updateData.confirmPassword;
        }
        
        await api.put(`/api/users/${editingUser.id}`, updateData);
        setSnackbar({
          open: true,
          message: 'Usuario actualizado exitosamente',
          severity: 'success'
        });
      } else {
        // Crear nuevo usuario
        const createData = { ...formData };
        delete createData.confirmPassword;
        
        await api.post('/api/users', createData);
        setSnackbar({
          open: true,
          message: 'Usuario creado exitosamente',
          severity: 'success'
        });
      }

      handleCloseDialog();
      // Actualización automática inmediata
      setTimeout(() => {
        loadUsers();
      }, 100);
    } catch (error) {
      console.error('Error guardando usuario:', error);
      const errorMessage = error.response?.data?.message || 'Error guardando usuario';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      confirmPassword: '',
      rol_id: user.role?.id || '',
      perfil_id: user.profile?.id || '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
    });
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setSnackbar({
        open: true,
        message: 'Usuario eliminado exitosamente',
        severity: 'success'
      });
      // Actualización automática inmediata
      setTimeout(() => {
        loadUsers();
      }, 100);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setSnackbar({
        open: true,
        message: 'Error eliminando usuario',
        severity: 'error'
      });
    }
  };

  const handleToggleStatus = async (userId, currentEstado) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [userId]: true }));
      const newEstado = currentEstado === 'activo' ? 'inactivo' : 'activo';
      await api.patch(`/api/users/${userId}/status`, { estado: newEstado });
      
      // Actualizar el estado visualmente inmediatamente
      setUsuarios(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, estado: newEstado }
          : user
      ));
      
      // Actualizar estadísticas
      setEstadisticas(prev => {
        const newStats = { ...prev };
        if (currentEstado === 'activo') {
          newStats.usuarios_activos--;
          newStats.usuarios_inactivos++;
        } else {
          newStats.usuarios_activos++;
          newStats.usuarios_inactivos--;
        }
        return newStats;
      });
      
      setSnackbar({
        open: true,
        message: `Estado cambiado a ${newEstado}`,
        severity: 'success'
      });
      
      setUpdatingStatus(prev => ({ ...prev, [userId]: false }));
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setSnackbar({
        open: true,
        message: 'Error cambiando estado',
        severity: 'error'
      });
      setUpdatingStatus(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      rol_id: roles[0]?.id || '',
      perfil_id: perfiles[0]?.id || '',
      telefono: '',
      direccion: '',
    });
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRol('');
    setFilterEstado('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Función para obtener el icono del rol
  const getRolIcon = (rolNombre) => {
    if (!rolNombre) return <Person />;
    
    const nombreLower = rolNombre.toLowerCase();
    if (nombreLower.includes('super administrador') || nombreLower.includes('admin')) return <AdminPanelSettings />;
    if (nombreLower.includes('gerente') || nombreLower.includes('supervisor')) return <SupervisorAccount />;
    if (nombreLower.includes('coordinador')) return <Group />;
    if (nombreLower.includes('avanzado')) return <PersonAdd />;
    if (nombreLower.includes('limitado')) return <PersonOutline />;
    if (nombreLower.includes('invitado')) return <PersonOff />;
    if (nombreLower.includes('auditor')) return <Assessment />;
    return <Person />;
  };

  // Función para obtener el color del rol
  const getRolColor = (rolNombre) => {
    if (!rolNombre) return 'default';
    
    const nombreLower = rolNombre.toLowerCase();
    if (nombreLower.includes('super administrador')) return 'error';
    if (nombreLower.includes('administrador')) return 'warning';
    if (nombreLower.includes('gerente')) return 'secondary';
    if (nombreLower.includes('supervisor')) return 'primary';
    if (nombreLower.includes('coordinador')) return 'success';
    if (nombreLower.includes('avanzado')) return 'warning';
    if (nombreLower.includes('estándar')) return 'info';
    if (nombreLower.includes('limitado')) return 'default';
    if (nombreLower.includes('invitado')) return 'default';
    if (nombreLower.includes('auditor')) return 'info';
    return 'default';
  };

  // Función para obtener el icono del perfil
  const getPerfilIcon = (perfilNombre) => {
    if (!perfilNombre) return <Security />;
    
    const nombreLower = perfilNombre.toLowerCase();
    if (nombreLower.includes('super administrador')) return <AdminPanelSettings />;
    if (nombreLower.includes('administrador')) return <Security />;
    if (nombreLower.includes('gerente')) return <SupervisorAccount />;
    if (nombreLower.includes('supervisor')) return <Group />;
    if (nombreLower.includes('coordinador')) return <Group />;
    if (nombreLower.includes('avanzado')) return <PersonAdd />;
    if (nombreLower.includes('estándar')) return <Person />;
    if (nombreLower.includes('limitado')) return <PersonOutline />;
    if (nombreLower.includes('invitado')) return <PersonOff />;
    if (nombreLower.includes('auditor')) return <Assessment />;
    return <Security />;
  };

  if (loading && usuarios.length === 0) {
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
          <Person sx={{ fontSize: '2rem', mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Gestión de Usuarios
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.primary.main }}>
                      {estadisticas.total_usuarios || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Total de Usuarios
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
                      {estadisticas.usuarios_activos || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Usuarios Activos
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
                      {estadisticas.usuarios_inactivos || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Usuarios Inactivos
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.warning.main, 0.1) 
                  }}>
                    <PersonOff sx={{ color: theme.palette.warning.main, fontSize: '1.75rem' }} />
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
                      {estadisticas.usuarios_bloqueados || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Usuarios Bloqueados
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.error.main, 0.1) 
                  }}>
                    <Block sx={{ color: theme.palette.error.main, fontSize: '1.75rem' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y búsqueda */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              Filtros y Búsqueda
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap' }}>
            <TextField
              size="small"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
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
              <InputLabel>Rol</InputLabel>
              <Select
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
                label="Rol"
                sx={{
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.grey[300],
                  },
                }}
              >
                <MenuItem value="">Todos los roles</MenuItem>
                {roles.map(rol => (
                  <MenuItem key={rol.id} value={rol.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: rol.color || '#1976d2', 
                        mr: 1 
                      }} />
                      {rol.nombre}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: '150px', flex: '0 0 auto' }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                label="Estado"
                sx={{
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.grey[300],
                  },
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
                <MenuItem value="bloqueado">Bloqueado</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
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
              Nuevo Usuario
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
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

        {/* Tabla de usuarios */}
        <Paper sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden', mb: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}>Usuario</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Perfil</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Fecha Creación</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Último Acceso</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: user.role?.color || theme.palette.primary.main }}>
                          {getRolIcon(user.role?.nombre)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {user.nombre} {user.apellido}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'grey.600', fontFamily: 'monospace' }}>
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getPerfilIcon(user.profile?.nombre)}
                        label={user.profile?.nombre}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: user.profile?.color || undefined,
                          color: user.profile?.color || undefined
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.estado === 'activo' ? 'Activo' : user.estado}
                        color={user.estado === 'activo' ? 'success' : user.estado === 'inactivo' ? 'warning' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString() : 'Nunca'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.light + '20' }
                          }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.estado === 'activo'}
                              onChange={() => handleToggleStatus(user.id, user.estado)}
                              size="small"
                              disabled={updatingStatus[user.id]}
                            />
                          }
                          label=""
                        />
                        {updatingStatus[user.id] && (
                          <CircularProgress size={16} sx={{ ml: 1 }} />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': { bgcolor: theme.palette.error.light + '20' }
                          }}
                          title="Eliminar"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {usuarios.length === 0 && !loading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron usuarios
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Intenta ajustar los filtros o crear un nuevo usuario
              </Typography>
            </Box>
          )}
          
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={(event, newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={(event) => {
              setPagination(prev => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </Paper>

        {/* Dialog para crear/editar usuario */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre de usuario"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      name="rol_id"
                      value={formData.rol_id}
                      onChange={handleInputChange}
                      label="Rol"
                    >
                      {roles.map(rol => (
                        <MenuItem key={rol.id} value={rol.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              bgcolor: rol.color || '#1976d2', 
                              mr: 1 
                            }} />
                            <Typography sx={{ ml: 1 }}>{rol.nombre}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Perfil</InputLabel>
                    <Select
                      name="perfil_id"
                      value={formData.perfil_id}
                      onChange={handleInputChange}
                      label="Perfil"
                    >
                      {perfiles.map(perfil => (
                        <MenuItem key={perfil.id} value={perfil.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              bgcolor: perfil.color || '#1976d2', 
                              mr: 1 
                            }} />
                            <Typography sx={{ ml: 1 }}>{perfil.nombre}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!editingUser}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  }
                }}
              >
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogActions>
          </form>
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

export default Usuarios;
