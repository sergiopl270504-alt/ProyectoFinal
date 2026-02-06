import { request } from './api.js?v=999';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/login.html';
}

// Asegurar navegación de usuario
const nav = document.getElementById('nav-links');
if (token && user) {
    let navContent = `<span>Hola, ${user.nombre}</span>`;
    navContent += `<a href="/" style="margin-right: 1rem;">Inicio</a>`;
    navContent += `<a href="#" id="logout">Cerrar Sesión</a>`;
    nav.innerHTML = navContent;

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });
}

// Elementos del DOM
const threadList = document.getElementById('thread-list');
const noChat = document.getElementById('no-chat');
const activeChat = document.getElementById('active-chat');
const chatTitle = document.getElementById('chat-title');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let currentInquiryId = null;

// Cargar lista de conversaciones (hilos)
/**
 * Carga la lista de hilos de conversación del usuario.
 * 
 * Obtiene las consultas desde la API y renderiza la lista lateral
 * con una vista previa del último mensaje de cada hilo.
 */
async function loadThreads() {
    try {
        const inquiries = await request('/mensajes'); // Endpoint actualizado

        if (inquiries.length === 0) {
            threadList.innerHTML = '<div style="padding:1rem">No tienes conversaciones activas.</div>';
            return;
        }

        threadList.innerHTML = inquiries.map(inq => {
            const lastMsg = inq.mensajes && inq.mensajes.length > 0 ? inq.mensajes[0] : null;
            const preview = lastMsg ? lastMsg.contenido : inq.mensaje;

            return `
            <div class="thread-item ${currentInquiryId == inq.id ? 'active' : ''}" onclick="window.selectThread('${inq.id}')">
                <img src="${inq.propiedad ? inq.propiedad.imagen : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='}" class="thread-thumb" alt="Prop">
                <div class="thread-info">
                    <h4>${inq.propiedad ? inq.propiedad.titulo : 'Propiedad Desconocida'}</h4>
                    <p>${preview || 'Sin mensajes'}</p>
                </div>
            </div>
        `}).join('');

    } catch (error) {
        threadList.innerHTML = `<p style="color:red; padding:1rem">Error: ${error.message}</p>`;
    }
}

// Hacer global para acceder desde onclick en HTML
/**
 * Selecciona un hilo de conversación para ver los detalles.
 * 
 * @param {string} id - UUID de la consulta seleccionada.
 */
window.selectThread = async (id) => {
    currentInquiryId = id;

    // Actualizar estado activo en UI
    document.querySelectorAll('.thread-item').forEach(el => el.classList.remove('active'));

    noChat.style.display = 'none';
    activeChat.style.display = 'flex';

    await loadMessages(id);
    loadThreads(); // Refrescar lista
};

// Enviar nuevo mensaje
/**
 * Envía un nuevo mensaje en el hilo activo.
 * 
 * Captura el texto del input, llama a la API para guardar el mensaje
 * y refresca la vista del chat.
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentInquiryId) return;

    try {
        await request(`/mensajes/${currentInquiryId}/reply`, 'PUT', { respuesta: text }); // Endpoint actualizado
        messageInput.value = '';
        await loadMessages(currentInquiryId); // Recargar chat
        loadThreads(); // Actualizar vista previa
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Elimina la conversación actual tras confirmación.
 */
window.deleteCurrentThread = async () => {
    if (!currentInquiryId) return;

    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        await request(`/mensajes/${currentInquiryId}`, 'DELETE');

        // Limpiar UI
        currentInquiryId = null;
        document.getElementById('active-chat').style.display = 'none';
        document.getElementById('no-chat').style.display = 'flex';
        document.querySelector('.chat-container').classList.remove('mobile-view-chat'); // Volver a lista en móvil

        // Recargar lista
        loadThreads();

        alert('Conversación eliminada.');
    } catch (error) {
        console.error(error);
        alert('Error al eliminar: ' + error.message);
    }
};

// Carga Inicial
loadThreads();

// Polling opcional cada 10 segundos
setInterval(() => {
    if (currentInquiryId) loadMessages(currentInquiryId);
    loadThreads();
}, 10000);

// Cargar mensajes de un hilo
async function loadMessages(id) {
    try {
        chatMessages.innerHTML = '<div style="text-align:center; padding:1rem">Cargando...</div>';

        const data = await request(`/mensajes/${id}`);

        if (chatTitle) chatTitle.textContent = data.propiedad ? data.propiedad.titulo : 'Chat de Propiedad';

        const messages = data.mensajes || [];

        if (messages.length === 0) {
            chatMessages.innerHTML = '<div style="text-align:center; padding:1rem; color:#888">Inicia la conversación...</div>';
            return;
        }

        const myRole = 'usuario';

        chatMessages.innerHTML = messages.map(msg => {
            const isMine = msg.remitente === myRole;
            const bubbleClass = isMine ? 'mine' : 'theirs';
            const date = new Date(msg.fecha_envio).toLocaleString();

            return `
                <div class="message-bubble ${bubbleClass}">
                    <div>${msg.contenido}</div>
                    <span class="message-time">${date}</span>
                </div>
            `;
        }).join('');

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error(error);
        chatMessages.innerHTML = `<div style="color:red; text-align:center">Error: ${error.message}</div>`;
    }
}
