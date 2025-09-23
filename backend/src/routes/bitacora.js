const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacoraController');
const authMiddleware = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// Middleware para registrar acceso a bitácora
const auditBitacoraAccess = async (req, res, next) => {
  try {
    await next();
    
    // Solo registrar si la respuesta fue exitosa y es una consulta de bitácora
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      await logAuditEvent(req.user.id, 'Usuario accedió a módulo bitácora');
    }
  } catch (error) {
    console.error('Error en middleware de auditoría de bitácora:', error);
    next();
  }
};

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todos los eventos de bitácora con filtros y paginación
router.get('/', auditBitacoraAccess, bitacoraController.getBitacora);

// Obtener estadísticas de bitácora
router.get('/estadisticas', bitacoraController.getEstadisticas);

// Obtener un evento específico por ID
router.get('/:id', bitacoraController.getEventoById);

// Crear un nuevo evento de bitácora
router.post('/', bitacoraController.createEvento);

// Actualizar un evento existente
router.put('/:id', bitacoraController.updateEvento);

// Eliminar un evento
router.delete('/:id', bitacoraController.deleteEvento);

module.exports = router;
