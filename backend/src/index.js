const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Archivo principal del servidor Backend.
 * 
 * Configura la aplicación Express, establece la conexión a la base de datos,
 * define middlewares globales y gestiona las rutas de la API.
 */
const app = express();
const cors = require('cors');
const { logRequest, logError } = require('./config/logger');

// Habilitar CORS
app.use(cors());

// Desactivar caché y CSP Permisivo (Mover al principio)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'unsafe-inline'; form-action *;");
    next();
});

// Registro de Logs en Archivo
app.use(logRequest);

// Servir Frontend Estático
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend')));

// Conexión a Base de Datos
const { db } = require('./models/index');

/**
 * Establece la conexión con la base de datos PostgreSQL.
 * 
 * Intenta conectar y sincronizar los modelos. Si falla, realiza reintentos automáticos.
 * También inicializa datos semilla (Admin, Categorías) si la base de datos está vacía.
 * 
 * @param {number} intentos - Número de intentos restantes para conectar.
 */
async function conectarBD(intentos = 5) {
    try {
        await db.authenticate();
        await db.sync({ alter: true }); // Actualizar tablas

        // Semilla de Categoría
        const { Categoria, Usuario } = require('./models/index');
        const count = await Categoria.count();
        if (count === 0) {
            await Categoria.create({ nombre: 'Residencial' });
            console.log('Categoría por defecto creada');
        }

        // Semilla de Usuario Administrador
        const adminEmail = 'admin@casafinder.com';
        let adminUser = await Usuario.findOne({ where: { correo_electronico: adminEmail } });
        if (!adminUser) {
            adminUser = await Usuario.create({
                nombre_completo: 'Administrador',
                movil: '600123456',
                correo_electronico: adminEmail,
                contrasena: 'admin123', // Será hasheado por el hook
                tipo_usuario: 'admin',
                verificado: true,
                token_confirmacion: null
            });
            console.log('Usuario Administrador creado: admin@casafinder.com / admin123');
        }

        // Semilla de Usuario Normal
        const userEmail = 'usuario@casafinder.com';
        let normalUser = await Usuario.findOne({ where: { correo_electronico: userEmail } });
        if (!normalUser) {
            await Usuario.create({
                nombre_completo: 'Usuario Ejemplar',
                movil: '600000000',
                correo_electronico: userEmail,
                contrasena: 'usuario123',
                tipo_usuario: 'usuario',
                verificado: true,
                token_confirmacion: null
            });
            console.log('Usuario Normal creado: usuario@casafinder.com / usuario123');
        }

        // Semilla de Propiedades
        const { Propiedad } = require('./models/index');
        const propCount = await Propiedad.count();
        if (propCount === 0 && adminUser) {
            // Nota: Se ha cambiado el nombre de imagen para usar imágenes reales si se desea
            await Propiedad.bulkCreate([
                {
                    id: 'bddec231-5061-4545-923f-4d3246345678', // UUID estático
                    titulo: 'Apartamento de Lujo en Centro',
                    descripcion: 'Espectacular apartamento renovado con vistas a la ciudad.',
                    habitaciones: 3,
                    estacionamiento: true,
                    wc: 2,
                    calle: 'Calle Mayor 123',
                    lat: '40.4168',
                    lng: '-3.7038',
                    imagen: 'https://images.unsplash.com/photo-1600596542815-6ad4c4273250?auto=format&fit=crop&w=800&q=80',
                    precio: 350000,
                    publicado: true,
                    userId: adminUser.id,
                    categoryId: 1 // Asumiendo ID 1 es Residencial
                },
                {
                    id: 'bddec231-5061-4545-923f-4d3246345679',
                    titulo: 'Chalet Moderno con Piscina',
                    descripcion: 'Casa independiente con amplio jardín y piscina privada.',
                    habitaciones: 5,
                    estacionamiento: true,
                    wc: 4,
                    calle: 'Av. de los Pinos 45',
                    lat: '40.4200',
                    lng: '-3.7100',
                    imagen: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                    precio: 890000,
                    publicado: true,
                    userId: adminUser.id,
                    categoryId: 1
                }
            ]);
            console.log('Propiedades de ejemplo creadas');
        }

        console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error.message);
        if (intentos > 0) {
            console.log(`Reintentando conexión en 5 segundos... (${intentos} intentos restantes)`);
            setTimeout(() => conectarBD(intentos - 1), 5000);
        }
    }
}
conectarBD();

// Habilitar lectura de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Habilitar Motor de Plantillas
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Carpeta Pública
app.use(express.static('./src/public'));

// Importar Rutas (Nombres en Español)
const rutasAuth = require('./routes/rutasAuth');
const rutasPropiedades = require('./routes/rutasPropiedades');
const rutasMensajes = require('./routes/rutasMensajes');

// Rutas API
app.use('/auth', rutasAuth);
app.use('/propiedades', rutasPropiedades); // Antes /properties
app.use('/mensajes', rutasMensajes);

app.get('/', (req, res) => {
    res.send('API de Casafinder ejecutándose...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\nServidor corriendo en el puerto ${PORT}`);
    console.log(`- API: http://localhost:${PORT}`);
    console.log(`- Web: http://localhost:8080`);
    console.log(`- DB Admin: http://localhost:8081`);
});
