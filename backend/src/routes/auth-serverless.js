const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/authService');

const router = express.Router();

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

// POST /api/auth/login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido es requerido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await AuthService.login(email, password);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      ...result
    });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(401).json({
      error: 'Error de autenticación',
      message: error.message
    });
  }
});

// POST /api/auth/register
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido es requerido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('nombre')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nombre es requerido'),
  body('apellido')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Apellido es requerido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userData = req.body;
    
    const result = await AuthService.register(userData);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: result
    });
  } catch (error) {
    console.error('Register route error:', error);
    res.status(400).json({
      error: 'Error en el registro',
      message: error.message
    });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      });
    }
    
    const result = await AuthService.verifyToken(token);
    
    res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        nombre: result.user.nombre,
        apellido: result.user.apellido,
        role: result.user.role_name || 'user'
      }
    });
  } catch (error) {
    console.error('Verify route error:', error);
    res.status(401).json({
      error: 'Token inválido',
      message: error.message
    });
  }
});

// POST /api/auth/change-password
router.post('/change-password', [
  body('oldPassword')
    .isLength({ min: 6 })
    .withMessage('Contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nueva contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      });
    }
    
    const decoded = await AuthService.verifyToken(token);
    const { oldPassword, newPassword } = req.body;
    
    await AuthService.changePassword(decoded.userId, oldPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Change password route error:', error);
    res.status(400).json({
      error: 'Error al cambiar contraseña',
      message: error.message
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      });
    }
    
    const result = await AuthService.verifyToken(token);
    
    res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        nombre: result.user.nombre,
        apellido: result.user.apellido,
        role: result.user.role_name || 'user'
      }
    });
  } catch (error) {
    console.error('Me route error:', error);
    res.status(401).json({
      error: 'Token inválido',
      message: error.message
    });
  }
});

module.exports = router;
