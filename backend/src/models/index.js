const db = require('../config/db');

const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Propiedad = require('./Propiedad');
const Consulta = require('./Consulta');
const Mensaje = require('./Mensaje');

/**
 * Definición de relaciones entre modelos (Asociaciones).
 * 
 * Establece cómo interactúan las tablas en la base de datos:
 * - Propiedades pertenecen a Categorías y Usuarios.
 * - Consultas pertenecen a Usuarios y Propiedades, y tienen muchos Mensajes.
 */
// Definir Relaciones
Propiedad.belongsTo(Categoria, { foreignKey: 'categoryId' });
Categoria.hasMany(Propiedad, { foreignKey: 'categoryId' });

Propiedad.belongsTo(Usuario, { foreignKey: 'userId' });
Usuario.hasMany(Propiedad, { foreignKey: 'userId' });

Consulta.belongsTo(Usuario, { foreignKey: 'userId', as: 'usuario' });
Consulta.belongsTo(Propiedad, { foreignKey: 'propertyId', as: 'propiedad' }); // Sequelize usará la tabla definida en Propiedad ('propiedades')

Consulta.hasMany(Mensaje, { foreignKey: 'inquiryId', as: 'mensajes' });
Mensaje.belongsTo(Consulta, { foreignKey: 'inquiryId' });

module.exports = {
    db,
    Usuario,
    Categoria,
    Propiedad,
    Consulta,
    Mensaje
};
