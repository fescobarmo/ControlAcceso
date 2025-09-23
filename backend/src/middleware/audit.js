const { Audit } = require('../models');

// Cache para evitar duplicados en un período corto
const auditCache = new Map();

/**
 * Limpiar cache de auditoría cada 5 minutos
 */
setInterval(() => {
  auditCache.clear();
}, 5 * 60 * 1000);

/**
 * Middleware para registrar eventos de auditoría automáticamente
 */
const auditMiddleware = (action) => {
  return async (req, res, next) => {
    try {
      // Ejecutar la función original primero
      await next();
      
      // Solo registrar si la respuesta fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Registrar en auditoría
        await Audit.create({
          usuario_id: req.user?.id || null,
          accion: action,
          timestamp: new Date()
        });
        
        console.log(`📝 Evento de auditoría registrado: ${action} - Usuario: ${req.user?.id || 'Sistema'}`);
      }
    } catch (error) {
      console.error('Error en middleware de auditoría:', error);
      // No interrumpir el flujo principal si hay error en auditoría
      next();
    }
  };
};

/**
 * Función para registrar eventos de auditoría manualmente
 */
const logAuditEvent = async (usuario_id, accion, req = null) => {
  try {
    // Crear una clave única para evitar duplicados en un período corto
    const cacheKey = `${usuario_id}_${accion}_${Math.floor(Date.now() / (30 * 1000))}`; // 30 segundos
    
    if (auditCache.has(cacheKey)) {
      console.log(`⚠️ Evento de auditoría omitido (duplicado): ${accion} - Usuario: ${usuario_id || 'Sistema'}`);
      return;
    }
    
    await Audit.create({
      usuario_id: usuario_id || null,
      accion,
      timestamp: new Date()
    });
    
    // Marcar en cache
    auditCache.set(cacheKey, true);
    
    console.log(`📝 Evento de auditoría registrado: ${accion} - Usuario: ${usuario_id || 'Sistema'}`);
  } catch (error) {
    console.error('Error registrando evento de auditoría:', error);
  }
};

module.exports = {
  auditMiddleware,
  logAuditEvent
};
