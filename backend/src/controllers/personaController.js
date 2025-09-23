const Persona = require('../models/Persona');
const { Op } = require('sequelize');

// Obtener todas las personas con paginación y filtros
const getPersonas = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      estado = '', 
      tipo_documento = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condiciones de búsqueda
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { apellido: { [Op.iLike]: `%${search}%` } },
        { numero_documento: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (estado) {
      whereClause.estado = estado;
    }
    
    if (tipo_documento) {
      whereClause.tipo_documento = tipo_documento;
    }

    // Validar ordenamiento
    const validSortFields = ['nombre', 'apellido', 'numero_documento', 'fecha_registro', 'estado', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: personas } = await Persona.findAndCountAll({
      where: whereClause,
      order: [[finalSortBy, finalSortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'nombre', 'apellido', 'tipo_documento', 'numero_documento',
        'foto_url', 'estado', 'fecha_registro', 'observaciones',
        'created_at', 'updated_at'
      ]
    });

    // Formatear datos para el frontend
    const personasFormateadas = personas.map(persona => ({
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      tipoDocumento: persona.tipo_documento,
      numeroDocumento: persona.numero_documento,
      fotoUrl: persona.foto_url,
      estado: persona.estado,
      fechaRegistro: persona.fecha_registro,
      observaciones: persona.observaciones,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at
    }));

    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        personas: personasFormateadas,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo personas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener una persona por ID
const getPersonaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const persona = await Persona.findByPk(id);
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    // Formatear datos para el frontend
    const personaFormateada = {
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      tipoDocumento: persona.tipo_documento,
      numeroDocumento: persona.numero_documento,
      fotoUrl: persona.foto_url,
      estado: persona.estado,
      fechaRegistro: persona.fecha_registro,
      observaciones: persona.observaciones,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at
    };

    res.json({
      success: true,
      data: personaFormateada
    });

  } catch (error) {
    console.error('❌ Error obteniendo persona:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear una nueva persona
const createPersona = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      foto_url,
      estado,
      observaciones
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido || !tipo_documento || !numero_documento) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, apellido, tipo de documento y número de documento son obligatorios'
      });
    }

    // Verificar si ya existe una persona con el mismo documento
    const personaExistente = await Persona.findOne({
      where: { numero_documento: numero_documento.trim() }
    });

    if (personaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una persona con este número de documento'
      });
    }

    // Crear la persona
    const nuevaPersona = await Persona.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      tipo_documento,
      numero_documento: numero_documento.trim(),
      foto_url: foto_url || null,
      estado: estado || 'activo',
      observaciones: observaciones ? observaciones.trim() : null,
      created_by: req.user?.id || null
    });

    // Formatear respuesta
    const personaFormateada = {
      id: nuevaPersona.id,
      nombre: nuevaPersona.nombre,
      apellido: nuevaPersona.apellido,
      tipoDocumento: nuevaPersona.tipo_documento,
      numeroDocumento: nuevaPersona.numero_documento,
      fotoUrl: nuevaPersona.foto_url,
      estado: nuevaPersona.estado,
      fechaRegistro: nuevaPersona.fecha_registro,
      observaciones: nuevaPersona.observaciones,
      createdAt: nuevaPersona.created_at,
      updatedAt: nuevaPersona.updated_at
    };

    res.status(201).json({
      success: true,
      message: 'Persona creada exitosamente',
      data: personaFormateada
    });

  } catch (error) {
    console.error('❌ Error creando persona:', error);
    
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

// Actualizar una persona existente
const updatePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Buscar la persona
    const persona = await Persona.findByPk(id);
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    // Si se está actualizando el documento, verificar que no exista otra con el mismo
    if (updateData.numero_documento && updateData.numero_documento !== persona.numero_documento) {
      const personaExistente = await Persona.findOne({
        where: { 
          numero_documento: updateData.numero_documento.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (personaExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otra persona con este número de documento'
        });
      }
    }

    // Limpiar y validar datos
    if (updateData.nombre) updateData.nombre = updateData.nombre.trim();
    if (updateData.apellido) updateData.apellido = updateData.apellido.trim();
    if (updateData.numero_documento) updateData.numero_documento = updateData.numero_documento.trim();
    if (updateData.observaciones) updateData.observaciones = updateData.observaciones.trim();

    // Agregar campo de auditoría
    updateData.updated_by = req.user?.id || null;

    // Actualizar la persona
    await persona.update(updateData);

    // Formatear respuesta
    const personaActualizada = {
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      tipoDocumento: persona.tipo_documento,
      numeroDocumento: persona.numero_documento,
      fotoUrl: persona.foto_url,
      estado: persona.estado,
      fechaRegistro: persona.fecha_registro,
      observaciones: persona.observaciones,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at
    };

    res.json({
      success: true,
      message: 'Persona actualizada exitosamente',
      data: personaActualizada
    });

  } catch (error) {
    console.error('❌ Error actualizando persona:', error);
    
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

// Eliminar una persona
const deletePersona = async (req, res) => {
  try {
    const { id } = req.params;
    
    const persona = await Persona.findByPk(id);
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    // Eliminar la persona
    await persona.destroy();

    res.json({
      success: true,
      message: 'Persona eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando persona:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas de personas
const getEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Persona.getEstadisticas();
    
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
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  getEstadisticas
};
