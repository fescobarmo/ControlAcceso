const { Residente } = require('../models');
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
        { apellido_paterno: { [Op.iLike]: `%${search}%` } },
        { documento: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (estado) {
      whereClause.estado = estado;
    }
    
    if (tipo_documento) {
      whereClause.tipo_documento = tipo_documento;
    }

    // Validar ordenamiento
    const validSortFields = ['nombre', 'apellido_paterno', 'documento', 'fecha_ingreso', 'estado', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: personas } = await Residente.findAndCountAll({
      where: whereClause,
      order: [[finalSortBy, finalSortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'nombre', 'apellido_paterno', 'apellido_materno', 'tipo_documento', 'documento',
        'foto_url', 'estado', 'fecha_ingreso', 'observaciones',
        'created_at', 'updated_at'
      ]
    });

    // Formatear datos para el frontend
    const personasFormateadas = personas.map(persona => ({
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido_paterno,
      apellidoMaterno: persona.apellido_materno,
      tipoDocumento: persona.tipo_documento,
      numeroDocumento: persona.documento,
      fotoUrl: persona.foto_url,
      estado: persona.estado,
      fechaRegistro: persona.fecha_ingreso,
      observaciones: persona.observaciones,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at
    }));

    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        personas: personasFormateadas
      },
      pagination: {
        total: count,
        page: parseInt(page),
        pages: totalPages,
        limit: parseInt(limit)
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

    const persona = await Residente.findByPk(id);

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
      apellido: persona.apellido_paterno,
      apellidoMaterno: persona.apellido_materno,
      tipoDocumento: persona.tipo_documento,
      numeroDocumento: persona.documento,
      fotoUrl: persona.foto_url,
      estado: persona.estado,
      fechaRegistro: persona.fecha_ingreso,
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
    console.log('📥 Datos recibidos en createPersona:', req.body);
    
    // Mapear campos del frontend (camelCase) al backend (snake_case)
    const { 
      nombre, 
      apellido,           // Frontend envía 'apellido'
      tipoDocumento,      // Frontend envía 'tipoDocumento'
      numeroDocumento,    // Frontend envía 'numeroDocumento'
      foto,               // Frontend envía 'foto'
      estado, 
      observaciones 
    } = req.body;

    // Mapear a los nombres esperados por el backend
    const apellido_paterno = apellido;
    const tipo_documento = tipoDocumento;
    const numero_documento = numeroDocumento;
    const foto_url = foto;

    // Logging detallado para debug
    console.log('🔍 Mapeo de campos:');
    console.log('  - Frontend -> Backend:');
    console.log('    apellido -> apellido_paterno:', apellido, '->', apellido_paterno);
    console.log('    tipoDocumento -> tipo_documento:', tipoDocumento, '->', tipo_documento);
    console.log('    numeroDocumento -> numero_documento:', numeroDocumento, '->', numero_documento);
    console.log('    foto -> foto_url:', foto, '->', foto_url);
    
    console.log('🔍 Validación de campos mapeados:');
    console.log('  - nombre:', nombre, 'tipo:', typeof nombre, 'válido:', !!nombre);
    console.log('  - apellido_paterno:', apellido_paterno, 'tipo:', typeof apellido_paterno, 'válido:', !!apellido_paterno);
    console.log('  - tipo_documento:', tipo_documento, 'tipo:', typeof tipo_documento, 'válido:', !!tipo_documento);
    console.log('  - numero_documento:', numero_documento, 'tipo:', typeof numero_documento, 'válido:', !!numero_documento);

    // Validar campos obligatorios con más detalle
    const camposFaltantes = [];
    if (!nombre || (typeof nombre === 'string' && !nombre.trim())) {
      camposFaltantes.push('nombre');
    }
    if (!apellido_paterno || (typeof apellido_paterno === 'string' && !apellido_paterno.trim())) {
      camposFaltantes.push('apellido_paterno');
    }
    if (!tipo_documento || (typeof tipo_documento === 'string' && !tipo_documento.trim())) {
      camposFaltantes.push('tipo_documento');
    }
    if (!numero_documento || (typeof numero_documento === 'string' && !numero_documento.trim())) {
      camposFaltantes.push('numero_documento');
    }

    if (camposFaltantes.length > 0) {
      console.log('❌ Campos faltantes o vacíos:', camposFaltantes);
      return res.status(400).json({
        success: false,
        message: `Los campos ${camposFaltantes.join(', ')} son obligatorios y no pueden estar vacíos`,
        camposFaltantes: camposFaltantes
      });
    }

    // Verificar si ya existe una persona con el mismo documento
    const personaExistente = await Residente.findOne({
      where: { documento: numero_documento.trim() }
    });

    if (personaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Usuario ya registrado'
      });
    }

    // Crear la persona
    const nuevaPersona = await Residente.create({
      nombre: nombre.trim(),
      apellido_paterno: apellido_paterno.trim(),
      tipo_documento,
      documento: numero_documento.trim(),
      foto_url: foto_url || null,
      estado: estado || 'activo',
      observaciones: observaciones ? observaciones.trim() : null,
      created_by: req.user?.id || null
    });

    // Formatear respuesta
    const personaFormateada = {
      id: nuevaPersona.id,
      nombre: nuevaPersona.nombre,
      apellido: nuevaPersona.apellido_paterno,
      apellidoMaterno: nuevaPersona.apellido_materno,
      tipoDocumento: nuevaPersona.tipo_documento,
      numeroDocumento: nuevaPersona.documento,
      fotoUrl: nuevaPersona.foto_url,
      estado: nuevaPersona.estado,
      fechaRegistro: nuevaPersona.fecha_ingreso,
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
    const updateData = { ...req.body };

    // Verificar que la persona existe
    const persona = await Residente.findByPk(id);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    // Si se está actualizando el documento, verificar que no exista otra con el mismo
    if (updateData.numero_documento && updateData.numero_documento !== persona.documento) {
      const personaExistente = await Residente.findOne({
        where: { 
          documento: updateData.numero_documento.trim(),
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
    if (updateData.apellido_paterno) updateData.apellido_paterno = updateData.apellido_paterno.trim();
    if (updateData.numero_documento) updateData.documento = updateData.numero_documento.trim();
    if (updateData.observaciones) updateData.observaciones = updateData.observaciones.trim();

    // Agregar campo de auditoría
    updateData.updated_by = req.user?.id || null;

    // Actualizar la persona
    await persona.update(updateData);

    // Formatear respuesta
    const personaFormateada = {
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido_paterno,
      apellidoMaterno: persona.apellido_materno,
      tipoDocumento: persona.tipo_documento,
      numeroDocumento: persona.documento,
      fotoUrl: persona.foto_url,
      estado: persona.estado,
      fechaRegistro: persona.fecha_ingreso,
      observaciones: persona.observaciones,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at
    };

    res.json({
      success: true,
      message: 'Persona actualizada exitosamente',
      data: personaFormateada
    });

  } catch (error) {
    console.error('❌ Error actualizando persona:', error);
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

    const persona = await Residente.findByPk(id);

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

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
    const total = await Residente.count();
    const activos = await Residente.count({ where: { estado: 'activo' } });
    const inactivos = await Residente.count({ where: { estado: 'inactivo' } });
    const suspendidos = await Residente.count({ where: { estado: 'suspendido' } });
    
    const estadisticas = {
      total_personas: total,
      personas_activas: activos,
      personas_inactivas: inactivos,
      personas_pendientes: suspendidos // Mapear suspendidos a pendientes para compatibilidad
    };
    
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