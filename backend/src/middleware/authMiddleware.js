const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Middleware de Autenticación mediante JWT.
 * 
 * Extrae y verifica el token Bearer del encabezado de autorización o query params.
 * Si el token es válido, busca al usuario en la base de datos y lo adjunta al objeto request.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para continuar.
 */
const checkAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');

            req.usuario = await Usuario.findByPk(decoded.usuario.id, {
                attributes: { exclude: ['contrasena', 'token_confirmacion', 'token_recuperacion', 'verificado'] }
            });

            if (!req.usuario) {
                return res.status(403).json({ msg: 'Usuario no válido' });
            }

            return next();
        } catch (error) {
            return res.status(403).json({ msg: 'Token no válido' });
        }
    }

    if (!token) {
        return res.status(401).json({ msg: 'No autenticado, inicia sesión' });
    }
};

module.exports = checkAuth;
