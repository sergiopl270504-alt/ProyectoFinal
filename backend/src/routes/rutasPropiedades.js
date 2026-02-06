const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { obtenerPropiedades, obtenerPropiedad, crearPropiedad, editarPropiedad, eliminarPropiedad, descargarPDF, reporte } = require('../controllers/controladorPropiedades');
const checkAuth = require('../middleware/authMiddleware');

// Público

/**
 * @route GET /propiedades
 * @description Obtiene todas las propiedades públicas.
 * @access Público
 */
router.get('/', obtenerPropiedades);
/**
 * @route GET /propiedades/reporte
 * @description Descarga reporte general de ventas en PDF.
 * @access Público (Pudiera ser restringido en el futuro)
 */
router.get('/reporte', reporte); // Debe ir antes de /:id para no confundirse

/**
 * @route GET /propiedades/:id
 * @description Obtiene detalles de una propiedad.
 * @access Público
 */
router.get('/:id', obtenerPropiedad);

/**
 * @route GET /propiedades/:id/pdf
 * @description Descarga ficha técnica de la propiedad en PDF.
 * @access Público
 */
router.get('/:id/pdf', descargarPDF);

// Privado / Admin
/**
 * @route POST /propiedades
 * @description Crea una nueva propiedad.
 * @access Privado
 */
router.post('/', checkAuth, [
    check('titulo', 'El titulo es obligatorio').not().isEmpty()
], crearPropiedad);

/**
 * @route PUT /propiedades/:id
 * @description Actualiza una propiedad existente.
 * @access Privado (Propietario o Admin)
 */
router.put('/:id', checkAuth, editarPropiedad);

/**
 * @route DELETE /propiedades/:id
 * @description Elimina una propiedad.
 * @access Privado (Propietario o Admin)
 */
router.delete('/:id', checkAuth, eliminarPropiedad);

module.exports = router;
