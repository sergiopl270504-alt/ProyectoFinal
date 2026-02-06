const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const db = require('../config/db');

/**
 * Modelo de Usuario.
 * 
 * Representa a un usuario registrado en el sistema, ya sea un cliente regular o un administrador.
 * Gestiona la autenticación, datos personales y preferencias de seguridad.
 */
const Usuario = db.define('usuarios', {
    nombre_completo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    movil: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correo_electronico: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token_confirmacion: DataTypes.STRING,
    verificado: DataTypes.BOOLEAN,
    tipo_usuario: {
        type: DataTypes.ENUM('usuario', 'admin'),
        defaultValue: 'usuario'
    },
    secret_2fa: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tfa_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    hooks: {
        beforeCreate: async function (usuario) {
            const salt = await bcrypt.genSalt(10);
            usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
        }
    },
    scopes: { // Para excluir información sensible
        eliminarPassword: {
            attributes: {
                exclude: ['contrasena', 'token_confirmacion', 'verificado', 'createdAt', 'updatedAt']
            }
        }
    }
});

// Métodos Personalizados

/**
 * Verifica si la contraseña proporcionada coincide con la almacenada (encriptada).
 * 
 * @param {string} password - Contraseña en texto plano a verificar.
 * @returns {boolean} Verdadero si coincide, Falso en caso contrario.
 */
Usuario.prototype.verificarPassword = function (password) {
    return bcrypt.compareSync(password, this.contrasena);
};

module.exports = Usuario;
