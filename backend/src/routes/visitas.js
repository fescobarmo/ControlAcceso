const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const authMiddleware = require('../middleware/auth');

// Ruta temporal sin autenticación para pruebas
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de visitas funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta temporal para obtener visitas sin autenticación (solo para pruebas)
router.get('/public', visitaController.getVisitas);

// Ruta temporal para obtener estadísticas sin autenticación (solo para pruebas)
router.get('/public/estadisticas', visitaController.getEstadisticas);

// Aplicar middleware de autenticación a las rutas protegidas
router.use(authMiddleware);

// Obtener todas las visitas con filtros y paginación
router.get('/', visitaController.getVisitas);

// Obtener estadísticas de visitas
router.get('/estadisticas', visitaController.getEstadisticas);

// Obtener una visita específica por ID
router.get('/:id', visitaController.getVisitaById);

// Crear una nueva visita
router.post('/', visitaController.createVisita);

// Actualizar una visita existente
router.put('/:id', visitaController.updateVisita);

// Registrar salida de una visita
router.put('/:id/salida', visitaController.registrarSalida);

// Cancelar una visita
router.put('/:id/cancelar', visitaController.cancelarVisita);

// Eliminar una visita
router.delete('/:id', visitaController.deleteVisita);

module.exports = router;

