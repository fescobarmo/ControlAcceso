const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database-serverless');

class AuthService {
  // Login de usuario
  static async login(email, password) {
    try {
      // Buscar usuario por email
      const userQuery = `
        SELECT u.*, r.nombre as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.email = $1 AND u.activo = true
      `;
      
      const result = await query(userQuery, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const user = result.rows[0];

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role_name || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Actualizar último login
      await query(
        'UPDATE users SET ultimo_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Registrar en bitácora
      await query(
        `INSERT INTO bitacora (usuario_id, accion, detalles, ip_address) 
         VALUES ($1, $2, $3, $4)`,
        [user.id, 'LOGIN', 'Usuario inició sesión', '0.0.0.0']
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          role: user.role_name || 'user'
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Registro de usuario
  static async register(userData) {
    try {
      const { email, password, nombre, apellido, role_id = 2 } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('El usuario ya existe');
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insertar nuevo usuario
      const insertQuery = `
        INSERT INTO users (email, password, nombre, apellido, role_id, activo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, email, nombre, apellido
      `;

      const result = await query(insertQuery, [
        email,
        hashedPassword,
        nombre,
        apellido,
        role_id
      ]);

      const newUser = result.rows[0];

      // Registrar en bitácora
      await query(
        `INSERT INTO bitacora (usuario_id, accion, detalles) 
         VALUES ($1, $2, $3)`,
        [newUser.id, 'REGISTER', 'Usuario registrado']
      );

      return {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Verificar token JWT
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar que el usuario siga activo
      const userQuery = `
        SELECT u.*, r.nombre as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.id = $1 AND u.activo = true
      `;
      
      const result = await query(userQuery, [decoded.userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      return {
        ...decoded,
        user: result.rows[0]
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      // Obtener contraseña actual
      const userResult = await query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const user = userResult.rows[0];

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash de la nueva contraseña
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId]
      );

      // Registrar en bitácora
      await query(
        `INSERT INTO bitacora (usuario_id, accion, detalles) 
         VALUES ($1, $2, $3)`,
        [userId, 'PASSWORD_CHANGE', 'Usuario cambió su contraseña']
      );

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
