const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Modelo de Mensaje.
 * 
 * Representa un mensaje individual dentro de una Consulta (hilo de conversación).
 * Almacena el contenido, el remitente (usuario o admin) y el estado de lectura.
 */
const Mensaje = db.define('mensajes', {
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    remitente: {
        type: DataTypes.ENUM('usuario', 'admin'),
        allowNull: false
    },
    leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Mensaje;
