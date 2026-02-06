import { request } from './api.js';

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

/**
 * Gestiona el formulario de inicio de sesión.
 * 
 * Escucha el evento 'submit', envía las credenciales al backend
 * y almacena el token de sesión si la autenticación es exitosa.
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Verificar si estamos en paso 2 (2FA)
    const is2FAStep = loginForm.dataset.step === '2fa';

    try {
        if (!is2FAStep) {
            // PASO 1: Login Normal
            const data = await request('/auth/login', 'POST', {
                correo_electronico: email,
                contrasena: password
            });

            if (data.require2fa) {
                // Si el backend pide 2FA
                loginForm.dataset.step = '2fa';
                loginForm.dataset.userId = data.userId;

                // Ocultar campos usuario/pass
                document.getElementById('email').parentElement.style.display = 'none';
                document.getElementById('password').parentElement.style.display = 'none';

                // Mostrar campo 2FA (Lo creamos dinámicamente si no existe)
                let tokenInput = document.getElementById('token-2fa');
                if (!tokenInput) {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <label for="token-2fa" style="display:block; margin-bottom:0.5rem">Código de Autenticación (2FA)</label>
                        <input type="text" id="token-2fa" placeholder="123456" style="width:100%; padding:0.5rem; margin-bottom:1rem; border:1px solid #ccc; border-radius:4px;">
                    `;
                    loginForm.insertBefore(div, loginForm.querySelector('button'));
                    tokenInput = div.querySelector('input');
                }

                // Cambiar texto botón y foco
                const btn = loginForm.querySelector('button');
                btn.textContent = 'Verificar Código';
                tokenInput.focus();

                errorMsg.textContent = 'Introduce el código de tu app autenticadora.';
                errorMsg.style.color = '#2563eb'; // Azul informativo
                return;
            }

            // Login exitoso sin 2FA
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            window.location.href = '/';

        } else {
            // PASO 2: Verificar 2FA
            const token2fa = document.getElementById('token-2fa').value;
            const userId = loginForm.dataset.userId;

            const data = await request('/auth/2fa/verify', 'POST', {
                userId,
                token: token2fa
            });

            // Login exitoso con 2FA
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            window.location.href = '/';
        }

    } catch (error) {
        errorMsg.textContent = error.message || 'Error al iniciar sesión';
        errorMsg.style.color = 'red';
    }
});
