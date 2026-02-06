const Usuario = require('../models/Usuario'); // Renombrado
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { emailRegistro, emailOlvidePassword } = require('../helpers/emails');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const controladorAuth = {
    // Registro de Usuario
    /**
     * Registra un nuevo usuario en el sistema.
     * 
     * Valida los datos de entrada, verifica si el usuario ya existe y crea un nuevo registro
     * con estado no verificado. Envía un correo electrónico con el token de confirmación.
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} req.body - Cuerpo de la solicitud con datos del usuario.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Object} JSON con mensaje de éxito o errores de validación.
     */
    registrar: async (req, res) => {
        // Validar campos
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const { nombre_completo, movil, correo_electronico, contrasena, repetir_contrasena } = req.body;

        try {
            // Verificar si usuario existe
            let usuario = await Usuario.findOne({ where: { correo_electronico } });
            if (usuario) {
                return res.status(400).json({ msg: 'El usuario ya existe' });
            }

            // Crear Usuario (Confirmado automáticamente)
            usuario = await Usuario.create({
                nombre_completo,
                movil,
                correo_electronico,
                contrasena,
                token_confirmacion: null,
                verificado: true
            });

            // Email de Bienvenida (Opcional, o simplemente no enviar nada)
            // Ya no enviamos emailRegistro() para confirmación.

            res.status(201).json({ msg: 'Usuario creado correctamente. Ya puedes iniciar sesión.' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error en el servidor' });
        }
    },

    // Confirmar Cuenta
    /**
     * Confirma la cuenta de un usuario mediante un token.
     * 
     * Busca al usuario por el token de confirmación proporcionado en la URL.
     * Si es válido, elimina el token y marca la cuenta como verificada.
     * 
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} req.params - Parámetros de ruta (token).
     * @param {Object} res - Objeto de respuesta.
     * @returns {Object} JSON confirmando la activación o indicando error.
     */
    confirmarCuenta: async (req, res) => {
        const { token } = req.params;
        try {
            const usuario = await Usuario.findOne({ where: { token_confirmacion: token } });
            if (!usuario) {
                return res.status(400).json({ msg: 'Token inválido' });
            }

            usuario.token_confirmacion = null;
            usuario.verificado = true;
            await usuario.save();

            res.json({ msg: 'Cuenta confirmada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al confirmar cuenta' });
        }
    },

    // Iniciar Sesión
    /**
     * Inicia sesión de un usuario y genera un token JWT.
     * 
     * Verifica credenciales, estado de confirmación de la cuenta y genera un token
     * de acceso si todo es correcto.
     * 
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} req.body - Credenciales (correo y contraseña).
     * @param {Object} res - Objeto de respuesta.
     * @returns {Object} JSON con el token JWT y datos básicos del usuario.
     */
    login: async (req, res) => {
        const { correo_electronico, contrasena } = req.body;

        try {
            const usuario = await Usuario.findOne({ where: { correo_electronico } });
            if (!usuario) {
                return res.status(400).json({ msg: 'Usuario no encontrado' });
            }

            // Verificar si está confirmado
            if (!usuario.verificado) {
                return res.status(400).json({ msg: 'Tu cuenta no ha sido confirmada' });
            }

            // Verificar password
            if (!usuario.verificarPassword(contrasena)) {
                return res.status(400).json({ msg: 'Contraseña incorrecta' });
            }

            // Verificar si tiene 2FA activado Y confirmado
            if (usuario.tfa_enabled && usuario.secret_2fa) {
                return res.json({
                    require2fa: true,
                    userId: usuario.id,
                    msg: 'Introduce el código de tu aplicación de autenticación'
                });
            }

            // Generar JWT (Login normal)
            const payload = {
                usuario: {
                    id: usuario.id,
                    tipo_usuario: usuario.tipo_usuario
                }
            };

            jwt.sign(payload, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' }, (error, token) => {
                if (error) throw error;
                res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre_completo, email: usuario.correo_electronico, role: usuario.tipo_usuario } });
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error de servidor' });
        }
    },

    // Configurar 2FA (Opcional)
    /**
     * Configura la autenticación de dos factores (2FA) para el usuario.
     * 
     * Genera un secreto único y un código QR para ser escaneado por aplicaciones
     * de autenticación (Google Authenticator, etc.).
     * 
     * @param {Object} req - Objeto de solicitud (requiere autenticación previa).
     * @param {Object} res - Objeto de respuesta.
     * @returns {Object} JSON con el secreto en texto y URL del código QR.
     */
    setup2FA: async (req, res) => {
        const userId = req.usuario.id;
        try {
            const secret = speakeasy.generateSecret({ length: 20 });
            const usuario = await Usuario.findByPk(userId);

            usuario.secret_2fa = secret.base32;
            usuario.tfa_enabled = false; // Aún no activado hasta confirmar
            await usuario.save();

            QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
                res.json({ secret: secret.base32, qrCode: data_url });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Error generando 2FA' });
        }
    },

    // Olvidé mi Contraseña
    /**
     * Inicia el proceso de recuperación de contraseña.
     * 
     * Genera un nuevo token de confirmación y envía un correo con instrucciones
     * al usuario si el correo existe en la base de datos.
     * 
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} req.body - Correo electrónico del usuario.
     * @param {Object} res - Objeto de respuesta.
     * @returns {Object} JSON indicando que se han enviado las instrucciones.
     */
    olvidePassword: async (req, res) => {
        const { email } = req.body;

        try {
            const usuario = await Usuario.findOne({ where: { correo_electronico: email } });
            if (!usuario) {
                return res.status(400).json({ msg: 'El usuario no existe' });
            }

            // Generar token
            usuario.token_confirmacion = Math.floor(100000 + Math.random() * 900000).toString();
            await usuario.save();

            // Enviar email
            await emailOlvidePassword({
                email: usuario.correo_electronico,
                nombre: usuario.nombre_completo,
                token: usuario.token_confirmacion
            });

            res.json({ msg: 'Hemos enviado un email con las instrucciones' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Hubo un error' });
        }
    },

    // Guardar Nuevo Password
    /**
     * Establece una nueva contraseña para el usuario.
     * 
     * Verifica el token de recuperación y actualiza la contraseña del usuario,
     * asegurando que se encripte correctamente antes de guardar.
     * 
     * @param {Object} req - Objeto de solicitud.
     * @param {Object} req.params - Token de recuperación.
     * @param {Object} req.body - Nueva contraseña.
     * @param {Object} res - Objeto de respuesta.
     * @returns {Object} JSON confirmando el cambio de contraseña.
     */
    nuevoPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            const usuario = await Usuario.findOne({ where: { token_confirmacion: token } });
            if (!usuario) {
                return res.status(400).json({ msg: 'Token no válido' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            usuario.contrasena = await bcrypt.hash(password, salt);

            // Limpiar token y guardar
            usuario.token_confirmacion = null;
            await usuario.save();

            res.json({ msg: 'Password modificado correctamente' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Error al cambiar password' });
        }
    },

    // Verificar 2FA y completar Login
    verify2FA: async (req, res) => {
        const { userId, token } = req.body;

        try {
            const usuario = await Usuario.findByPk(userId);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            // Verificar token TOTP
            const verified = speakeasy.totp.verify({
                secret: usuario.secret_2fa,
                encoding: 'base32',
                token: token
            });

            if (!verified) {
                return res.status(400).json({ msg: 'Código 2FA incorrecto' });
            }

            // Login exitoso -> Generar JWT
            const payload = {
                usuario: {
                    id: usuario.id,
                    tipo_usuario: usuario.tipo_usuario
                }
            };

            jwt.sign(payload, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' }, (error, jwtToken) => {
                if (error) throw error;
                res.json({ token: jwtToken, usuario: { id: usuario.id, nombre: usuario.nombre_completo, email: usuario.correo_electronico, role: usuario.tipo_usuario } });
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error verificando 2FA' });
        }
    },

    // Activar 2FA (Confirmar código inicial)
    activate2FA: async (req, res) => {
        const { token } = req.body;
        const userId = req.usuario.id;

        try {
            const usuario = await Usuario.findByPk(userId);
            if (!usuario || !usuario.secret_2fa) {
                return res.status(400).json({ msg: 'No hay configuración de 2FA pendiente' });
            }

            // Verificar token
            const verified = speakeasy.totp.verify({
                secret: usuario.secret_2fa,
                encoding: 'base32',
                token: token
            });

            if (!verified) {
                return res.status(400).json({ msg: 'Código incorrecto. Inténtalo de nuevo.' });
            }

            usuario.tfa_enabled = true;
            await usuario.save();

            res.json({ msg: '2FA Activado Correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error activando 2FA' });
        }
    },

    // Obtener estado 2FA
    status2FA: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.usuario.id);
            res.json({ enabled: usuario.tfa_enabled });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al verificar estado 2FA' });
        }
    },

    // Desactivar 2FA
    disable2FA: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.usuario.id);
            usuario.secret_2fa = null;
            usuario.tfa_enabled = false;
            await usuario.save();
            res.json({ msg: 'Autenticación de dos pasos desactivada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al desactivar 2FA' });
        }
    },

    // Cambiar Password (Autenticado)
    cambiarPassword: async (req, res) => {
        const { password_actual, password_nuevo } = req.body;
        const { id } = req.usuario;

        try {
            const usuario = await Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            // Verificar password actual
            if (!usuario.verificarPassword(password_actual)) {
                return res.status(400).json({ msg: 'La contraseña actual es incorrecta' });
            }

            // Guardar nuevo password
            const salt = await bcrypt.genSalt(10);
            usuario.contrasena = await bcrypt.hash(password_nuevo, salt);
            await usuario.save();

            res.json({ msg: 'Contraseña actualizada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al actualizar contraseña' });
        }
    },

    // Eliminar Cuenta (Protegido)
    /**
     * Elimina permanentemente la cuenta del usuario actual.
     * 
     * Realiza verificaciones de seguridad, como impedir que se elimine el último
     * administrador del sistema para evitar bloqueos.
     * 
     * @param {Object} req - Objeto de solicitud (requiere autenticación).
     * @param {Object} res - Objeto de respuesta.
     * @returns {Object} JSON confirmando la eliminación.
     */
    eliminarCuenta: async (req, res) => {
        try {
            const { id } = req.usuario;

            // Comprobar si es el último administrador
            const usuario = await Usuario.findByPk(id);
            if (usuario.tipo_usuario === 'admin') {
                const adminCount = await Usuario.count({ where: { tipo_usuario: 'admin' } });
                if (adminCount <= 1) {
                    return res.status(400).json({ msg: 'No se puede eliminar al último administrador del sistema.' });
                }
            }

            // Eliminar usuario
            await usuario.destroy();
            res.json({ msg: 'Cuenta eliminada correctamente.' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Hubo un error al eliminar la cuenta' });
        }
    }
};

module.exports = controladorAuth;
