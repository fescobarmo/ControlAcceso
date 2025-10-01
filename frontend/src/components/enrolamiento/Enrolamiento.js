import React, { useState, useEffect, useRef } from 'react';
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
  Paper,
  useTheme,
  alpha,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PhotoCamera,
  Search,
  Refresh as RefreshIcon,
  Face,
  Person,
  CheckCircle as CheckCircleIcon,
  PersonOff,
  Block,
  FilterList,
  RadioButtonChecked,
} from '@mui/icons-material';
import api from '../../utils/api';

const Enrolamiento = () => {
  const theme = useTheme();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipoDocumento, setFilterTipoDocumento] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'RUN', // Valor por defecto
    numeroDocumento: '',
    foto: null,
    fotoPreview: null,
    debugValue: '', // Campo para debug
  });

  // Estado para controlar el modo del modal
  const [modalMode, setModalMode] = useState('search'); // 'search' o 'manual'

  // Referencia para el input del lector
  const lectorInputRef = useRef(null);

  const tiposDocumento = [
    { value: 'RUN', label: 'RUN' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'DNI', label: 'DNI' },
  ];

  const [estadisticas, setEstadisticas] = useState({
    total_personas: 0,
    personas_activas: 0,
    personas_inactivas: 0,
    personas_suspendidas: 0
  });

  useEffect(() => {
    cargarPersonas();
    fetchEstadisticas();
  }, []);

  // Debug: Monitorear cambios en errorMessage
  useEffect(() => {
    console.log('🔍 errorMessage cambió:', errorMessage);
  }, [errorMessage]);

  const fetchEstadisticas = async () => {
    try {
      console.log('📊 Iniciando fetch de estadísticas de personas...');
      const response = await api.get('/api/enrolamiento/personas/estadisticas');
      console.log('📊 Respuesta de estadísticas de personas:', response.data);
      
      if (response.data && response.data.success) {
        const data = response.data.data || {};
        console.log('📊 Datos recibidos del backend:', data);
        // Mapear los nombres de propiedades del backend al frontend
        setEstadisticas({
          total_personas: data.total_personas || 0,
          personas_activas: data.personas_activas || 0,
          personas_inactivas: data.personas_inactivas || 0,
          personas_suspendidas: data.personas_pendientes || 0 // Mapear pendientes a suspendidas
        });
        console.log('✅ Estadísticas de personas actualizadas:', data);
      } else {
        console.warn('⚠️ Estadísticas de personas sin éxito:', response.data);
        setEstadisticas({
          total_personas: 0,
          personas_activas: 0,
          personas_inactivas: 0,
          personas_suspendidas: 0
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de personas:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Establecer valores por defecto en caso de error
      setEstadisticas({
        total_personas: 0,
        personas_activas: 0,
        personas_inactivas: 0,
        personas_suspendidas: 0
      });
    }
  };

  // Efecto para mantener el focus en el input del lector cuando se abre el modal
  useEffect(() => {
    if (dialogOpen && lectorInputRef.current) {
      // Pequeño delay para asegurar que el modal esté completamente renderizado
      setTimeout(() => {
        lectorInputRef.current.focus();
      }, 100);
    }
  }, [dialogOpen]);

  // Efecto para mantener el foco en el input del lector constantemente
  useEffect(() => {
    if (dialogOpen && modalMode === 'search') {
      // Foco inmediato al abrir el modal
      const focusInput = () => {
        if (lectorInputRef.current) {
          lectorInputRef.current.focus();
          console.log('🎯 Foco establecido en input del lector');
        }
      };

      // Foco inmediato
      focusInput();
      
      // Foco con delay para asegurar que el modal esté completamente renderizado
      setTimeout(focusInput, 100);
      setTimeout(focusInput, 300);
      setTimeout(focusInput, 500);

      // Verificación continua del foco cada 50ms
      const interval = setInterval(() => {
        if (lectorInputRef.current && document.activeElement !== lectorInputRef.current) {
          lectorInputRef.current.focus();
          console.log('🎯 Foco recuperado en input del lector');
        }
      }, 50); // Verificar cada 50ms para máxima responsividad

      // Event listeners para capturar cambios de foco global
      const handleFocusChange = () => {
        if (lectorInputRef.current && document.activeElement !== lectorInputRef.current) {
          setTimeout(() => {
            if (lectorInputRef.current) {
              lectorInputRef.current.focus();
              console.log('🎯 Foco restaurado después de cambio global');
            }
          }, 10);
        }
      };

      const handleClick = () => {
        setTimeout(() => {
          if (lectorInputRef.current && document.activeElement !== lectorInputRef.current) {
            lectorInputRef.current.focus();
            console.log('🎯 Foco restaurado después de clic');
          }
        }, 10);
      };

      document.addEventListener('focusin', handleFocusChange);
      document.addEventListener('click', handleClick);
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleFocusChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('focusin', handleFocusChange);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('keydown', handleFocusChange);
      };
    }
  }, [dialogOpen, modalMode]);

  // Función para asegurar el foco después de procesar datos
  const asegurarFoco = () => {
    console.log('🎯 Asegurando foco en input del lector...');
    
    // Múltiples intentos para asegurar el foco
    const focusAttempts = [10, 50, 100, 200, 500];
    
    focusAttempts.forEach(delay => {
      setTimeout(() => {
        if (lectorInputRef.current) {
          lectorInputRef.current.focus();
          console.log(`🎯 Intento de foco con delay ${delay}ms`);
        }
      }, delay);
    });
  };

  const cargarPersonas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/enrolamiento/personas', {
        params: {
          page: pagination.page + 1,
          limit: pagination.rowsPerPage,
          search: searchTerm,
          tipoDocumento: filterTipoDocumento,
          estado: filterEstado
        }
      });

      if (response.data.success) {
        const personasData = response.data.data?.personas || response.data.data || [];
        setPersonas(Array.isArray(personasData) ? personasData : []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total
          }));
        }
      }
    } catch (error) {
      console.error('Error al cargar personas:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar personas';
      mostrarSnackbar(errorMessage, 'error');
      
      // Cargar datos de ejemplo si la API falla
      cargarDatosEjemplo();
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosEjemplo = () => {
    const personasEjemplo = [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        tipoDocumento: 'RUN',
        numeroDocumento: '12345678-9',
        fotoUrl: 'https://via.placeholder.com/150',
        estado: 'activo'
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        tipoDocumento: 'PASAPORTE',
        numeroDocumento: 'AB123456',
        fotoUrl: 'https://via.placeholder.com/150',
        estado: 'activo'
      },
    ];
    setPersonas(personasEjemplo);
    setPagination(prev => ({ ...prev, total: personasEjemplo.length }));
    
    // Calcular estadísticas de ejemplo
    const stats = {
      total_personas: personasEjemplo.length,
      personas_activas: personasEjemplo.filter(p => p.estado === 'activo').length,
      personas_inactivas: personasEjemplo.filter(p => p.estado === 'inactivo').length,
      personas_suspendidas: personasEjemplo.filter(p => p.estado === 'suspendido').length
    };
    setEstadisticas(stats);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el campo numeroDocumento, formatear el RUN reemplazando comillas por guiones
    if (name === 'numeroDocumento') {
      const valorFormateado = value.replace(/'/g, '-');
      setFormData(prev => ({
        ...prev,
        [name]: valorFormateado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para procesar el valor del lector - VERSIÓN SIMPLIFICADA
  const procesarValorLector = (valor) => {
    try {
      console.log('🔍 VALOR RECIBIDO DEL LECTOR:', valor);
      console.log('🔍 LONGITUD DEL VALOR:', valor.length);
      console.log('🔍 CARACTERES ESPECIALES:', valor.replace(/[a-zA-Z0-9]/g, '').split('').filter((char, index, arr) => arr.indexOf(char) === index));
      
      // Los campos ya fueron limpiados ANTES de llamar a esta función
      console.log('🔄 PROCESANDO LECTURA DEL LECTOR');
      
      // Decodificar URL si es necesario
      let valorDecodificado = valor;
      try {
        valorDecodificado = decodeURIComponent(valor);
        console.log('🔍 VALOR DECODIFICADO:', valorDecodificado);
      } catch (e) {
        console.log('⚠️ No se pudo decodificar URL, usando valor original');
      }
      
      let nombre = '';
      let apellido = '';
      let numeroDocumento = '';
      
      // DEBUG: Mostrar todos los patrones posibles que podrían contener RUN
      console.log('🔍 BUSCANDO PATRONES DE RUN...');
      
      // Buscar diferentes patrones de RUN - PATRONES EXPANDIDOS
      const runPatterns = [
        /RUN¡([^\/]+)\//,           // RUN¡12345678'9/
        /RUN¡([^%]+)/,              // RUN¡12345678'9
        /RUN:([^\/]+)\//,           // RUN:12345678'9/
        /RUN:([^%]+)/,              // RUN:12345678'9
        /RUT:([^\/]+)\//,           // RUT:12345678'9/
        /RUT:([^%]+)/,              // RUT:12345678'9
        /docstatus_RUN¡([^\/]+)\//, // docstatus_RUN¡12345678'9/
        /docstatus_RUN¡([^%]+)/,    // docstatus_RUN¡12345678'9
        /RUN=([^\/]+)\//,           // RUN=12345678'9/
        /RUN=([^%]+)/,              // RUN=12345678'9
        /RUT=([^\/]+)\//,           // RUT=12345678'9/
        /RUT=([^%]+)/,              // RUT=12345678'9
        /RUN([^\/]+)\//,            // RUN12345678'9/
        /RUN([^%]+)/,               // RUN12345678'9
        /RUT([^\/]+)\//,            // RUT12345678'9/
        /RUT([^%]+)/,               // RUT12345678'9
      ];
      
      for (let i = 0; i < runPatterns.length; i++) {
        const pattern = runPatterns[i];
        const match = valorDecodificado.match(pattern);
        console.log(`🔍 Patrón ${i + 1}: ${pattern} - Resultado:`, match);
        
        if (match) {
          // Extraer el RUN y cambiar "'" por "-"
          numeroDocumento = match[1].replace(/'/g, '-');
          console.log('✅ RUN ENCONTRADO con patrón:', pattern, '=', numeroDocumento);
          console.log('🔍 Valor extraído original:', match[1]);
          console.log('🔍 Valor con reemplazo de comillas:', numeroDocumento);
          break;
        }
      }
      
      if (!numeroDocumento) {
        console.log('❌ No se encontró ningún patrón de RUN específico');
        console.log('🔍 BUSCANDO PATRONES GENÉRICOS DE RUN...');
        
        // Buscar patrones genéricos de RUN
        const genericRunPatterns = [
          /(\d{7,8}['-]\d{1,2})/,     // 12345678-9 o 12345678'9
          /(\d{7,8}[kK]\d{1,2})/,     // 12345678k9
          /(\d{7,8}[xX]\d{1,2})/,     // 12345678x9
          /(\d{7,8}\.\d{1,2})/,       // 12345678.9
          /(\d{7,8}\s\d{1,2})/,       // 12345678 9
        ];
        
        for (let i = 0; i < genericRunPatterns.length; i++) {
          const pattern = genericRunPatterns[i];
          const match = valorDecodificado.match(pattern);
          console.log(`🔍 Patrón genérico ${i + 1}: ${pattern} - Resultado:`, match);
          
          if (match) {
            numeroDocumento = match[1].replace(/'/g, '-').replace(/[kK]/g, '-').replace(/[xX]/g, '-').replace(/\./g, '-').replace(/\s/g, '-');
            console.log('✅ RUN ENCONTRADO con patrón genérico:', pattern, '=', numeroDocumento);
            break;
          }
        }
        
        if (!numeroDocumento) {
          console.log('❌ No se encontró ningún patrón de RUN');
          // Mostrar todo el contenido para debug
          console.log('🔍 CONTENIDO COMPLETO PARA DEBUG:', valorDecodificado);
        }
      }
      
      // EXTRACCIÓN DEL NOMBRE Y APELLIDO - Buscar diferentes patrones
      console.log('🔍 BUSCANDO PATRONES DE NOMBRE Y APELLIDO...');
      
      // Buscar nombre con patrones específicos - PATRONES EXPANDIDOS
      const namePatterns = [
        /name¡([^%]+)/,             // name¡Juan Pérez
        /name:([^%]+)/,             // name:Juan Pérez
        /nombre:([^%]+)/,           // nombre:Juan Pérez
        /NOMBRE:([^%]+)/,           // NOMBRE:Juan Pérez
        /name=([^%]+)/,             // name=Juan Pérez
        /nombre=([^%]+)/,           // nombre=Juan Pérez
        /NOMBRE=([^%]+)/,           // NOMBRE=Juan Pérez
        /name([^%]+)/,              // nameJuan Pérez
        /nombre([^%]+)/,            // nombreJuan Pérez
        /NOMBRE([^%]+)/,            // NOMBREJuan Pérez
      ];
      
      for (let i = 0; i < namePatterns.length; i++) {
        const pattern = namePatterns[i];
        const match = valorDecodificado.match(pattern);
        console.log(`🔍 Patrón nombre ${i + 1}: ${pattern} - Resultado:`, match);
        
        if (match) {
          const nombreCompleto = match[1].trim();
          console.log('🔍 Nombre completo encontrado:', nombreCompleto);
          
          // Dividir nombre completo en nombre y apellido
          const partes = nombreCompleto.split(/\s+/);
          if (partes.length >= 2) {
            nombre = partes[0];
            apellido = partes.slice(1).join(' ');
          } else {
            nombre = nombreCompleto;
          }
          console.log('✅ NOMBRE ENCONTRADO:', nombre, 'APELLIDO:', apellido);
          break;
        }
      }
      
      // Buscar apellido específicamente después de "%20%20" hasta "%20"
      if (!apellido) {
        console.log('🔍 BUSCANDO APELLIDO CON PATRÓN %20%20...');
        const apellidoPattern = /%20%20([^%]+)%20/;
        const apellidoMatch = valorDecodificado.match(apellidoPattern);
        console.log('🔍 Patrón apellido %20%20: %20%20([^%]+)%20 - Resultado:', apellidoMatch);
        
        if (apellidoMatch) {
          apellido = apellidoMatch[1].trim();
          console.log('✅ APELLIDO ENCONTRADO con %20%20:', apellido);
        }
      }
      
      // Si no se encontró nombre con patrones específicos, buscar en el formato %20%20
      if (!nombre) {
        console.log('🔍 BUSCANDO NOMBRE ANTES DE %20%20...');
        // Buscar el nombre que está antes de "%20%20"
        const nombreAntesPattern = /([^%]+)%20%20/;
        const nombreAntesMatch = valorDecodificado.match(nombreAntesPattern);
        console.log('🔍 Patrón nombre antes %20%20: ([^%]+)%20%20 - Resultado:', nombreAntesMatch);
        
        if (nombreAntesMatch) {
          nombre = nombreAntesMatch[1].trim();
          console.log('✅ NOMBRE ENCONTRADO antes de %20%20:', nombre);
        }
      }
      
      if (!nombre && !apellido) {
        console.log('❌ No se encontró ningún patrón de nombre específico');
        console.log('🔍 BUSCANDO NOMBRES GENÉRICOS...');
        
        // Buscar secuencias de letras que podrían ser nombres
        const genericNamePattern = /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/;
        const nameMatch = valorDecodificado.match(genericNamePattern);
        
        if (nameMatch) {
          const nombreCompleto = nameMatch[1].trim();
          console.log('🔍 Nombre genérico encontrado:', nombreCompleto);
          
          // Dividir nombre completo en nombre y apellido
          const partes = nombreCompleto.split(/\s+/);
          if (partes.length >= 2) {
            nombre = partes[0];
            apellido = partes.slice(1).join(' ');
          } else {
            nombre = nombreCompleto;
          }
          console.log('✅ NOMBRE GENÉRICO ENCONTRADO:', nombre, 'APELLIDO:', apellido);
        } else {
          console.log('❌ No se encontró ningún patrón de nombre o apellido');
        }
      }
      
      // Actualizar el formulario con los valores encontrados
      console.log('📝 RESUMEN DE EXTRACCIÓN:');
      console.log('  - Nombre:', nombre);
      console.log('  - Apellido:', apellido);
      console.log('  - RUN:', numeroDocumento);
      
      // Actualizar el estado del formulario con los nuevos valores (solo nombre y apellido si se encuentran)
      setFormData(prev => {
        const newData = {
          ...prev,
          nombre: nombre || prev.nombre,
          apellido: apellido || prev.apellido,
          // Solo actualizar RUN si se encuentra uno nuevo
          numeroDocumento: numeroDocumento ? numeroDocumento.replace(/'/g, '-') : prev.numeroDocumento,
          tipoDocumento: numeroDocumento ? 'RUN' : prev.tipoDocumento
        };
        console.log('🔄 FORMULARIO ACTUALIZADO CON NUEVOS DATOS:', newData);
        return newData;
      });
      
      // Limpiar el input del lector para la siguiente lectura
      if (lectorInputRef.current) {
        lectorInputRef.current.value = '';
      }
      
      // Mostrar mensaje de éxito
      if (nombre || apellido || numeroDocumento) {
        mostrarSnackbar('Datos del lector procesados correctamente', 'success');
      } else {
        mostrarSnackbar('No se pudieron extraer datos del lector', 'warning');
      }
      
      // Asegurar que el foco vuelva al input del lector después de procesar
      console.log('🔄 Procesamiento completado, asegurando foco...');
      asegurarFoco();
      
      // Foco adicional después de procesar
      setTimeout(() => {
        if (lectorInputRef.current) {
          lectorInputRef.current.focus();
          console.log('🎯 Foco adicional después de procesar');
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ ERROR procesando valor del lector:', error);
      mostrarSnackbar('Error procesando datos del lector', 'error');
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convertir archivo a base64 para enviar al backend
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          foto: event.target.result, // Base64 string
          fotoPreview: URL.createObjectURL(file)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    // Validar nombre
    if (!formData.nombre || !formData.nombre.trim()) {
      errors.push('El nombre es requerido');
    } else if (formData.nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (formData.nombre.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }
    
    // Validar apellido
    if (!formData.apellido || !formData.apellido.trim()) {
      errors.push('El apellido es requerido');
    } else if (formData.apellido.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    } else if (formData.apellido.trim().length > 100) {
      errors.push('El apellido no puede exceder 100 caracteres');
    }
    
    // Validar tipo de documento
    if (!formData.tipoDocumento) {
      errors.push('El tipo de documento es requerido');
    } else if (!['RUN', 'PASAPORTE', 'DNI'].includes(formData.tipoDocumento)) {
      errors.push('El tipo de documento debe ser RUN, PASAPORTE o DNI');
    }
    
    // Validar número de documento
    if (!formData.numeroDocumento || !formData.numeroDocumento.trim()) {
      errors.push('El número de documento es requerido');
    } else if (formData.numeroDocumento.trim().length < 3) {
      errors.push('El número de documento debe tener al menos 3 caracteres');
    } else if (formData.numeroDocumento.trim().length > 20) {
      errors.push('El número de documento no puede exceder 20 caracteres');
    }
    
    // Validaciones específicas por tipo de documento
    if (formData.tipoDocumento === 'RUN' && formData.numeroDocumento) {
      const runPattern = /^\d{7,8}[-]?\d{1,2}$/;
      if (!runPattern.test(formData.numeroDocumento.trim())) {
        errors.push('El formato del RUN no es válido (ejemplo: 12345678-9)');
      }
    }
    
    if (errors.length > 0) {
      mostrarSnackbar(errors.join(', '), 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Validar que los campos no estén vacíos después del trim
      const nombre = formData.nombre?.trim();
      const apellido = formData.apellido?.trim();
      const tipoDocumento = formData.tipoDocumento;
      const numeroDocumento = formData.numeroDocumento?.trim();

      // Validación adicional antes de enviar
      if (!nombre || !apellido || !tipoDocumento || !numeroDocumento) {
        mostrarSnackbar('Todos los campos obligatorios deben estar completos', 'error');
        setSubmitting(false);
        return;
      }

      // Validación de longitud según el modelo de la base de datos
      if (nombre.length < 2 || nombre.length > 100) {
        mostrarSnackbar('El nombre debe tener entre 2 y 100 caracteres', 'error');
        setSubmitting(false);
        return;
      }

      if (apellido.length < 2 || apellido.length > 100) {
        mostrarSnackbar('El apellido debe tener entre 2 y 100 caracteres', 'error');
        setSubmitting(false);
        return;
      }

      if (numeroDocumento.length < 3 || numeroDocumento.length > 20) {
        mostrarSnackbar('El número de documento debe tener entre 3 y 20 caracteres', 'error');
        setSubmitting(false);
        return;
      }

      // Validar que el tipo de documento sea válido
      if (!['RUN', 'PASAPORTE', 'DNI'].includes(tipoDocumento)) {
        mostrarSnackbar('El tipo de documento debe ser RUN, PASAPORTE o DNI', 'error');
        setSubmitting(false);
        return;
      }

      // Preparar datos para el backend (mantener camelCase, el backend los mapeará)
      const datosParaBackend = {
        nombre: nombre,
        apellido: apellido,
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento,
        foto: formData.foto || null,
        estado: 'activo',
        observaciones: null
      };

      console.log('📤 Enviando datos al backend:', datosParaBackend);
      console.log('🔍 formData original:', formData);
      console.log('🔍 Validación de campos:');
      console.log('  - nombre:', formData.nombre, 'trim:', nombre, 'length:', nombre.length);
      console.log('  - apellido:', formData.apellido, 'trim:', apellido, 'length:', apellido.length);
      console.log('  - tipoDocumento:', formData.tipoDocumento);
      console.log('  - numeroDocumento:', formData.numeroDocumento, 'trim:', numeroDocumento, 'length:', numeroDocumento.length);
      console.log('🔍 Verificación de campos obligatorios:');
      console.log('  - nombre válido:', !!nombre);
      console.log('  - apellido válido:', !!apellido);
      console.log('  - tipoDocumento válido:', !!tipoDocumento);
      console.log('  - numeroDocumento válido:', !!numeroDocumento);

      if (editingPerson) {
        // Actualizar persona existente
        const response = await api.put(`/api/enrolamiento/personas/${editingPerson.id}`, datosParaBackend);
        if (response.data.success) {
          const personasActualizadas = personas.map(p => 
            p.id === editingPerson.id ? response.data.data : p
          );
          setPersonas(personasActualizadas);
          mostrarSnackbar('Persona actualizada exitosamente', 'success');
          cerrarDialog();
          cargarPersonas();
          fetchEstadisticas();
        }
      } else {
        // Crear nueva persona
        const response = await api.post('/api/enrolamiento/personas', datosParaBackend);
        if (response.data.success) {
          setPersonas(prev => [response.data.data, ...prev]);
          mostrarSnackbar('Persona registrada exitosamente', 'success');
          cerrarDialog();
          cargarPersonas();
          fetchEstadisticas();
        }
      }
    } catch (error) {
      console.error('Error al guardar persona:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let message = 'Error al guardar persona';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
        console.log('🔍 Usando mensaje del backend:', message);
      } else if (error.response?.data?.camposFaltantes) {
        message = `Campos faltantes: ${error.response.data.camposFaltantes.join(', ')}`;
      } else if (error.response?.status === 400) {
        message = 'Datos inválidos. Verifique que todos los campos estén completos y tengan el formato correcto.';
      } else if (error.response?.status === 409) {
        message = error.response.data.message || 'Usuario ya registrado';
        console.log('🔍 Error 409 - Mensaje:', message);
      } else if (error.response?.status === 500) {
        message = 'Error interno del servidor. Intente nuevamente.';
      }
      
      console.log('🔍 Mostrando snackbar con mensaje:', message);
      mostrarSnackbar(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (persona) => {
    setEditingPerson(persona);
    setFormData({
      nombre: persona.nombre,
      apellido: persona.apellido,
      tipoDocumento: persona.tipoDocumento,
      numeroDocumento: persona.numeroDocumento,
      foto: null,
      fotoPreview: persona.fotoUrl || persona.foto,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta persona?')) {
      try {
        const response = await api.delete(`/api/enrolamiento/personas/${id}`);
        if (response.data.success) {
          setPersonas(prev => prev.filter(p => p.id !== id));
          mostrarSnackbar('Persona eliminada exitosamente', 'success');
          fetchEstadisticas();
        }
      } catch (error) {
        console.error('Error al eliminar persona:', error);
        const message = error.response?.data?.message || 'Error al eliminar persona';
        mostrarSnackbar(message, 'error');
      }
    }
  };

  const abrirDialog = () => {
    setEditingPerson(null);
    setModalMode('search'); // Resetear al modo búsqueda por defecto
    setFormData({
      nombre: '',
      apellido: '',
      tipoDocumento: 'RUN', // Mantener valor por defecto
      numeroDocumento: '',
      foto: null,
      fotoPreview: null,
    });
    setDialogOpen(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setEditingPerson(null);
    setModalMode('search'); // Resetear al modo búsqueda
    setErrorMessage(''); // Limpiar mensaje de error
    setFormData({
      nombre: '',
      apellido: '',
      tipoDocumento: 'RUN', // Mantener valor por defecto
      numeroDocumento: '',
      foto: null,
      fotoPreview: null,
    });
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    console.log('🔍 mostrarSnackbar llamado:', { message, severity });
    setSnackbar({ open: true, message, severity });
    
    // Si es un error, también guardar el mensaje para mostrar en el modal
    if (severity === 'error') {
      console.log('🔍 Estableciendo errorMessage:', message);
      setErrorMessage(message);
    } else {
      console.log('🔍 Limpiando errorMessage');
      setErrorMessage(''); // Limpiar mensaje de error en caso de éxito
    }
  };

  const personasFiltradas = personas.filter(persona =>
    `${persona.nombre} ${persona.apellido} ${persona.numeroDocumento}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  };

  if (loading && personas.length === 0) {
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
          <Face sx={{ fontSize: '2rem', mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Enrolamiento de Personas - V2.0
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
                      {estadisticas.total_personas || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Total de Personas
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
                      {estadisticas.personas_activas || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Personas Activas
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
                      {estadisticas.personas_inactivas || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Personas Inactivas
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
                      {estadisticas.personas_suspendidas || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.875rem' }}>
                      Personas Suspendidas
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
              placeholder="Buscar personas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  cargarPersonas();
                }
              }}
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
              <InputLabel>Tipo Documento</InputLabel>
              <Select
                value={filterTipoDocumento}
                onChange={(e) => setFilterTipoDocumento(e.target.value)}
                label="Tipo Documento"
                sx={{
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.grey[300],
                  },
                }}
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                {tiposDocumento.map(tipo => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
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
                <MenuItem value="suspendido">Suspendido</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={abrirDialog}
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
              Nueva Persona
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => {
                cargarPersonas();
                fetchEstadisticas();
              }}
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

        {/* Tabla de personas */}
        <Paper sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden', mb: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 80 }}>Foto</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}>Persona</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 180 }}>Documento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {personasFiltradas
                  .slice(pagination.page * pagination.rowsPerPage, (pagination.page + 1) * pagination.rowsPerPage)
                  .map((persona) => (
                    <TableRow key={persona.id} hover sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      <TableCell>
                        <Avatar
                          src={persona.fotoUrl || persona.foto}
                          sx={{ width: 50, height: 50 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {persona.nombre} {persona.apellido}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            label={persona.tipoDocumento}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5, borderColor: theme.palette.primary.main }}
                          />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {persona.numeroDocumento}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={persona.estado === 'activo' ? 'Activo' : persona.estado || 'Activo'}
                          color={persona.estado === 'activo' ? 'success' : persona.estado === 'inactivo' ? 'warning' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(persona)}
                            sx={{ 
                              color: theme.palette.primary.main,
                              '&:hover': { bgcolor: theme.palette.primary.light + '20' }
                            }}
                            title="Editar persona"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(persona.id)}
                            sx={{ 
                              color: theme.palette.error.main,
                              '&:hover': { bgcolor: theme.palette.error.light + '20' }
                            }}
                            title="Eliminar persona"
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

          <TablePagination
            component="div"
            count={personasFiltradas.length}
            page={pagination.page}
            onPageChange={handleChangePage}
            rowsPerPage={pagination.rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>

        {/* Dialog para crear/editar persona */}
        <Dialog
          open={dialogOpen}
          onClose={submitting ? undefined : cerrarDialog}
          maxWidth="md"
          fullWidth
          disableEscapeKeyDown={submitting}
        >
          <DialogTitle>
            {editingPerson ? 'Editar Persona' : 'Nueva Persona'}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Complete los campos requeridos para {editingPerson ? 'actualizar' : 'registrar'} la persona
            </Typography>
            {!editingPerson && (
              <Box sx={{ mt: 2 }}>
                {/* Opciones de modo */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Button
                    variant={modalMode === 'search' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setModalMode('search')}
                    startIcon={<RadioButtonChecked />}
                    sx={{ 
                      minWidth: '150px',
                      bgcolor: modalMode === 'search' ? 'primary.main' : 'transparent'
                    }}
                  >
                    Búsqueda por Cédula
                  </Button>
                  <Button
                    variant={modalMode === 'manual' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setModalMode('manual')}
                    startIcon={<Edit />}
                    sx={{ 
                      minWidth: '150px',
                      bgcolor: modalMode === 'manual' ? 'primary.main' : 'transparent'
                    }}
                  >
                    Ingreso Manual
                  </Button>
                  
                  {/* Leyenda del mensaje de error */}
                  {(() => {
                    console.log('🔍 Renderizando leyenda - errorMessage:', errorMessage);
                    return errorMessage && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        ml: 2,
                        p: 1,
                        bgcolor: 'error.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'error.main'
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'error.main',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        >
                          ⚠️ {errorMessage}
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
                
                {/* Indicador del modo activo */}
                {modalMode === 'search' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <RadioButtonChecked sx={{ color: 'white', fontSize: '1rem', mr: 1 }} />
                    <Typography variant="caption" color="white" sx={{ fontWeight: 'bold' }}>
                      Lector activo - Escanee documento para llenar automáticamente nombre y apellido
                    </Typography>
                  </Box>
                )}
                
                {modalMode === 'manual' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Edit sx={{ color: 'white', fontSize: '1rem', mr: 1 }} />
                    <Typography variant="caption" color="white" sx={{ fontWeight: 'bold' }}>
                      Modo manual - Ingrese los datos directamente en los campos
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {/* Input del lector - solo activo en modo búsqueda */}
              {modalMode === 'search' && (
                <Box sx={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                  <input
                    ref={lectorInputRef}
                    type="text"
                    style={{ 
                      width: '1px',
                      height: '1px',
                      padding: 0,
                      border: 'none',
                      fontSize: '1px',
                      backgroundColor: 'transparent',
                      color: 'transparent'
                    }}
                    onChange={(e) => {
                      // Limpiar campos ANTES de procesar cuando se detecta nueva lectura
                      if (e.target.value.length > 10) { // Solo procesar si hay datos suficientes
                        // Limpiar solo nombre y apellido ANTES de procesar
                        console.log('🧹 LIMPIANDO NOMBRE Y APELLIDO ANTES DE NUEVA LECTURA');
                        setFormData(prev => ({
                          ...prev,
                          nombre: '',
                          apellido: '',
                          debugValue: e.target.value // Guardar el valor para debug
                          // NO limpiar tipoDocumento, numeroDocumento, foto para mantener valores existentes
                        }));
                        
                        // Procesar después de limpiar
                        setTimeout(() => {
                          procesarValorLector(e.target.value);
                        }, 50); // Pequeño delay para asegurar que se limpien los campos
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        procesarValorLector(e.target.value);
                      }
                    }}
                    onBlur={(e) => {
                      // Mantener el foco en el input del lector inmediatamente
                      e.preventDefault();
                      e.stopPropagation();
                      setTimeout(() => {
                        if (lectorInputRef.current) {
                          lectorInputRef.current.focus();
                        }
                      }, 1);
                    }}
                    onFocus={() => {
                      // Confirmar que el foco está en el input
                      console.log('🎯 Input del lector enfocado');
                    }}
                    onClick={(e) => {
                      // Asegurar foco al hacer clic
                      e.preventDefault();
                      e.stopPropagation();
                      if (lectorInputRef.current) {
                        lectorInputRef.current.focus();
                      }
                    }}
                    onMouseEnter={() => {
                      // Asegurar foco al pasar el mouse
                      if (lectorInputRef.current) {
                        lectorInputRef.current.focus();
                      }
                    }}
                    onMouseDown={(e) => {
                      // Prevenir que otros elementos tomen el foco
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    placeholder=""
                    autoFocus
                    tabIndex={0}
                  />
                  
                  {/* Input temporal para debug - SOLO PARA DESARROLLO */}
                  <Box sx={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, bgcolor: 'rgba(0,0,0,0.8)', p: 2, borderRadius: 1, color: 'white', fontSize: '12px' }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      🔍 DEBUG - Último valor del lector:
                    </Typography>
                    <input
                      type="text"
                      placeholder="Valor del lector aquí..."
                      style={{
                        width: '300px',
                        padding: '4px',
                        fontSize: '10px',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                      readOnly
                      value={formData.debugValue || ''}
                    />
                  </Box>
                </Box>
              )}
              
                              <Grid container spacing={3}>
                  {/* Foto */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={formData.fotoPreview || formData.fotoUrl}
                        sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                      />
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="foto-input"
                        type="file"
                        onChange={handleFotoChange}
                        capture="user"
                        disabled={submitting}
                      />
                      <label htmlFor="foto-input">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<PhotoCamera />}
                          fullWidth
                          disabled={submitting}
                        >
                          {formData.fotoPreview ? 'Cambiar Foto' : 'Tomar Foto'}
                        </Button>
                      </label>
                      {formData.fotoPreview && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setFormData(prev => ({ ...prev, foto: null, fotoPreview: null }))}
                          sx={{ mt: 1 }}
                          disabled={submitting}
                        >
                          Eliminar Foto
                        </Button>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Formatos soportados: JPG, PNG, GIF. Máximo 5MB.
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Información personal */}
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                          disabled={submitting}
                          inputProps={{
                            maxLength: 100,
                            minLength: 2
                          }}
                          error={formData.nombre && (formData.nombre.trim().length < 2 || formData.nombre.trim().length > 100)}
                          helperText={
                            modalMode === 'search' 
                              ? 'Se llena automáticamente con el lector' 
                              : formData.nombre && (formData.nombre.trim().length < 2 || formData.nombre.trim().length > 100)
                                ? 'El nombre debe tener entre 2 y 100 caracteres'
                                : 'Mínimo 2 caracteres, máximo 100'
                          }
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: modalMode === 'search' ? 'action.hover' : 'transparent'
                            }
                          }}
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
                          disabled={submitting}
                          inputProps={{
                            maxLength: 100,
                            minLength: 2
                          }}
                          error={formData.apellido && (formData.apellido.trim().length < 2 || formData.apellido.trim().length > 100)}
                          helperText={
                            modalMode === 'search' 
                              ? 'Se llena automáticamente con el lector' 
                              : formData.apellido && (formData.apellido.trim().length < 2 || formData.apellido.trim().length > 100)
                                ? 'El apellido debe tener entre 2 y 100 caracteres'
                                : 'Mínimo 2 caracteres, máximo 100'
                          }
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: modalMode === 'search' ? 'action.hover' : 'transparent'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Tipo de Documento</InputLabel>
                          <Select
                            name="tipoDocumento"
                            value={formData.tipoDocumento}
                            onChange={handleInputChange}
                            label="Tipo de Documento"
                            disabled={submitting}
                          >
                            {tiposDocumento.map((tipo) => (
                              <MenuItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Número de Documento"
                          name="numeroDocumento"
                          value={formData.numeroDocumento}
                          onChange={handleInputChange}
                          required
                          disabled={submitting}
                          inputProps={{
                            maxLength: 20,
                            minLength: 3
                          }}
                          error={formData.numeroDocumento && (formData.numeroDocumento.trim().length < 3 || formData.numeroDocumento.trim().length > 20)}
                          helperText={
                            modalMode === 'search' 
                              ? 'Se llena automáticamente con el lector' 
                              : formData.numeroDocumento && (formData.numeroDocumento.trim().length < 3 || formData.numeroDocumento.trim().length > 20)
                                ? 'El número de documento debe tener entre 3 y 20 caracteres'
                                : formData.tipoDocumento === 'RUN' 
                                  ? 'Formato: 12345678-9 (mínimo 3 caracteres)'
                                  : 'Mínimo 3 caracteres, máximo 20'
                          }
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: modalMode === 'search' ? 'action.hover' : 'transparent'
                            }
                          }}
                        />
                      </Grid>
 
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarDialog} disabled={submitting}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: theme.palette.primary.main }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {editingPerson ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                editingPerson ? 'Actualizar' : 'Registrar'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ 
            zIndex: 9999,
            '& .MuiSnackbar-root': {
              zIndex: 9999
            }
          }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              zIndex: 9999,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Enrolamiento;
