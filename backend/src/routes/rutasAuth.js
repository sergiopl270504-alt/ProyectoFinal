const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registrar, confirmarCuenta, login, setup2FA, verify2FA, activate2FA, status2FA, disable2FA, olvidePassword, nuevoPassword, cambiarPassword } = require('../controllers/controladorAuth');
const checkAuth = require('../middleware/authMiddleware');

// Registro
/**
 * @route POST /auth/registro
 * @description Registra un nuevo usuario en la plataforma.
 * @access Público
 */
router.post('/registro', [
    check('nombre_completo', 'El nombre es obligatorio y máximo 50 caracteres').not().isEmpty().isLength({ max: 50 }),
    check('movil', 'Debe ser un móvil español válido (+34 opcional + 9 dígitos empezando por 6/7)').matches(/^(?:(?:\+|00)34)?[67]\d{8}$/),
    check('correo_electronico', 'Agrega un email válido').isEmail(),
    check('contrasena', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    // check('repetir_contrasena', 'Las contraseñas no coinciden').custom((value, { req }) => value === req.body.contrasena)
], registrar);

// Confirmación
/**
 * @route GET /auth/confirmar/:token
 * @description Confirma la cuenta del usuario mediante token.
 * @access Público
 */
router.get('/confirmar/:token', confirmarCuenta);

// Login
/**
 * @route POST /auth/login
 * @description Inicia sesión y devuelve un token JWT.
 * @access Público
 */
router.post('/login', login);

// Olvidé Password
router.post('/olvide-password', olvidePassword);
router.post('/olvide-password/:token', nuevoPassword);
router.post('/cambiar-password', checkAuth, cambiarPassword);

// 2FA Setup & Verify
router.post('/2fa/setup', checkAuth, setup2FA);
router.post('/2fa/activate', checkAuth, activate2FA);
router.post('/2fa/verify', verify2FA);
router.get('/2fa/status', checkAuth, status2FA);
router.post('/2fa/disable', checkAuth, disable2FA);

// Eliminar Cuenta
/**
 * @route DELETE /auth/eliminar-cuenta
 * @description Elimina la cuenta del usuario autenticado.
 * @access Privado
 */
router.delete('/eliminar-cuenta', checkAuth, require('../controllers/controladorAuth').eliminarCuenta);

module.exports = router;
