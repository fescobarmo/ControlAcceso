const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');

// Middleware de autenticación (opcional, descomentar si se requiere)
// const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas (opcional)
// router.use(authenticateToken);

// GET /api/enrolamiento/personas - Obtener todas las personas con filtros y paginación
router.get('/personas', personaController.getPersonas);

// GET /api/enrolamiento/personas/estadisticas - Obtener estadísticas de personas
router.get('/personas/estadisticas', personaController.getEstadisticas);

// GET /api/enrolamiento/personas/:id - Obtener una persona específica por ID
router.get('/personas/:id', personaController.getPersonaById);

// POST /api/enrolamiento/personas - Crear una nueva persona
router.post('/personas', personaController.createPersona);

// PUT /api/enrolamiento/personas/:id - Actualizar una persona existente
router.put('/personas/:id', personaController.updatePersona);

// DELETE /api/enrolamiento/personas/:id - Eliminar una persona
router.delete('/personas/:id', personaController.deletePersona);

module.exports = router;
