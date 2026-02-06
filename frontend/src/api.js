// URL base donde corre nuestro servidor de backend
const API_URL = 'http://localhost:3000';

/**
 * Función genérica para realizar peticiones HTTP a la API.
 * Gestiona automáticamente los tokens de autenticación y el parseo de respuestas.
 * 
 * @param {string} endpoint - La ruta a la que queremos llamar (ej: '/properties')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE). Por defecto GET.
 * @param {Object} body - Datos a enviar en el cuerpo de la petición (opcional).
 * @param {boolean} isBlob - Si esperamos un archivo binario como respuesta.
 * @returns {Promise<any>} - La respuesta del servidor parseada.
 */
export async function request(endpoint, method = 'GET', body = null, isBlob = false) {
    // Configuración inicial de cabeceras
    const headers = {
        'Content-Type': 'application/json'
    };

    // Si tenemos un token guardado, lo inyectamos para autenticación
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Preparamos la configuración para fetch
    const config = {
        method,
        headers,
    };

    // Si hay datos para enviar, los convertimos a JSON
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        // Realizamos la petición al servidor
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Manejo especial para descargas de archivos (Blob)
        if (isBlob) {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error descargando archivo');
            }
            return await response.blob();
        }

        // Para peticiones JSON normales
        const data = await response.json();

        // Si el servidor nos devuelve un error (4xx, 5xx), lo lanzamos
        if (!response.ok) {
            throw new Error(data.msg || 'Error en la petición');
        }

        return data;

    } catch (error) {
        // Personalizamos el error de conexión para que sea más amigable
        if (error.message === 'Failed to fetch') {
            throw new Error('No se pudo conectar con el servidor. Asegúrese de que el backend está corriendo.');
        }
        // Propagamos cualquier otro error
        throw error;
    }
}
