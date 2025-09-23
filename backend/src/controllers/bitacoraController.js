const { Audit, User, Profile } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los eventos de bitácora con paginación y filtros
const getBitacora = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tipo = '', nivel = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Filtro de búsqueda
    if (search) {
      whereClause = {
        [Op.or]: [
          { accion: { [Op.iLike]: `%${search}%` } },
          { timestamp: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Filtro por tipo (si existe en el modelo)
    if (tipo && tipo !== 'todos') {
      whereClause.tipo = tipo;
    }
    
    // Filtro por nivel (si existe en el modelo)
    if (nivel && nivel !== 'todos') {
      whereClause.nivel = nivel;
    }
    
    const { count, rows: eventos } = await Audit.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nombre', 'apellido', 'username'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['id', 'nombre', 'descripcion']
            }
          ]
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: eventos,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo bitácora:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de bitácora
const getEstadisticas = async (req, res) => {
  try {
    const total = await Audit.count();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);
    
    const eventosHoy = await Audit.count({
      where: {
        timestamp: {
          [Op.between]: [hoy, hoyFin]
        }
      }
    });
    
    // Estadísticas por tipo de acción (si el modelo lo soporta)
    const acciones = await Audit.findAll({
      attributes: [
        'accion',
        [Audit.sequelize.fn('COUNT', Audit.sequelize.col('id')), 'cantidad']
      ],
      group: ['accion'],
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        total_eventos: total,
        eventos_hoy: eventosHoy,
        acciones_mas_comunes: acciones.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de bitácora:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un evento específico por ID
const getEventoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Audit.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nombre', 'apellido', 'username']
        }
      ]
    });
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: evento
    });
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear un nuevo evento de bitácora
const createEvento = async (req, res) => {
  try {
    const { accion, usuario_id } = req.body;
    
    const evento = await Audit.create({
      accion,
      usuario_id: usuario_id || req.user.id,
      timestamp: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: evento,
      message: 'Evento creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un evento existente
const updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion } = req.body;
    
    const evento = await Audit.findByPk(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    await evento.update({ accion });
    
    res.json({
      success: true,
      data: evento,
      message: 'Evento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar un evento
const deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Audit.findByPk(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    await evento.destroy();
    
    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getBitacora,
  getEstadisticas,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento
};
