import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Security,
  Assessment,
  Settings,
  Search,
  Menu as MenuIcon,
  Person,
  ExitToApp,
  KeyboardArrowDown,
  Book,
  Face,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Estilos personalizados
const SearchBox = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const drawerWidth = 280;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authLogout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleMenuClick = (menuId) => {
    if (menuId === 'dashboard') {
      navigate('/dashboard');
    } else if (menuId === 'users') {
      navigate('/usuarios');
    } else if (menuId === 'residente') {
      navigate('/residente');
    } else if (menuId === 'visitas') {
      navigate('/visitas');
    } else if (menuId === 'visitas-externas') {
      navigate('/visitas-externas');
    } else if (menuId === 'bitacora') {
      navigate('/bitacora');
    } else if (menuId === 'enrolamiento') {
      navigate('/enrolamiento');
    }
  };

  const getCurrentMenu = () => {
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname === '/usuarios') return 'users';
    if (location.pathname === '/residente') return 'residente';
    if (location.pathname === '/visitas') return 'visitas';
    if (location.pathname === '/visitas-externas') return 'visitas-externas';
    if (location.pathname === '/bitacora') return 'bitacora';
    if (location.pathname === '/enrolamiento') return 'enrolamiento';
    return 'dashboard';
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'users', label: 'Usuarios', icon: <People /> },
    { id: 'residente', label: 'Residente', icon: <Person /> },
    { id: 'visitas', label: 'Visitas', icon: <Book /> },
    { id: 'visitas-externas', label: 'Visitas Externas', icon: <People /> },
    { id: 'enrolamiento', label: 'Enrolamiento', icon: <Face /> },
    { id: 'bitacora', label: 'Bitácora', icon: <Security /> },
    { id: 'reports', label: 'Reportes', icon: <Assessment /> },
    { id: 'settings', label: 'Configuración', icon: <Settings /> },
  ];

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'white' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          ControlAcceso
        </Typography>
      </Box>

      {/* Menú Principal */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={getCurrentMenu() === item.id}
              onClick={() => handleMenuClick(item.id)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#1565c0',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'grey.800',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 2
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Barra de búsqueda */}
          <SearchBox>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Buscar..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </SearchBox>

          <Box sx={{ flexGrow: 1 }} />


          {/* Selector de idioma */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Español
            </Typography>
            <KeyboardArrowDown />
          </Box>

          {/* Perfil de usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 40, height: 40, mr: 1, bgcolor: '#1976d2' }}>
              {user ? `${user.nombre?.charAt(0) || ''}${user.apellido?.charAt(0) || ''}` : 'U'}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1, alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.600' }}>
                {user?.profile?.nombre || 'Perfil'}
              </Typography>
            </Box>
            <IconButton onClick={handleProfileMenuOpen}>
              <KeyboardArrowDown />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menú lateral */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 },
          zIndex: 0,
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          pl: 2.5
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 4,
          zIndex: 1,
          position: 'relative',
          ml: { sm: `${drawerWidth - 130}px` }
        }}
      >
        {children}
      </Box>

      {/* Menú de perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
