const Residente = require('../models/Residente');
const { Op } = require('sequelize');

// Obtener todos los residentes con paginación y filtros
const getResidentes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      estado = '', 
      tipo_residente = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condiciones de búsqueda
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { apellido_paterno: { [Op.iLike]: `%${search}%` } },
        { apellido_materno: { [Op.iLike]: `%${search}%` } },
        { documento: { [Op.iLike]: `%${search}%` } },
        { direccion_residencia: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (estado) {
      whereClause.estado = estado;
    }
    
    if (tipo_residente) {
      whereClause.tipo_residente = tipo_residente;
    }

    // Validar ordenamiento
    const validSortFields = ['nombre', 'apellido_paterno', 'documento', 'fecha_ingreso', 'estado', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: residentes } = await Residente.findAndCountAll({
      where: whereClause,
      order: [[finalSortBy, finalSortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'nombre', 'apellido_paterno', 'apellido_materno', 'tipo_documento', 
        'documento', 'fecha_nacimiento', 'telefono', 'email', 'direccion_residencia',
        'numero_residencia', 'tipo_residencia', 'fecha_ingreso', 'estado', 
        'tipo_residente', 'vehiculos', 'mascotas', 'ocupantes', 'observaciones',
        'foto_url', 'created_at', 'updated_at'
      ]
    });

    // Formatear datos para el frontend
    const residentesFormateados = residentes.map(residente => ({
      id: residente.id,
      nombre: residente.nombre,
      apellidoPaterno: residente.apellido_paterno,
      apellidoMaterno: residente.apellido_materno,
      tipoDocumento: residente.tipo_documento,
      documento: residente.documento,
      fecha_nacimiento: residente.fecha_nacimiento,
      telefono: residente.telefono,
      email: residente.email,
      direccionResidencia: residente.direccion_residencia,
      numeroResidencia: residente.numero_residencia,
      tipoResidencia: residente.tipo_residencia,
      fecha_ingreso: residente.fecha_ingreso,
      estado: residente.estado,
      tipoResidente: residente.tipo_residente,
      vehiculos: residente.vehiculos || [],
      mascotas: residente.mascotas || [],
      ocupantes: residente.ocupantes || [],
      observaciones: residente.observaciones,
      fotoUrl: residente.foto_url,
      createdAt: residente.created_at,
      updatedAt: residente.updated_at
    }));

    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        residentes: residentesFormateados,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo residentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener un residente por ID
const getResidenteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente no encontrado'
      });
    }

    // Formatear datos para el frontend
    const residenteFormateado = {
      id: residente.id,
      nombre: residente.nombre,
      apellidoPaterno: residente.apellido_paterno,
      apellidoMaterno: residente.apellido_materno,
      tipoDocumento: residente.tipo_documento,
      documento: residente.documento,
      fecha_nacimiento: residente.fecha_nacimiento,
      telefono: residente.telefono,
      email: residente.email,
      direccionResidencia: residente.direccion_residencia,
      numeroResidencia: residente.numero_residencia,
      tipoResidencia: residente.tipo_residencia,
      fecha_ingreso: residente.fecha_ingreso,
      estado: residente.estado,
      tipoResidente: residente.tipo_residente,
      vehiculos: residente.vehiculos || [],
      mascotas: residente.mascotas || [],
      ocupantes: residente.ocupantes || [],
      observaciones: residente.observaciones,
      fotoUrl: residente.foto_url,
      createdAt: residente.created_at,
      updatedAt: residente.updated_at
    };

    res.json({
      success: true,
      data: residenteFormateado
    });

  } catch (error) {
    console.error('❌ Error obteniendo residente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear un nuevo residente
const createResidente = async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      tipo_documento,
      documento,
      fecha_nacimiento,
      telefono,
      email,
      direccion_residencia,
      numero_residencia,
      tipo_residencia,
      fecha_ingreso,
      estado,
      tipo_residente,
      vehiculos,
      mascotas,
      ocupantes,
      observaciones,
      foto_url
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido_paterno || !tipo_documento || !documento || !direccion_residencia || !numero_residencia) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, apellido paterno, tipo de documento, documento, dirección y número de residencia son obligatorios'
      });
    }

    // Verificar si ya existe un residente con el mismo documento
    const residenteExistente = await Residente.findOne({
      where: { documento: documento.trim() }
    });

    if (residenteExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un residente con este número de documento'
      });
    }

    // Crear el residente
    const nuevoResidente = await Residente.create({
      nombre: nombre.trim(),
      apellido_paterno: apellido_paterno.trim(),
      apellido_materno: apellido_materno ? apellido_materno.trim() : null,
      tipo_documento,
      documento: documento.trim(),
      fecha_nacimiento: fecha_nacimiento || null,
      telefono: telefono ? telefono.trim() : null,
      email: email ? email.trim().toLowerCase() : null,
      direccion_residencia: direccion_residencia.trim(),
      numero_residencia: numero_residencia.trim(),
      tipo_residencia: tipo_residencia || 'departamento',
      fecha_ingreso: fecha_ingreso || new Date(),
      estado: estado || 'activo',
      tipo_residente: tipo_residente || 'propietario',
      vehiculos: vehiculos || [],
      mascotas: mascotas || [],
      ocupantes: ocupantes || [],
      observaciones: observaciones ? observaciones.trim() : null,
      foto_url: foto_url || null,
      created_by: req.user?.id || null
    });

    // Formatear respuesta
    const residenteFormateado = {
      id: nuevoResidente.id,
      nombre: nuevoResidente.nombre,
      apellidoPaterno: nuevoResidente.apellido_paterno,
      apellidoMaterno: nuevoResidente.apellido_materno,
      tipoDocumento: nuevoResidente.tipo_documento,
      documento: nuevoResidente.documento,
      fecha_nacimiento: nuevoResidente.fecha_nacimiento,
      telefono: nuevoResidente.telefono,
      email: nuevoResidente.email,
      direccionResidencia: nuevoResidente.direccion_residencia,
      numeroResidencia: nuevoResidente.numero_residencia,
      tipoResidencia: nuevoResidente.tipo_residencia,
      fecha_ingreso: nuevoResidente.fecha_ingreso,
      estado: nuevoResidente.estado,
      tipoResidente: nuevoResidente.tipo_residente,
      vehiculos: nuevoResidente.vehiculos,
      mascotas: nuevoResidente.mascotas,
      ocupantes: nuevoResidente.ocupantes,
      observaciones: nuevoResidente.observaciones,
      fotoUrl: nuevoResidente.foto_url,
      createdAt: nuevoResidente.created_at,
      updatedAt: nuevoResidente.updated_at
    };

    res.status(201).json({
      success: true,
      message: 'Residente creado exitosamente',
      data: residenteFormateado
    });

  } catch (error) {
    console.error('❌ Error creando residente:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar un residente existente
const updateResidente = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    
    

    // Buscar el residente
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente no encontrado'
      });
    }

    // Limpiar campos vacíos ANTES de validar campos obligatorios
    const camposParaLimpiar = ['email', 'telefono', 'apellido_materno', 'fecha_nacimiento', 'fecha_ingreso', 'observaciones', 'numero_residencia'];
    
    camposParaLimpiar.forEach(campo => {
      if (updateData[campo] !== undefined) {
        if (updateData[campo] && updateData[campo].toString().trim()) {
          // Limpiar y formatear el campo
          if (campo === 'email') {
            updateData[campo] = updateData[campo].trim().toLowerCase();
          } else {
            updateData[campo] = updateData[campo].toString().trim();
          }
        } else {
          // Eliminar campo vacío para evitar validaciones
          delete updateData[campo];
        }
      }
    });

    // Validar que todos los campos obligatorios estén presentes
    const camposObligatorios = [
      'nombre', 'apellido_paterno', 'apellido_materno', 'tipo_documento', 
      'documento', 'fecha_nacimiento', 'telefono', 'email', 
      'direccion_residencia', 'numero_residencia', 'tipo_residencia', 
      'fecha_ingreso', 'estado', 'tipo_residente', 'observaciones'
    ];
    
    const camposFaltantes = camposObligatorios.filter(campo => 
      !updateData[campo] || updateData[campo].toString().trim() === ''
    );
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
        camposFaltantes: camposFaltantes
      });
    }

    // Si se está actualizando el documento, verificar que no exista otro con el mismo
    if (updateData.documento && updateData.documento !== residente.documento) {
      const residenteExistente = await Residente.findOne({
        where: { 
          documento: updateData.documento.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (residenteExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otro residente con este número de documento'
        });
      }
    }

    // Limpiar y validar datos
    if (updateData.nombre) updateData.nombre = updateData.nombre.trim();
    if (updateData.apellido_paterno) updateData.apellido_paterno = updateData.apellido_paterno.trim();
    if (updateData.apellido_materno) updateData.apellido_materno = updateData.apellido_materno.trim();
    if (updateData.documento) updateData.documento = updateData.documento.trim();
    if (updateData.telefono) updateData.telefono = updateData.telefono.trim();
    if (updateData.direccion_residencia) updateData.direccion_residencia = updateData.direccion_residencia.trim();
    

    // Agregar campo de auditoría
    updateData.updated_by = req.user?.id || null;

    // Actualizar el residente usando set() para evitar validaciones automáticas
    Object.keys(updateData).forEach(key => {
      residente.set(key, updateData[key]);
    });
    await residente.save();

    // Formatear respuesta
    const residenteActualizado = {
      id: residente.id,
      nombre: residente.nombre,
      apellidoPaterno: residente.apellido_paterno,
      apellidoMaterno: residente.apellido_materno,
      tipoDocumento: residente.tipo_documento,
      documento: residente.documento,
      fecha_nacimiento: residente.fecha_nacimiento,
      telefono: residente.telefono,
      email: residente.email,
      direccionResidencia: residente.direccion_residencia,
      numeroResidencia: residente.numero_residencia,
      tipoResidencia: residente.tipo_residencia,
      fecha_ingreso: residente.fecha_ingreso,
      estado: residente.estado,
      tipoResidente: residente.tipo_residente,
      vehiculos: residente.vehiculos,
      mascotas: residente.mascotas,
      ocupantes: residente.ocupantes,
      observaciones: residente.observaciones,
      fotoUrl: residente.foto_url,
      createdAt: residente.created_at,
      updatedAt: residente.updated_at
    };

    res.json({
      success: true,
      message: 'Residente actualizado exitosamente',
      data: residenteActualizado
    });

  } catch (error) {
    console.error('❌ Error actualizando residente:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar un residente
const deleteResidente = async (req, res) => {
  try {
    const { id } = req.params;
    
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente no encontrado'
      });
    }

    // Eliminar el residente
    await residente.destroy();

    res.json({
      success: true,
      message: 'Residente eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando residente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas de residentes
const getEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Residente.getEstadisticas();
    
    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getResidentes,
  getResidenteById,
  createResidente,
  updateResidente,
  deleteResidente,
  getEstadisticas
};
