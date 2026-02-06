import { request } from './api.js?v=999';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/login.html';
}

const threadList = document.getElementById('thread-list');
const noChat = document.getElementById('no-chat');
const activeChat = document.getElementById('active-chat');
const chatTitle = document.getElementById('chat-title');
const chatSubtitle = document.getElementById('chat-subtitle');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let currentInquiryId = null;

// Cargar lista de hilos
/**
 * Carga la lista global de todas las conversaciones para el administrador.
 * 
 * Muestra indicador de mensajes no leídos (punto rojo) si el último mensaje es del usuario.
 */
async function loadThreads() {
    try {
        console.log('Cargando conversaciones...');
        const inquiries = await request('/mensajes'); // Endpoint actualizado
        console.log('Conversaciones cargadas:', inquiries);

        if (inquiries.length === 0) {
            threadList.innerHTML = '<div style="padding:1rem">No hay mensajes.</div>';
            return;
        }

        threadList.innerHTML = inquiries.map(inq => {
            const lastMsg = inq.mensajes && inq.mensajes.length > 0 ? inq.mensajes[0] : null;
            const preview = lastMsg ? lastMsg.contenido : inq.mensaje;
            const userName = inq.usuario ? inq.usuario.nombre_completo : 'Usuario';

            // Indicador visual si es mensaje nuevo (último mensaje es de usuario y no admin)
            const isUnanswered = lastMsg && lastMsg.remitente === 'usuario';
            const statusDot = isUnanswered ? '<span style="color:red; font-size:1.5rem;">•</span>' : '';

            return `
            <div class="thread-item ${currentInquiryId == inq.id ? 'active' : ''}" onclick="window.selectThread('${inq.id}')">
                 <img src="${inq.propiedad ? inq.propiedad.imagen : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='}" class="thread-thumb" alt="Prop">
                <div class="thread-info">
                    <div style="display:flex; justify-content:space-between;">
                        <h4>${inq.propiedad ? inq.propiedad.titulo : 'Propiedad eliminada'}</h4>
                        ${statusDot}
                    </div>
                    <p style="color: #3b82f6; font-size: 0.75rem; margin-bottom: 0.2rem;">${userName}</p>
                    <p>${preview || 'Sin mensajes'}</p>
                </div>
            </div>
        `}).join('');

    } catch (error) {
        console.error('Error cargando hilos:', error);
        threadList.innerHTML = `<p style="color:red; padding:1rem">Error: ${error.message}</p>`;
    }
}

// Hacer global
/**
 * Selecciona una conversación para gestión.
 * 
 * @param {string} id - ID de la consulta.
 */
window.selectThread = async (id) => {
    currentInquiryId = id;

    document.querySelectorAll('.thread-item').forEach(el => el.classList.remove('active'));

    noChat.style.display = 'none';
    activeChat.style.display = 'flex';

    await loadMessages(id);
    loadThreads();
};
// NOTA: Eliminada lógica antigua de focus


// Enviar respuesta
/**
 * Envía una respuesta administrativa.
 * 
 * @async
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentInquiryId) return;

    try {
        await request(`/mensajes/${currentInquiryId}/reply`, 'PUT', { respuesta: text }); // Endpoint actualizado
        messageInput.value = '';
        await loadMessages(currentInquiryId);
        loadThreads();
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Elimina la conversación actual.
 */
window.deleteCurrentThread = async () => {
    if (!currentInquiryId) return;

    if (!confirm('¿Estás seguro de eliminar este hilo de mensajes?')) {
        return;
    }

    try {
        await request(`/mensajes/${currentInquiryId}`, 'DELETE');

        currentInquiryId = null;
        document.getElementById('active-chat').style.display = 'none';
        document.getElementById('no-chat').style.display = 'flex';
        document.querySelector('.chat-container').classList.remove('mobile-view-chat');

        loadThreads();
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
};

// Carga inicial
loadThreads();

// Polling
setInterval(() => {
    if (currentInquiryId) loadMessages(currentInquiryId);
    loadThreads();
}, 10000);

// Cargar mensajes de un hilo
async function loadMessages(id) {
    try {
        console.log('Cargando mensajes para ID:', id);
        chatMessages.innerHTML = '<div style="text-align:center; padding:1rem">Cargando...</div>';

        const data = await request(`/mensajes/${id}`);
        console.log('Detalle cargado:', data);

        // Actualizar cabecera
        if (chatTitle) chatTitle.textContent = data.propiedad ? data.propiedad.titulo : 'Propiedad eliminada';
        if (chatSubtitle) chatSubtitle.textContent = data.usuario ? data.usuario.nombre_completo : 'Usuario';

        const messages = data.mensajes || [];

        if (messages.length === 0) {
            chatMessages.innerHTML = '<div style="text-align:center; padding:1rem; color:#888">No hay mensajes aún.</div>';
            return;
        }

        // En panel admin, "mío" es el que tiene remitente === 'admin'
        const myRole = 'admin';

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

        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Error cargando mensajes:', error);
        chatMessages.innerHTML = `<div style="color:red; text-align:center">Error: ${error.message}</div>`;
    }
}
