const Consulta = require('../models/Consulta');
const Propiedad = require('../models/Propiedad');
const Usuario = require('../models/Usuario');
const Mensaje = require('../models/Mensaje');

// Crear una nueva consulta (hilo de conversación)
/**
 * Crea una nueva consulta (hilo de mensajes) sobre una propiedad.
 * 
 * Inicia una conversación entre un usuario interesado y el sistema (o administrador)
 * respecto a una propiedad específica, creando el primer mensaje del hilo.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.body - Datos de la consulta (mensaje inicial, ID de propiedad).
 * @param {Object} req.usuario - Usuario autenticado que envía la consulta.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} JSON con la consulta creada y confirmación.
 */
const crearConsulta = async (req, res) => {
    const { mensaje, propertyId } = req.body;
    const userId = req.usuario.id;

    try {
        // Crear la Consulta (Hilo)
        const consulta = await Consulta.create({
            mensaje: mensaje, // Mantener para compatibilidad/vista previa
            fecha_envio: new Date(),
            propertyId,
            userId
        });

        // Crear el primer Mensaje
        await Mensaje.create({
            inquiryId: consulta.id,
            contenido: mensaje,
            remitente: 'usuario',
            fecha_envio: new Date()
        });

        res.json({ msg: 'Mensaje enviado correctamente', consulta });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al enviar mensaje' });
    }
};

// Obtener lista de consultas
/**
 * Obtiene la lista de consultas o conversaciones.
 * 
 * Si el usuario es administrador, devuelve todas las consultas.
 * Si es un usuario normal, devuelve solo sus propias consultas.
 * Incluye datos relacionados como el usuario y la propiedad.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.usuario - Usuario autenticado.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Array} Lista de objetos de consulta.
 */
const obtenerMensajes = async (req, res) => {
    try {
        let where = {};

        // Si no es admin, solo ve sus propios mensajes
        if (req.usuario.tipo_usuario !== 'admin') {
            where.userId = req.usuario.id;
        }

        const consultas = await Consulta.findAll({
            where,
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nombre_completo', 'correo_electronico'] },
                { model: Propiedad, as: 'propiedad', attributes: ['titulo', 'imagen'] },
                { model: Mensaje, as: 'mensajes', limit: 1, order: [['fecha_envio', 'DESC']] } // Vista previa del último mensaje
            ],
            order: [['fecha_envio', 'DESC']]
        });
        res.json(consultas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener mensajes' });
    }
}

// Obtener detalles de una consulta (chat completo)
/**
 * Recupera el detalle completo de una consulta específica.
 * 
 * Devuelve el hilo de conversación completo con todos los mensajes,
 * ordenados cronológicamente. Verifica que el usuario tenga permisos
 * para ver esta conversación.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - ID de la consulta.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} Objeto de consulta con mensajes anidados.
 */
const obtenerDetalleMensaje = async (req, res) => {
    const { id } = req.params;
    try {
        const consulta = await Consulta.findByPk(id, {
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nombre_completo'] },
                { model: Propiedad, as: 'propiedad', attributes: ['titulo', 'imagen'] },
                { model: Mensaje, as: 'mensajes', order: [['fecha_envio', 'ASC']] }
            ]
        });

        if (!consulta) return res.status(404).json({ msg: 'Mensaje no encontrado' });

        // Verificación de seguridad
        if (req.usuario.tipo_usuario !== 'admin' && consulta.userId !== req.usuario.id) {
            return res.status(403).json({ msg: 'No autorizado' });
        }

        res.json(consulta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener detalles' });
    }
}

// Responder a un mensaje
/**
 * Envía una respuesta dentro de un hilo de conversación existente.
 * 
 * Agrega un nuevo mensaje a la consulta y actualiza la fecha de modificación
 * para que aparezca como reciente. Identifica automáticamente si el remitente
 * es usuario o administrador.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - ID de la consulta a responder.
 * @param {Object} req.body - Contenido de la respuesta.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} JSON confirmando el envío.
 */
const responderMensaje = async (req, res) => {
    const { id } = req.params;
    const { respuesta } = req.body;

    try {
        const consulta = await Consulta.findByPk(id);
        if (!consulta) {
            return res.status(404).json({ msg: 'Mensaje no encontrado' });
        }

        // Determinar remitente
        const remitente = req.usuario.tipo_usuario === 'admin' ? 'admin' : 'usuario';

        // Crear nuevo Mensaje
        await Mensaje.create({
            inquiryId: id,
            contenido: respuesta,
            remitente: remitente,
            fecha_envio: new Date()
        });

        // Actualizar timestamps de la consulta para ordenamiento
        consulta.changed('updatedAt', true);

        // Para soporte legado, actualizar estos campos si responde el Admin
        if (remitente === 'admin') {
            consulta.respuesta = respuesta;
            consulta.fecha_respuesta = new Date();
        }

        await consulta.save();

        res.json({ msg: 'Mensaje enviado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al responder mensaje' });
    }
}
/**
 * Elimina una consulta y todos sus mensajes asociados.
 * 
 * Permite al usuario (propietario) o al administrador borrar un hilo de conversación completo.
 * 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - ID de la consulta a eliminar.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Object} JSON confirmando la eliminación.
 */
const eliminarConsulta = async (req, res) => {
    const { id } = req.params;
    try {
        const consulta = await Consulta.findByPk(id);

        if (!consulta) {
            return res.status(404).json({ msg: 'Conversación no encontrada' });
        }

        // Verificar permisos: Solo el dueño o admin pueden borrar
        if (req.usuario.tipo_usuario !== 'admin' && consulta.userId !== req.usuario.id) {
            return res.status(403).json({ msg: 'No tienes permiso para eliminar esta conversación' });
        }

        // Eliminar mensajes asociados primero (por si no hay ON DELETE CASCADE)
        await Mensaje.destroy({ where: { inquiryId: id } });

        // Eliminar la consulta
        await consulta.destroy();

        res.json({ msg: 'Conversación eliminada correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al eliminar conversación' });
    }
}

module.exports = {
    crearConsulta,
    obtenerMensajes,
    obtenerDetalleMensaje,
    responderMensaje,
    eliminarConsulta
};
