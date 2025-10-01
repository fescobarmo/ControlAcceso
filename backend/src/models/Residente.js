const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Residente = sequelize.define('Residente', {
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
  apellido_paterno: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  apellido_materno: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  tipo_documento: {
    type: DataTypes.ENUM('RUN', 'PASAPORTE', 'DNI'),
    allowNull: false,
    defaultValue: 'RUN'
  },
  documento: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  direccion_residencia: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  numero_residencia: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tipo_residencia: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'suspendido', 'pendiente'),
    allowNull: false,
    defaultValue: 'activo'
  },
  tipo_residente: {
    type: DataTypes.ENUM('propietario', 'arrendatario', 'invitado', 'familiar'),
    allowNull: false,
    defaultValue: 'propietario'
  },
  vehiculos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  mascotas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  ocupantes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  foto_url: {
    type: DataTypes.STRING(500),
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
  tableName: 'residentes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['documento']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['tipo_residente']
    },
    {
      fields: ['direccion_residencia', 'numero_residencia']
    }
  ]
});

// Hooks para validaciones adicionales
Residente.beforeValidate((residente) => {
  // Limpiar espacios en blanco
  if (residente.nombre) residente.nombre = residente.nombre.trim();
  if (residente.apellido_paterno) residente.apellido_paterno = residente.apellido_paterno.trim();
  if (residente.apellido_materno) residente.apellido_materno = residente.apellido_materno.trim();
  if (residente.documento) residente.documento = residente.documento.trim();
  if (residente.telefono) residente.telefono = residente.telefono.trim();
  if (residente.email && residente.email.trim()) {
    residente.email = residente.email.trim().toLowerCase();
  } else if (residente.email !== undefined) {
    residente.email = null;
  }
  if (residente.direccion_residencia) residente.direccion_residencia = residente.direccion_residencia.trim();
  if (residente.numero_residencia !== undefined && residente.numero_residencia !== null) {
    residente.numero_residencia = residente.numero_residencia.trim();
    // Si después del trim está vacío, convertir a null
    if (residente.numero_residencia === '') {
      residente.numero_residencia = null;
    }
  }
});

// Métodos de instancia
Residente.prototype.getNombreCompleto = function() {
  const apellidos = [this.apellido_paterno, this.apellido_materno].filter(Boolean).join(' ');
  return `${this.nombre} ${apellidos}`.trim();
};

Residente.prototype.getDireccionCompleta = function() {
  return `${this.direccion_residencia} ${this.numero_residencia}`.trim();
};

// Métodos de clase
Residente.getEstadisticas = async function() {
  try {
    const total = await this.count();
    const activos = await this.count({ where: { estado: 'activo' } });
    const propietarios = await this.count({ where: { tipo_residente: 'propietario' } });
    const arrendatarios = await this.count({ where: { tipo_residente: 'arrendatario' } });
    
    return {
      total_residentes: total,
      residentes_activos: activos,
      propietarios,
      arrendatarios
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

module.exports = Residente;
