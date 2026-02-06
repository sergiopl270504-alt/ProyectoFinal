const jwt = require('jsonwebtoken');

/**
 * Genera un JSON Web Token (JWT) para autenticación.
 * 
 * @param {Object} data - Datos del usuario a incluir en el payload (id, nombre).
 * @returns {string} Token JWT firmado.
 */
const generateJWT = (data) => jwt.sign({ id: data.id, nombre: data.nombre }, process.env.JWT_SECRET, { expiresIn: '1d' });

/**
 * Genera un ID único aleatorio.
 * 
 * Útil para tokens de confirmación o identificadores temporales.
 * @returns {string} Cadena alfanumérica aleatoria.
 */
const generateId = () => Math.random().toString(32).substring(2) + Date.now().toString(32);

module.exports = {
    generateJWT,
    generateId
}
