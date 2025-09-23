const { AccessLog, User, Area } = require('../models');

const generateAccessLogData = async () => {
  try {
    console.log('🌱 Generando datos de ejemplo para logs de acceso...');

    // Obtener usuarios y áreas existentes
    const users = await User.findAll({ limit: 10 });
    const areas = await Area.findAll({ limit: 5 });

    if (users.length === 0 || areas.length === 0) {
      console.log('⚠️ No hay usuarios o áreas suficientes para generar logs de acceso');
      return;
    }

    const accessLogs = [];
    const now = new Date();
    
    // Generar logs para los últimos 7 días
    for (let day = 6; day >= 0; day--) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() - day);
      
      // Generar logs para cada hora del día
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(currentDate);
        timestamp.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        
        // Generar entre 0 y 50 accesos por hora (más tráfico en horas laborales)
        let numAccesses = 0;
        if (hour >= 8 && hour <= 18) {
          // Horas laborales: más tráfico
          numAccesses = Math.floor(Math.random() * 30) + 10;
        } else if (hour >= 6 && hour <= 22) {
          // Horas extendidas: tráfico moderado
          numAccesses = Math.floor(Math.random() * 15) + 5;
        } else {
          // Horas nocturnas: poco tráfico
          numAccesses = Math.floor(Math.random() * 5);
        }
        
        // Ajustar para fines de semana (menos tráfico)
        const dayOfWeek = timestamp.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo o Sábado
          numAccesses = Math.floor(numAccesses * 0.3);
        }
        
        for (let i = 0; i < numAccesses; i++) {
          const user = users[Math.floor(Math.random() * users.length)];
          const area = areas[Math.floor(Math.random() * areas.length)];
          const accessTime = new Date(timestamp);
          accessTime.setMinutes(accessTime.getMinutes() + Math.floor(Math.random() * 60));
          
          accessLogs.push({
            usuario_id: user.id,
            area_id: area.id,
            dispositivo_id: Math.floor(Math.random() * 5) + 1, // Dispositivos 1-5
            tipo_acceso: Math.random() > 0.1 ? 'entrada' : 'salida', // 90% entradas, 10% salidas
            resultado: Math.random() > 0.05 ? 'exitoso' : 'denegado', // 95% exitosos, 5% denegados
            timestamp: accessTime
          });
        }
      }
    }

    // Insertar logs en lotes
    const batchSize = 100;
    for (let i = 0; i < accessLogs.length; i += batchSize) {
      const batch = accessLogs.slice(i, i + batchSize);
      await AccessLog.bulkCreate(batch);
      console.log(`✅ Insertados ${Math.min(i + batchSize, accessLogs.length)} de ${accessLogs.length} logs de acceso`);
    }

    console.log('✅ Datos de logs de acceso generados exitosamente');
  } catch (error) {
    console.error('❌ Error generando datos de logs de acceso:', error);
  }
};

module.exports = { generateAccessLogData };


