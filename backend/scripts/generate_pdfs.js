const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Función auxiliar para añadir secciones con estilo consistente y soporte para contenido complejo
 */
function addSection(doc, title, content) {
    // Añadir nueva página si estamos muy abajo (estimación simple) o forzar para títulos principales
    if (doc.y > 650) doc.addPage();

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(16).text(title, { underline: true });
    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(11); // Reset font

    if (typeof content === 'string') {
        doc.text(content, { align: 'justify', lineGap: 2 });
    } else if (Array.isArray(content)) {
        content.forEach(p => {
            if (p.subtitle) {
                doc.moveDown(0.8);
                doc.font('Helvetica-Bold').fontSize(13).text(p.subtitle);
                doc.font('Helvetica').fontSize(11);
                doc.moveDown(0.3);
            }
            if (p.text) {
                doc.text(p.text, { align: 'justify', lineGap: 2 });
                doc.moveDown(0.5);
            }
            if (p.list) {
                p.list.forEach(item => {
                    doc.text(`• ${item}`, { indent: 15, align: 'justify', lineGap: 2 });
                });
                doc.moveDown(0.5);
            }
            if (p.code) {
                doc.moveDown(0.2);
                doc.font('Courier').fontSize(9).text(p.code, {
                    indent: 20,
                    width: 450,
                    align: 'left'
                });
                doc.font('Helvetica').fontSize(11);
                doc.moveDown(0.5);
            }
            if (p.note) {
                doc.moveDown(0.2);
                doc.font('Helvetica-Oblique').fontSize(10).text(`NOTA: ${p.note}`, {
                    indent: 10,
                    color: '#444444'
                });
                doc.font('Helvetica').fontSize(11).fillColor('black');
                doc.moveDown(0.5);
            }
        });
    }
}

// ==========================================
// 1. GENERAR MANUAL DE USUARIO (EXTENDIDO)
// ==========================================
const docManual = new PDFDocument({ margin: 50, autoFirstPage: false });
docManual.pipe(fs.createWriteStream('c:/Users/Sergio/Documents/Proyecto_final/MANUAL_USUARIO.pdf'));

// PORTADA
docManual.addPage();
docManual.rect(0, 0, docManual.page.width, docManual.page.height).fill('#f8fafc'); // Fondo gris claro
docManual.fillColor('#1e3a8a').fontSize(36).text('MANUAL DE USUARIO', 0, 250, { align: 'center' });
docManual.fontSize(20).text('Plataforma Integral Casafinder', { align: 'center' });
docManual.moveDown(2);
docManual.fontSize(12).fillColor('#4b5563').text('Guía Completa de Operación y Procedimientos', { align: 'center' });
docManual.text('Versión 2.2 - Edición Extendida', { align: 'center' });
docManual.text('Febrero 2026', { align: 'center' });
docManual.addPage(); // Página en blanco para iniciar contenido
docManual.fillColor('black');

// CONTENIDO DETALLADO
addSection(docManual, '1. Introducción y Propósito', [
    { text: 'Bienvenido a Casafinder, la plataforma inmobiliaria de última generación diseñada para simplificar la conexión entre propiedades excepcionales y sus futuros propietarios.' },
    { text: 'Este manual ha sido elaborado para proporcionar una comprensión exhaustiva de cada funcionalidad del sistema. Está dirigido tanto a usuarios visitantes que buscan su nuevo hogar, como a agentes inmobiliarios que gestionan una cartera de activos, y administradores del sistema.' },
    {
        subtitle: '1.1. Requisitos del Sistema', list: [
            'Navegador Web: Google Chrome (recomendado), Mozilla Firefox, Microsoft Edge o Safari.',
            'Conexión a Internet: Estable para la carga de imágenes y chat en tiempo real.',
            'Dispositivo: El diseño "Responsive" se adapta a ordenadores de escritorio, tabletas y teléfonos móviles.'
        ]
    }
]);

addSection(docManual, '2. Primeros Pasos: Acceso y Seguridad', [
    {
        subtitle: '2.1. Registro de Nueva Cuenta', text: 'Para acceder a las funcionalidades avanzadas (mensajería, favoritos), es obligatorio crear una cuenta personal. Este proceso garantiza la seguridad de la comunidad.', list: [
            'Navegación: Haga clic en el botón "Regístrate" situado en la esquina superior derecha.',
            'Formulario de Alta: Complete sus datos verídicos. El campo "Email" será su identificador único.',
            'Validación de Seguridad: La contraseña debe cumplir requisitos mínimos de complejidad para asegurar su protección.',
            'Verificación: Al finalizar, el sistema puede requerir una confirmación para evitar cuentas robot.'
        ]
    },
    {
        subtitle: '2.2. Inicio de Sesión (Login)', text: 'Acceda a su cuenta mediante sus credenciales.', list: [
            'Introduzca su correo electrónico y contraseña.',
            'Si olvida su contraseña, utilice la opción "¿Olvidaste tu contraseña?" para iniciar el flujo de recuperación segura vía email.'
        ]
    }
]);

addSection(docManual, '3. Seguridad Avanzada: Autenticación de Dos Factores (2FA)', [
    { text: 'Casafinder implementa estándares de seguridad bancaria mediante 2FA (Two-Factor Authentication). Esta función añade una capa extra de protección, haciendo imposible que alguien acceda a su cuenta incluso si conocen su contraseña.' },
    {
        subtitle: '3.1. Proceso de Activación', list: [
            '1. Inicie sesión y haga clic en su nombre en la barra superior -> "Ajustes".',
            '2. Localice la sección "Seguridad" y pulse el botón "Activar 2FA".',
            '3. El sistema mostrará un Código QR único y secreto.',
            '4. Abra su aplicación autenticadora en el móvil (Google Authenticator, Microsoft Authenticator o Authy).',
            '5. Seleccione "Escanear código QR" en la app y apunte a la pantalla.',
            '6. La aplicación comenzará a generar códigos de 6 dígitos que cambian cada 30 segundos.'
        ]
    },
    { subtitle: '3.2. Verificar Activación', text: 'Para confirmar que el proceso ha sido exitoso, introduzca el código de 6 dígitos actual de su app en el campo de verificación de la web. Si es correcto, el 2FA quedará activo permanentemente.' },
    { note: 'Si pierde acceso a su dispositivo móvil, deberá contactar con el soporte técnico para verificar su identidad y restablecer el acceso manual.' }
]);

addSection(docManual, '4. Módulo de Agentes: Gestión de Propiedades', [
    { text: 'Esta sección es exclusiva para usuarios con rol de Administrador o Agente.' },
    {
        subtitle: '4.1. Publicación de un Nuevo Activo', text: 'El formulario de creación está diseñado para capturar la esencia de la propiedad y maximizar su atractivo.', list: [
            'Título del Anuncio: Debe ser descriptivo y llamativo (ej. "Ático Lujoso con Vistas al Mar" en lugar de "Piso en venta").',
            'Descripción: Texto libre ilimitado para detallar calidades, entorno y ventajas.',
            'Datos Cuantitativos: Precio, Habitaciones, Baños y Plazas de Estacionamiento.',
            'Geolocalización: El mapa integrado permite arrastrar el pin para ubicar la propiedad con precisión de coordenadas GPS.',
            'Imagen Promocional: Inserte una URL de imagen. Si se deja vacío, el sistema inteligente asignará una imagen de alta calidad de nuestro banco de recursos.'
        ]
    },
    { subtitle: '4.2. Edición y Eliminación', text: 'Desde el panel "Mis Propiedades", puede modificar cualquier dato de un anuncio activo o eliminarlo si ya ha sido vendido o retirado del mercado.' }
]);

addSection(docManual, '5. Sistema de Comunicación y Mensajería', [
    { subtitle: '5.1. Contactar con un Agente', text: 'En la ficha de cualquier propiedad, encontrará el módulo de contacto. Al enviar un mensaje, se crea automáticamente un "Hilo de Conversación" privado entre usted y el vendedor.' },
    {
        subtitle: '5.2. Centro de Mensajes', text: 'Su bandeja de entrada centraliza todas las negociaciones.', list: [
            'Notificaciones Visuales: Un indicador rojo señala conversaciones con mensajes pendientes de lectura.',
            'Actualización en Tiempo Real: El chat se actualiza automáticamente cada 10 segundos sin necesidad de recargar la página (polling inteligente).',
            'Gestión de Hilos: Puede archivar o eliminar definitivamente conversaciones que ya no sean relevantes mediante el icono de papelera. Esta acción es irreversible.'
        ]
    },
    { subtitle: '5.3. Navegación Móvil de Chats', text: 'En dispositivos móviles, la interfaz se transforma para ofrecer una experiencia similar a las redes sociales ("Stories"), permitiendo deslizar horizontalmente entre sus diferentes conversaciones activas.' }
]);

docManual.end();
console.log('Manual de Usuario Extendido generado.');


// ==========================================
// 2. GENERAR DOCUMENTACIÓN TÉCNICA (EXTENDIDA)
// ==========================================
const docTecnica = new PDFDocument({ margin: 50, autoFirstPage: false });
docTecnica.pipe(fs.createWriteStream('c:/Users/Sergio/Documents/Proyecto_final/DOCUMENTACION_TECNICA.pdf'));

// PORTADA
docTecnica.addPage();
docTecnica.rect(0, 0, docTecnica.page.width, docTecnica.page.height).fill('#1e293b'); // Fondo oscuro
docTecnica.fillColor('white').fontSize(36).text('MEMORIA TÉCNICA', 0, 250, { align: 'center' });
docTecnica.fontSize(16).text('Arquitectura, Seguridad y Despliegue', { align: 'center' });
docTecnica.moveDown(4);
docTecnica.fontSize(12).text('Proyecto Final de Grado - Desarrollo de Aplicaciones Web', { align: 'center' });
docTecnica.text('Autor: Sergio Peral López', { align: 'center' });
docTecnica.addPage();
docTecnica.fillColor('black');

// CONTENIDO DETALLADO
addSection(docTecnica, '1. Resumen Ejecutivo del Proyecto',
    'Casafinder representa la culminación de un proceso de ingeniería de software enfocado en la robustez, escalabilidad y experiencia de usuario. Es una plataforma B2C (Business to Consumer) que facilita la intermediación inmobiliaria mediante una arquitectura moderna, segura y eficiente. El sistema ha sido diseñado siguiendo los principios SOLID y patrones de diseño empresariales.'
);

addSection(docTecnica, '2. Pila Tecnológica (Tech Stack)', [
    { text: 'La elección de tecnologías responde a la necesidad de un ecosistema JavaScript unificado (Full Stack JS) que permita alta concurrencia y facilidad de mantenimiento.' },
    {
        subtitle: '2.1. Backend: Node.js & Express Ecosystem', list: [
            'Runtime: Node.js v18+ por su modelo de I/O no bloqueante, ideal para aplicaciones con alta carga de lectura (I/O bound).',
            'Framework: Express.js v4.18 por su minimalismo y sistema de middleware robusto.',
            'Motor de Plantillas: Pug (anteriormente Jade) para renderizado SSR en vistas específicas.',
            'Utilidades: bcrypt (hashing), jsonwebtoken (auth), pdfkit (generación de documentos), speakeasy (criptografía 2FA).'
        ]
    },
    { subtitle: '2.2. Frontend: Vanilla JavaScript Moderno', text: 'Se ha optado por NO utilizar frameworks reactivos (React/Vue) para demostrar un dominio profundo del lenguaje y reducir el bundle size. El frontend utiliza ES6 Modules, Fetch API para comunicación asíncrona y manipulación directa del DOM optimizada.' },
    { subtitle: '2.3. Persistencia: MySQL & Sequelize ORM', text: 'Base de datos relacional MySQL 8.0 para garantizar integridad referencial (ACID). Sequelize se utiliza como capa de abstracción para prevenir inyecciones SQL y facilitar la migración de esquemas.' }
]);

addSection(docTecnica, '3. Arquitectura del Software', [
    { text: 'El proyecto implementa el patrón MVC (Modelo-Vista-Controlador) de forma estricta para separar responsabilidades.' },
    {
        subtitle: '3.1. Controladores (Controllers)', text: 'Encapsulan la lógica de negocio. Ejemplos clave:', list: [
            'controladorAuth.js: Orquesta el flujo de autenticación, incluyendo la máquina de estados del login (verificación pass -> verificación 2FA -> emisión token).',
            'controladorPropiedades.js: Gestiona el ciclo de vida de los inmuebles (CRUD) y la lógica de búsqueda con operadores SQL (LIKE).',
            'controladorMensajes.js: Implementa la lógica de comunicación, validando permisos (un usuario no puede auto-escribirse).'
        ]
    },
    {
        subtitle: '3.2. Modelos de Datos (Models)', list: [
            'Usuario: Define atributos críticos como "secret_2fa" (Clave TOTP) y "token_confirmacion". Incluye Hooks (beforeCreate) para el hashing automático de contraseñas.',
            'Propiedad: Relación 1:N con Usuarios. Almacena metadatos y geolocalización.',
            'Mensaje/Consulta: Relación compleja que vincula Usuario (Emisor), Propiedad (Contexto) y Usuario (Receptor).'
        ]
    }
]);

addSection(docTecnica, '4. Seguridad y Criptografía', [
    { text: 'La seguridad ha sido una prioridad desde la fase de diseño (Security by Design).' },
    { subtitle: '4.1. Autenticación Stateless (JWT)', text: 'El sistema no mantiene sesiones en memoria. Cada petición es autenticada independientemente mediante un JSON Web Token firmado con algoritmo HMAC SHA256. Esto permite escalar horizontalmente el backend sin problemas de afinidad de sesión.' },
    { subtitle: '4.2. Implementación de 2FA (RFC 6238)', code: 'Algoritmo: TOTP (Time-based One-Time Password)\nVentana de Tiempo: 30 segundos\nLongitud: 6 dígitos\nCodificación Secreto: Base32' },
    { text: 'El flujo 2FA verifica dos factores: "Algo que sabes" (Contraseña) y "Algo que tienes" (Dispositivo móvil con semilla criptográfica).' },
    {
        subtitle: '4.3. Protección de Datos', list: [
            'Contraseñas: Hasheadas con bcrypt (Salt rounds = 10).',
            'CSRF/XSS: Sanitización de inputs mediante express-validator para prevenir inyecciones.',
            'Cabeceras HTTP: Configuración de seguridad básica.'
        ]
    }
]);

addSection(docTecnica, '5. API RESTful y Endpoints', [
    { text: 'La API expone recursos mediante verbos HTTP semánticos:' },
    { subtitle: 'Auth', code: 'POST /auth/login\nPOST /auth/registro\nPOST /auth/verify-2fa' },
    { subtitle: 'Propiedades', code: 'GET /propiedades (Listado público)\nPOST /propiedades/crear (Protegido)\nGET /propiedades/pdf/:id (Generación binaria)' },
    { subtitle: 'Mensajería', code: 'GET /mensajes (Inbox)\nPOST /mensajes/enviar' }
]);

addSection(docTecnica, '6. Infraestructura y Despliegue', [
    { subtitle: '6.1. Contenerización (Docker)', text: 'El proyecto incluye un docker-compose.yml que orquesta los servicios necesarios (App Node.js + Base de datos MySQL), garantizando paridad entre los entornos de desarrollo y producción.' },
    { subtitle: '6.2. Servidor Web (Nginx)', text: 'Configurado como Reverse Proxy para gestionar las conexiones entrantes, servir archivos estáticos (caching) y redirigir el tráfico de API al servicio de Node.js.' },
    { subtitle: '6.3. Cloud (AWS)', text: 'Desplegado en instancia EC2. Estrategia de "Always-on" mediante gestores de procesos (PM2) para garantizar disponibilidad 99.9%.' }
]);

docTecnica.end();
console.log('Documentación Técnica Extendida generada.');
