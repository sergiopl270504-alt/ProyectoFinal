/**
 * @file propiedades_final.js
 * @description Script encargado de manejar la lógica del formulario de creación de propiedades.
 * Se encarga de validar y enviar los datos al backend (ahora en español).
 * Versión final para evitar caché.
 */

import { request } from './api.js';

// Obtenemos las referencias a los elementos clave del DOM
const formularioPropiedad = document.getElementById('propertyForm');
const mensajeFeedback = document.getElementById('msg');

// Solo ejecutamos el código si el formulario existe en la página
if (formularioPropiedad) {
    /**
     * Manejador del evento 'submit' del formulario.
     * Previene el envío por defecto y maneja la comunicación con la API.
     */
    /**
     * Gestiona el envío del formulario de nueva propiedad (Versión Final).
     * 
     * Recoge los datos del DOM, valida campos requeridos (como estacionamiento),
     * selecciona una imagen aleatoria y envía la petición a la API.
     * 
     * @event submit
     */
    formularioPropiedad.addEventListener('submit', async (e) => {
        // Evitamos que la página se recargue
        e.preventDefault();

        // Extraemos los valores directamente de los campos del formulario
        const titulo = document.getElementById('titulo').value;
        const precio = document.getElementById('precio').value;
        const descripcion = document.getElementById('descripcion').value;
        const habitaciones = document.getElementById('habitaciones').value;
        const wc = document.getElementById('wc').value;

        // Convertimos el valor string del select a un booleano real
        const estacionamientoSelect = document.getElementById('estacionamiento').value;
        if (!estacionamientoSelect) {
            mensajeFeedback.textContent = 'Por favor, seleccione si tiene estacionamiento.';
            mensajeFeedback.style.color = 'red';
            return;
        }
        const estacionamiento = estacionamientoSelect === 'true';
        const calle = document.getElementById('calle').value;

        // Imágenes de alta calidad para propiedades (NUEVA LISTA)
        const imagenesCasas = [
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80', // Casa moderna
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80', // Casa con piscina
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80', // Chalet
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', // Lujosa
            'https://images.unsplash.com/photo-1599809272520-27d27e7d6c01?auto=format&fit=crop&w=800&q=80', // Blanca moderna
            'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80', // Interior/Exterior
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', // Luminosa
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', // Fachada
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', // Patio
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80'  // Entrada
        ];

        // Seleccionar una imagen aleatoria
        const imagenAleatoria = imagenesCasas[Math.floor(Math.random() * imagenesCasas.length)];

        // DEBUG VISUAL PARA EL USUARIO
        console.log('Imagen seleccionada:', imagenAleatoria);

        // Construimos el objeto payload que espera el backend
        // Nota: lat y lng se envían como '0' por defecto por ahora.
        const datosPropiedad = {
            titulo,
            precio,
            descripcion,
            habitaciones: parseInt(habitaciones), // Aseguramos que sea número
            wc: parseInt(wc),                     // Aseguramos que sea número
            estacionamiento,
            calle,
            lat: '0',
            lng: '0',
            categoryId: 1, // Categoría por defecto
            imagen: imagenAleatoria
        };

        try {
            // Intentamos enviar los datos al servidor (Endpoint en español)
            await request('/propiedades', 'POST', datosPropiedad);

            // Si todo va bien, mostramos mensaje de éxito
            mensajeFeedback.textContent = '¡Propiedad creada correctamente!';
            mensajeFeedback.style.color = 'green';

            // Limpiamos el formulario para evitar duplicados accidentales
            formularioPropiedad.reset();

            // Redirigimos al usuario al inicio después de una breve pausa para que lea el mensaje
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (error) {
            // Si algo falla, mostramos el error al usuario
            console.error('Error al crear propiedad:', error);
            mensajeFeedback.textContent = error.message;
            mensajeFeedback.style.color = 'red';
        }
    });
}
