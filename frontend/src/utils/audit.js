import api from './api';

/**
 * Función para registrar eventos de auditoría desde el frontend
 * @param {string} accion - La acción realizada
 * @param {object} metadata - Información adicional opcional
 */
export const logAuditEvent = async (accion, metadata = null) => {
  try {
    await api.post('/api/bitacora', {
      accion,
      metadata
    });
    
    console.log(`📝 Evento de auditoría registrado desde frontend: ${accion}`);
  } catch (error) {
    console.error('Error registrando evento de auditoría desde frontend:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Eventos comunes de auditoría
 */
export const AUDIT_EVENTS = {
  LOGIN: 'Usuario inició sesión',
  LOGOUT: 'Usuario cerró sesión',
  ACCESS_DASHBOARD: 'Usuario accedió al dashboard',
  ACCESS_RESIDENTES: 'Usuario accedió a módulo residentes',
  ACCESS_VISITAS: 'Usuario accedió a módulo visitas',
  ACCESS_VISITAS_EXTERNAS: 'Usuario accedió a módulo visitas externas',
  ACCESS_ENROLAMIENTO: 'Usuario accedió a módulo enrolamiento',
  ACCESS_BITACORA: 'Usuario accedió a módulo bitácora',
  ACCESS_USUARIOS: 'Usuario accedió a módulo usuarios',
  CREATE_RESIDENTE: 'Usuario creó nuevo residente',
  UPDATE_RESIDENTE: 'Usuario actualizó residente',
  DELETE_RESIDENTE: 'Usuario eliminó residente',
  CREATE_VISITA: 'Usuario creó nueva visita',
  UPDATE_VISITA: 'Usuario actualizó visita',
  DELETE_VISITA: 'Usuario eliminó visita',
  CREATE_VISITA_EXTERNA: 'Usuario creó nueva visita externa',
  UPDATE_VISITA_EXTERNA: 'Usuario actualizó visita externa',
  DELETE_VISITA_EXTERNA: 'Usuario eliminó visita externa',
  CREATE_PERSONA: 'Usuario creó nueva persona',
  UPDATE_PERSONA: 'Usuario actualizó persona',
  DELETE_PERSONA: 'Usuario eliminó persona',
  CREATE_USER: 'Usuario creó nuevo usuario',
  UPDATE_USER: 'Usuario actualizó usuario',
  DELETE_USER: 'Usuario eliminó usuario',
  EXPORT_REPORT: 'Usuario exportó reporte',
  CHANGE_SETTINGS: 'Usuario cambió configuración',
  ACCESS_PROFILE: 'Usuario accedió a su perfil',
  UPDATE_PROFILE: 'Usuario actualizó su perfil'
};

export default {
  logAuditEvent,
  AUDIT_EVENTS
};

