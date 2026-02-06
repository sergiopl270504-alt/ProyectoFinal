const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Genera un PDF con los detalles de una propiedad individual.
 * 
 * @param {Object} property - Objeto con datos de la propiedad.
 * @param {Object} res - Objeto de respuesta para enviar el stream del PDF.
 */
const generatePropertyPDF = (property, res) => {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=propiedad_${property.id}.pdf`);

    doc.pipe(res);

    doc.fontSize(25).text(property.titulo, { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Precio: ${property.precio} €`);
    doc.text(`Ubicación: ${property.calle}`);
    doc.moveDown();
    doc.fontSize(12).text(property.descripcion);

    doc.moveDown();
    doc.text(`Habitaciones: ${property.habitaciones}`);
    doc.text(`WC: ${property.wc}`);
    doc.text(`Estacionamiento: ${property.estacionamiento ? 'Sí' : 'No'}`);

    doc.end();
};

/**
 * Genera un reporte PDF con el balance de ventas.
 * 
 * Calcula ingresos totales, propiedades vendidas vs activas y lista el detalle.
 * 
 * @param {Array} properties - Lista de todas las propiedades.
 * @param {Object} res - Objeto de respuesta.
 */
const generateSalesReport = (properties, res) => {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=balance-ventas.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Balance de Ventas - Casafinder', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    // Calculations
    const soldProperties = properties.filter(p => p.vendido);
    const totalRevenue = soldProperties.reduce((sum, p) => sum + parseFloat(p.precio), 0);
    const activeProperties = properties.length - soldProperties.length;

    // Summary Box
    doc.fontSize(14).text('Resumen Financiero', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Propiedades Vendidas: ${soldProperties.length}`);
    doc.text(`Total Ingresos Generados: ${totalRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`);
    doc.text(`Propiedades Activas: ${activeProperties}`);
    doc.moveDown(2);

    // Detail List
    doc.fontSize(14).text('Detalle de Ventas Cerradas', { underline: true });
    doc.moveDown();

    doc.fontSize(10);
    doc.text('Fecha (Sim.)   |   Propiedad                                          |   Precio Venta', { bold: true });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    if (soldProperties.length === 0) {
        doc.text('No hay ventas registradas en este período.');
    } else {
        soldProperties.forEach(p => {
            const titulo = p.titulo.substring(0, 45).padEnd(50, ' ');
            const precio = `${parseFloat(p.precio).toLocaleString('es-ES')} €`.padStart(15, ' ');

            doc.text(`--/--/----       ${titulo}   ${precio}`);
            doc.moveDown(0.5);
        });
    }

    doc.end();
};

module.exports = {
    generatePropertyPDF,
    generateSalesReport
}
