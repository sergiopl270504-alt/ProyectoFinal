const nodemailer = require('nodemailer');

/**
 * Envía un correo electrónico de confirmación de registro.
 * 
 * Utiliza Nodemailer para enviar un email con un enlace de confirmación
 * que contiene el token generado para el usuario.
 * 
 * @param {Object} datos - Datos del usuario (email, nombre, token).
 */
const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos;

    // Si no hay credenciales, simular envío
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[SIMULACIÓN EMAIL] Registro para ${email}`);
        const domain = process.env.BACKEND_URL || 'http://13.60.189.119:3000';
        console.log(`Link: ${domain}/confirmar-cuenta.html?token=${token}`);
        return;
    }

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transport.sendMail({
            from: 'Casafinder.com',
            to: email,
            subject: 'Confirma tu Cuenta en Casafinder.com',
            text: 'Confirma tu Cuenta en Casafinder.com',
            html: `
                <p>Hola ${nombre}, comprueba tu cuenta en Casafinder.com</p>
                <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
                <a href="${process.env.BACKEND_URL || 'http://13.60.189.119:3000'}/auth/confirmar/${token}">Confirmar Cuenta</a> </p>
                <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
            `
        });
    } catch (error) {
        console.error('[ERROR EMAIL] Fallo al enviar correo real, mostrando en log para desarrollo:');
        const domain = process.env.BACKEND_URL || 'http://13.60.189.119:3000';
        console.log(`Link: ${domain}/confirmar-cuenta.html?token=${token}`);
    }
}

/**
 * Envía un correo electrónico para restablecer la contraseña.
 * 
 * Envía instrucciones y un enlace seguro para que el usuario pueda
 * generar una nueva contraseña si olvidó la anterior.
 * 
 * @param {Object} datos - Datos del usuario (email, nombre, token).
 */
const emailOlvidePassword = async (datos) => {
    const { email, nombre, token } = datos;

    // Si no hay credenciales, simular envío
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[SIMULACIÓN EMAIL] Password Reset para ${email}`);
        console.log(`\n*** CÓDIGO DE RECUPERACIÓN: ${token} ***\n`);
        const domain = process.env.BACKEND_URL || 'http://13.60.189.119:3000';
        console.log(`(O usa este link: ${domain}/nueva-contrasena.html?token=${token})`);
        return;
    }

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transport.sendMail({
            from: 'Casafinder.com',
            to: email,
            subject: 'Reestablece tu Password en Casafinder.com',
            text: 'Reestablece tu Password en Casafinder.com',
            html: `
                <p>Hola ${nombre}, has solicitado reestablecer tu password en Casafinder.com</p>
                <p>Tu código de recuperación es: <strong>${token}</strong></p>
                <p>O sigue el siguiente enlace:
                <a href="${process.env.BACKEND_URL || 'http://13.60.189.119:3000'}/nueva-contrasena.html?token=${token}">Reestablecer Password</a> </p>
                <p>Si tu no solicitaste esto, puedes ignorar el mensaje</p>
            `
        });
    } catch (error) {
        console.error('[ERROR EMAIL] Fallo al enviar correo real, mostrando en log para desarrollo:');
        const domain = process.env.BACKEND_URL || 'http://13.60.189.119:3000';
        console.log(`Link: ${domain}/nueva-contrasena.html?token=${token}`);
    }
}

module.exports = {
    emailRegistro,
    emailOlvidePassword
}
