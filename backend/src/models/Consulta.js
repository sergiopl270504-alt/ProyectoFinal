const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Modelo de Consulta.
 * 
 * Representa un hilo de conversación iniciado por un usuario interesado en una propiedad.
 * Almacena el mensaje inicial y metadatos de la conversación.
 */
const Consulta = db.define('consultas', { // Tabla de Consultas
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    respuesta: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_respuesta: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = Consulta;
