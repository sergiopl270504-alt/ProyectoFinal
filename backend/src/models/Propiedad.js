const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Modelo de Propiedad.
 * 
 * Representa un inmueble en venta dentro de la plataforma.
 * Contiene toda la información relevante como título, descripción, ubicación,
 * características físicas y precio.
 */
const Propiedad = db.define('propiedades', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    titulo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    habitaciones: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estacionamiento: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    wc: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    calle: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    lat: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lng: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publicado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    precio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vendido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Propiedad;
