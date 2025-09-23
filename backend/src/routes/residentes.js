const express = require('express');
const router = express.Router();
const residenteController = require('../controllers/residenteController');

// Middleware de autenticación (opcional, descomentar si se requiere)
// const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas (opcional)
// router.use(authenticateToken);

// GET /api/residentes - Obtener todos los residentes con filtros y paginación
router.get('/', residenteController.getResidentes);

// GET /api/residentes/estadisticas - Obtener estadísticas de residentes
router.get('/estadisticas', residenteController.getEstadisticas);

// GET /api/residentes/:id - Obtener un residente específico por ID
router.get('/:id', residenteController.getResidenteById);

// POST /api/residentes - Crear un nuevo residente
router.post('/', residenteController.createResidente);

// PUT /api/residentes/:id - Actualizar un residente existente
router.put('/:id', residenteController.updateResidente);

// DELETE /api/residentes/:id - Eliminar un residente
router.delete('/:id', residenteController.deleteResidente);

module.exports = router;
