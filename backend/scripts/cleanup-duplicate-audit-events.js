const { sequelize } = require('../src/models');
const { Audit } = require('../src/models');
const { QueryTypes } = require('sequelize');

async function cleanupDuplicateAuditEvents() {
  try {
    console.log('🔄 Limpiando eventos de auditoría duplicados...');

    // Buscar eventos duplicados (mismo usuario, misma acción, mismo timestamp)
    const duplicates = await sequelize.query(`
      SELECT usuario_id, accion, timestamp, COUNT(*) as count
      FROM auditoria 
      GROUP BY usuario_id, accion, timestamp 
      HAVING COUNT(*) > 1
      ORDER BY timestamp DESC
    `, {
      type: QueryTypes.SELECT
    });

    // También buscar duplicados consecutivos (mismo usuario, misma acción, timestamps muy cercanos)
    const consecutiveDuplicates = await sequelize.query(`
      SELECT a1.usuario_id, a1.accion, a1.timestamp, a1.id
      FROM auditoria a1
      JOIN auditoria a2 ON a1.usuario_id = a2.usuario_id 
        AND a1.accion = a2.accion 
        AND a1.id < a2.id
        AND ABS(EXTRACT(EPOCH FROM (a2.timestamp - a1.timestamp))) < 5
      ORDER BY a1.timestamp DESC
    `, {
      type: QueryTypes.SELECT
    });

    console.log(`📊 Se encontraron ${duplicates.length} grupos de eventos duplicados`);
    console.log(`📊 Se encontraron ${consecutiveDuplicates.length} eventos duplicados consecutivos`);

    // Eliminar duplicados, manteniendo solo el primero
    for (const duplicate of duplicates) {
      const { usuario_id, accion, timestamp } = duplicate;
      
      console.log(`🗑️ Eliminando duplicados para: Usuario ${usuario_id}, Acción: ${accion}, Timestamp: ${timestamp}`);
      
      // Obtener todos los eventos duplicados
      const duplicateEvents = await Audit.findAll({
        where: {
          usuario_id,
          accion,
          timestamp
        },
        order: [['id', 'ASC']]
      });

      // Mantener solo el primero, eliminar el resto
      if (duplicateEvents.length > 1) {
        const toDelete = duplicateEvents.slice(1); // Todos excepto el primero
        for (const event of toDelete) {
          await event.destroy();
          console.log(`   ✅ Eliminado evento ID: ${event.id}`);
        }
      }
    }

    // Eliminar duplicados consecutivos
    for (const duplicate of consecutiveDuplicates) {
      console.log(`🗑️ Eliminando evento duplicado consecutivo ID: ${duplicate.id}`);
      await Audit.destroy({
        where: { id: duplicate.id }
      });
      console.log(`   ✅ Eliminado evento ID: ${duplicate.id}`);
    }

    // Mostrar estadísticas finales
    const totalEvents = await Audit.count();
    console.log(`🎉 Limpieza completada. Total de eventos restantes: ${totalEvents}`);

    // Mostrar eventos recientes
    const recentEvents = await Audit.findAll({
      order: [['timestamp', 'DESC']],
      limit: 10,
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['username']
      }]
    });

    console.log('\n📋 Eventos más recientes:');
    recentEvents.forEach(event => {
      const username = event.user ? event.user.username : 'Sistema';
      console.log(`   ${event.id}: ${event.accion} - ${username} (${event.timestamp})`);
    });

  } catch (error) {
    console.error('❌ Error limpiando eventos duplicados:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupDuplicateAuditEvents();
}

module.exports = cleanupDuplicateAuditEvents;
