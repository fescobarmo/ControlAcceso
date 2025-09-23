const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Persona = sequelize.define('Persona', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  tipo_documento: {
    type: DataTypes.ENUM('RUN', 'PASAPORTE', 'DNI', 'CARNET'),
    allowNull: false,
    defaultValue: 'RUN'
  },
  numero_documento: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  foto_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'pendiente'),
    allowNull: false,
    defaultValue: 'activo'
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campos de auditoría
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'personas',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['numero_documento']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['tipo_documento']
    }
  ]
});

// Hooks para validaciones adicionales
Persona.beforeValidate((persona) => {
  // Limpiar espacios en blanco
  if (persona.nombre) persona.nombre = persona.nombre.trim();
  if (persona.apellido) persona.apellido = persona.apellido.trim();
  if (persona.numero_documento) persona.numero_documento = persona.numero_documento.trim();
  if (persona.observaciones) persona.observaciones = persona.observaciones.trim();
});

// Métodos de instancia
Persona.prototype.getNombreCompleto = function() {
  return `${this.nombre} ${this.apellido}`.trim();
};

// Métodos de clase
Persona.getEstadisticas = async function() {
  try {
    const total = await this.count();
    const activos = await this.count({ where: { estado: 'activo' } });
    const pendientes = await this.count({ where: { estado: 'pendiente' } });
    const inactivos = await this.count({ where: { estado: 'inactivo' } });
    
    return {
      total_personas: total,
      personas_activas: activos,
      personas_pendientes: pendientes,
      personas_inactivas: inactivos
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

module.exports = Persona;
