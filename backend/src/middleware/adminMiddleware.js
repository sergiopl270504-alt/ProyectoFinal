/**
 * Middleware para verificar privilegios de Administrador.
 * 
 * Comprueba si el usuario autenticado tiene el rol de 'admin'.
 * Si no es administrador, bloquea el acceso con un error 403.
 * 
 * @param {Object} req - Objeto de solicitud (debe contener req.usuario).
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para continuar al siguiente middleware.
 */
const checkAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.tipo_usuario !== 'admin') {
        return res.status(403).json({ msg: 'Acceso Denegado: Se requieren permisos de Administrador' });
    }
    next();
};

module.exports = checkAdmin;
