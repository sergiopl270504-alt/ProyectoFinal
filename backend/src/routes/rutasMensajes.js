const express = require('express');
const router = express.Router();
const { crearConsulta, obtenerMensajes, obtenerDetalleMensaje, responderMensaje, eliminarConsulta } = require('../controllers/controladorMensajes');
const checkAuth = require('../middleware/authMiddleware'); // Podríamos renombrar middlewares también luego
// const checkAdmin = require('../middleware/adminMiddleware'); 

/**
 * @route POST /mensajes
 * @description Crea una nueva consulta/mensaje sobre una propiedad.
 * @access Privado
 */
router.post('/', checkAuth, crearConsulta);

/**
 * @route GET /mensajes
 * @description Obtiene todas las consultas del usuario (o todas si es admin).
 * @access Privado
 */
router.get('/', checkAuth, obtenerMensajes);

/**
 * @route GET /mensajes/:id
 * @description Obtiene el detalle completo de una consulta específica.
 * @access Privado
 */
router.get('/:id', checkAuth, obtenerDetalleMensaje);

/**
 * @route PUT /mensajes/:id/reply
 * @description Responde a una consulta existente.
 * @access Privado
 */
router.put('/:id/reply', checkAuth, responderMensaje);

/**
 * @route DELETE /mensajes/:id
 * @description Elimina una consulta y sus mensajes.
 * @access Privado
 */
const { eliminarConsulta } = require('../controllers/controladorMensajes'); // Asegurarse de importar, pero ya está arriba en la línea 3 si la actualizamos... espera, la línea 3 importa todo.
router.delete('/:id', checkAuth, eliminarConsulta);

module.exports = router;
