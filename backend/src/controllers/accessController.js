const { AccessLog, User, Area } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const accessController = {
  // Obtener todos los accesos
  async getAllAccess(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows: access } = await AccessLog.findAndCountAll({
        include: [
          { model: User, as: 'user', attributes: ['id', 'nombre', 'apellido'] },
          { model: Area, as: 'area', attributes: ['id', 'nombre'] }
        ],
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: access,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo accesos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener acceso por ID
  async getAccessById(req, res) {
    try {
      const { id } = req.params;
      
      const access = await AccessLog.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'nombre', 'apellido'] },
          { model: Area, as: 'area', attributes: ['id', 'nombre'] }
        ]
      });

      if (!access) {
        return res.status(404).json({
          success: false,
          message: 'Acceso no encontrado'
        });
      }

      res.json({
        success: true,
        data: access
      });
    } catch (error) {
      console.error('Error obteniendo acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Crear nuevo acceso
  async createAccess(req, res) {
    try {
      const { usuario_id, area_id, dispositivo_id, tipo_acceso, resultado } = req.body;

      const newAccess = await AccessLog.create({
        usuario_id,
        area_id,
        dispositivo_id,
        tipo_acceso,
        resultado: resultado || 'exitoso',
        timestamp: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Acceso registrado exitosamente',
        data: newAccess
      });
    } catch (error) {
      console.error('Error creando acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar acceso
  async updateAccess(req, res) {
    try {
      const { id } = req.params;
      const { usuario_id, area_id, dispositivo_id, tipo_acceso, resultado } = req.body;

      const access = await AccessLog.findByPk(id);
      if (!access) {
        return res.status(404).json({
          success: false,
          message: 'Acceso no encontrado'
        });
      }

      await access.update({
        usuario_id,
        area_id,
        dispositivo_id,
        tipo_acceso,
        resultado
      });

      res.json({
        success: true,
        message: 'Acceso actualizado exitosamente',
        data: access
      });
    } catch (error) {
      console.error('Error actualizando acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar acceso
  async deleteAccess(req, res) {
    try {
      const { id } = req.params;

      const access = await AccessLog.findByPk(id);
      if (!access) {
        return res.status(404).json({
          success: false,
          message: 'Acceso no encontrado'
        });
      }

      await access.destroy();

      res.json({
        success: true,
        message: 'Acceso eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener accesos por usuario
  async getAccessByUser(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows: userAccess } = await AccessLog.findAndCountAll({
        where: { usuario_id: userId },
        include: [
          { model: User, as: 'user', attributes: ['id', 'nombre', 'apellido'] },
          { model: Area, as: 'area', attributes: ['id', 'nombre'] }
        ],
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: userAccess,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo accesos del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener datos del mapa de calor
  async getHeatmapData(req, res) {
    try {
      const { days = 7 } = req.query;
      
      console.log('🌐 Iniciando obtención de datos del mapa de calor para los últimos', days, 'días');
      
      // Calcular fecha de inicio (hace X días)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      
      console.log('📅 Fecha de inicio:', startDate.toISOString());
      
      // Obtener datos agrupados por hora y día de la semana
      const heatmapData = await AccessLog.findAll({
        attributes: [
          [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM timestamp')), 'hour'],
          [sequelize.fn('EXTRACT', sequelize.literal('DOW FROM timestamp')), 'day_of_week'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          timestamp: {
            [Op.gte]: startDate
          }
        },
        group: ['hour', 'day_of_week'],
        order: [['hour', 'ASC'], ['day_of_week', 'ASC']],
        raw: true
      });

      console.log('📊 Datos brutos obtenidos de la base de datos:', heatmapData);

      // Procesar datos para agrupar cada 4 horas
      const processedData = [];
      const timeSlots = [
        { start: 0, end: 3, label: '00:00-03:59' },
        { start: 4, end: 7, label: '04:00-07:59' },
        { start: 8, end: 11, label: '08:00-11:59' },
        { start: 12, end: 15, label: '12:00-15:59' },
        { start: 16, end: 19, label: '16:00-19:59' },
        { start: 20, end: 23, label: '20:00-23:59' }
      ];

      const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

      timeSlots.forEach(slot => {
        const row = { hora: slot.label };
        dayNames.forEach(day => {
          row[day] = 0;
        });

        // Sumar accesos para este rango de horas
        heatmapData.forEach(item => {
          const hour = parseInt(item.hour);
          const dayOfWeek = parseInt(item.day_of_week);
          const count = parseInt(item.count) || 0;
          
          if (hour >= slot.start && hour <= slot.end) {
            const dayName = dayNames[dayOfWeek];
            if (dayName) {
              row[dayName] += count;
            }
          }
        });

        processedData.push(row);
      });

      console.log('✅ Datos procesados del mapa de calor:', processedData);

      res.json({
        success: true,
        data: processedData,
        metadata: {
          totalRecords: heatmapData.length,
          dateRange: {
            start: startDate.toISOString(),
            end: new Date().toISOString()
          },
          daysRequested: parseInt(days)
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo datos del mapa de calor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = accessController;




