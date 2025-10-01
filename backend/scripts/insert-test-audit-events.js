const { sequelize } = require('../src/models');
const { Audit, User } = require('../src/models');

async function insertTestAuditEvents() {
  try {
    console.log('🔄 Insertando eventos de auditoría de prueba...');

    // Buscar un usuario existente
    const user = await User.findOne({ where: { is_active: true } });
    
    if (!user) {
      console.log('❌ No se encontró ningún usuario activo');
      return;
    }

    console.log(`👤 Usando usuario: ${user.username} (ID: ${user.id})`);

    // Eventos de prueba más realistas
    const testEvents = [
      {
        usuario_id: user.id,
        accion: 'Usuario inició sesión',
        timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario accedió al dashboard',
        timestamp: new Date(Date.now() - 9 * 60 * 1000) // 9 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario accedió a módulo residentes',
        timestamp: new Date(Date.now() - 8 * 60 * 1000) // 8 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario creó nuevo residente',
        timestamp: new Date(Date.now() - 7 * 60 * 1000) // 7 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario accedió a módulo visitas',
        timestamp: new Date(Date.now() - 6 * 60 * 1000) // 6 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario creó nueva visita',
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario accedió a módulo bitácora',
        timestamp: new Date(Date.now() - 4 * 60 * 1000) // 4 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario exportó reporte',
        timestamp: new Date(Date.now() - 3 * 60 * 1000) // 3 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario actualizó su perfil',
        timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutos atrás
      },
      {
        usuario_id: user.id,
        accion: 'Usuario cerró sesión',
        timestamp: new Date(Date.now() - 1 * 60 * 1000) // 1 minuto atrás
      }
    ];

    // Insertar eventos
    for (const event of testEvents) {
      await Audit.create(event);
      console.log(`✅ Evento insertado: ${event.accion}`);
    }

    console.log(`🎉 Se insertaron ${testEvents.length} eventos de auditoría de prueba`);
    
    // Mostrar estadísticas
    const totalEvents = await Audit.count();
    console.log(`📊 Total de eventos en auditoría: ${totalEvents}`);

  } catch (error) {
    console.error('❌ Error insertando eventos de prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertTestAuditEvents();
}

module.exports = insertTestAuditEvents;

