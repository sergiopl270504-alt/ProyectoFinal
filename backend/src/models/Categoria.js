const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Modelo de Categoria.
 * 
 * Representa las diferentes categorías en las que se pueden clasificar las propiedades
 * (e.j., Casa, Departamento, Terreno).
 */
const Categoria = db.define('categorias', {
    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false
    }
});

module.exports = Categoria;
