const Propiedad = require('../models/Propiedad');
const Categoria = require('../models/Categoria');
const Usuario = require('../models/Usuario');
const { validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');

// Obtener todas las propiedades (Público)
/**
 * Obtiene todas las propiedades publicadas.
 * 
 * Recupera el listado de propiedades activas y disponibles para el público en general.
 * Incluye información relacionada como la categoría a la que pertenecen y el usuario propietario.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Array} Listado JSON de propiedades.
 */
const obtenerPropiedades = async (req, res) => {
    try {
        const { search } = req.query;
        let whereCondition = { publicado: true };

        if (search) {
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { titulo: { [Op.like]: `%${search}%` } },
                    { descripcion: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const propiedades = await Propiedad.findAll({
            where: whereCondition,
            include: [
                { model: Categoria, attributes: ['nombre'] },
                { model: Usuario, attributes: ['nombre_completo'] }
            ]
        });
        res.json(propiedades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error obteniendo propiedades' });
    }
};

// Obtener detalles de una propiedad
/**
 * Obtiene los detalles de una propiedad específica.
 * 
 * Busca una propiedad por su ID e incluye información detallada como categoría
 * y datos de contacto del usuario anunciante.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - ID de la propiedad.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} Detalle de la propiedad en formato JSON.
 */
const obtenerPropiedad = async (req, res) => {
    const { id } = req.params;
    try {
        const propiedad = await Propiedad.findByPk(id, {
            include: [
                { model: Categoria, attributes: ['nombre'] },
                { model: Usuario, attributes: ['nombre_completo', 'movil'] }
            ]
        });

        if (!propiedad) {
            return res.status(404).json({ msg: 'Propiedad no encontrada' });
        }

        res.json(propiedad);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
}

// Crear Propiedad (Requiere Auth)
/**
 * Crea una nueva propiedad en la base de datos.
 * 
 * Valida los datos recibidos, procesa la imagen (si se proporciona una URL de Unsplash
 * se ajusta para optimización) y guarda el registro asociado al usuario actual.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.body - Datos de la propiedad (título, precio, características, etc.).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} La propiedad creada en formato JSON.
 */
const crearPropiedad = async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio, categoryId, imagen } = req.body;

        // Lógica de Imagen: Si viene imagen con w=500 (optimizada) o normal, usarla.
        // Si no viene imagen, poner una por defecto aleatoria.
        let urlImagen = imagen;
        if (!urlImagen) {
            const backups = [
                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80'
            ];
            urlImagen = backups[Math.floor(Math.random() * backups.length)];
        } else if (urlImagen && urlImagen.includes('w=500')) {
            // Corrección para imágenes cacheadas pequeñas
            urlImagen = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80';
        }

        const propiedad = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precio,
            imagen: urlImagen,
            categoryId,
            userId: req.usuario.id,
            publicado: true
        });

        res.status(201).json(propiedad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear la propiedad' });
    }
}

// Editar Propiedad (Requiere ser dueño o Admin)
/**
 * Actualiza la información de una propiedad existente.
 * 
 * Verifica que el usuario sea el propietario o un administrador antes de aplicar cambios.
 * Permite actualizar campos básicos de la propiedad.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - ID de la propiedad a editar.
 * @param {Object} req.body - Nuevos datos para actualización.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} JSON confirmando la actualización.
 */
const editarPropiedad = async (req, res) => {
    const { id } = req.params;
    try {
        let propiedad = await Propiedad.findByPk(id);

        if (!propiedad) return res.status(404).json({ msg: 'No encontrada' });

        if (propiedad.userId.toString() !== req.usuario.id && req.usuario.tipo_usuario !== 'admin') {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        await propiedad.update(req.body);

        res.json({ msg: 'Propiedad actualizada', propiedad });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error actualizando' });
    }
}

// Eliminar Propiedad
/**
 * Elimina una propiedad del sistema.
 * 
 * Verifica permisos de propiedad o administración antes de eliminar el registro.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - ID de la propiedad a eliminar.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} JSON confirmando la eliminación.
 */
const eliminarPropiedad = async (req, res) => {
    const { id } = req.params;
    try {
        const propiedad = await Propiedad.findByPk(id);

        if (!propiedad) return res.status(404).json({ msg: 'No encontrada' });

        if (propiedad.userId.toString() !== req.usuario.id && req.usuario.tipo_usuario !== 'admin') {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        await propiedad.destroy();
        res.json({ msg: 'Propiedad eliminada' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error eliminando' });
    }
}

// Generar PDF
/**
 * Genera un folleto PDF de una propiedad.
 * 
 * Crea dinámicamente un documento PDF con los detalles principales de la propiedad
 * (título, descripción, precio, características) listo para descargar.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - ID de la propiedad.
 * @param {Object} res - Objeto de respuesta (stream PDF).
 */
const descargarPDF = async (req, res) => {
    const { id } = req.params;
    try {
        const propiedad = await Propiedad.findByPk(id);
        if (!propiedad) return res.status(404).json({ msg: 'Propiedad no encontrada' });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=propiedad-${id}.pdf`);

        doc.pipe(res);

        doc.fontSize(25).text(propiedad.titulo, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(propiedad.descripcion);
        doc.moveDown();
        doc.text(`Precio: ${propiedad.precio}€`);
        doc.text(`Habitaciones: ${propiedad.habitaciones}`);
        doc.text(`Baños: ${propiedad.wc}`);

        doc.end();

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error generando PDF' });
    }
}

// Generar Reporte Ventas
/**
 * Genera un reporte global de ventas y propiedades en PDF.
 * 
 * Crea un listado completo de todas las propiedades registradas, indicando su estado
 * (en venta o vendido) y precio. Útil para informes administrativos.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta (stream PDF).
 */
const reporte = async (req, res) => {
    try {
        const propiedades = await Propiedad.findAll();
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte.pdf`);

        doc.pipe(res);
        doc.fontSize(20).text('Informe de Propiedades', { align: 'center' });
        doc.moveDown();

        propiedades.forEach(prop => {
            doc.fontSize(12).text(`- ${prop.titulo}: ${prop.precio}€ (${prop.vendido ? 'VENDIDO' : 'EN VENTA'})`);
        });

        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error generando reporte' });
    }
}

module.exports = {
    obtenerPropiedades,
    obtenerPropiedad,
    crearPropiedad,
    editarPropiedad,
    eliminarPropiedad,
    descargarPDF,
    reporte
};
