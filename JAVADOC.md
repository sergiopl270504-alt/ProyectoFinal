# REFERENCIA DE CÓDIGO Y API (JAVADOC) - CASAFINDER

**Versión del Documento:** 1.0
**Fecha:** Febrero 2026

---

## ÍNDICE

1.  [Backend - Controladores](#1-backend---controladores)
    *   [Controlador de Autenticación (`controladorAuth`)](#11-controlador-de-autenticación)
    *   [Controlador de Propiedades (`controladorPropiedades`)](#12-controlador-de-propiedades)
    *   [Controlador de Mensajes (`controladorMensajes`)](#13-controlador-de-mensajes)
2.  [Frontend - Scripts](#2-frontend---scripts)
    *   [Gestión de Mensajes (`mensajes.js`)](#21-gestión-de-mensajes)
    *   [Panel de Administración (`mensajes-admin.js`)](#22-panel-de-administración)

---

## 1. BACKEND - CONTROLADORES

### 1.1. Controlador de Autenticación
**Archivo:** `backend/src/controllers/controladorAuth.js`

#### `registrar(req, res)`
Registra un nuevo usuario en el sistema.
*   **Parámetros:**
    *   `req.body.nombre_completo` (String): Nombre del usuario.
    *   `req.body.correo_electronico` (String): Email único.
    *   `req.body.contrasena` (String): Contraseña (será hasheada).
*   **Retorno:** JSON `{ msg: String }` indicando éxito o error.
*   **Lógica:** Verifica duplicados, crea registro en DB y devuelve confirmación.

#### `login(req, res)`
Inicia sesión y emite token JWT.
*   **Parámetros:**
    *   `req.body.correo_electronico` (String)
    *   `req.body.contrasena` (String)
*   **Retorno:**
    *   Éxito: JSON `{ token: String, usuario: Object }`
    *   2FA Requerido: JSON `{ require2fa: true, userId: Integer }`
    *   Error: 400/500 con mensaje.

#### `setup2FA(req, res)`
Inicia la configuración de Doble Factor.
*   **Req:** Usuario autenticado (`req.usuario`).
*   **Retorno:** JSON `{ secret: String, qrCode: String }`.
*   **Lógica:** Genera secreto TOTP y URL para código QR (formato "Casafinder (email)").

#### `verify2FA(req, res)`
Verifica código TOTP para completar login.
*   **Parámetros:** `userId` (Integer), `token` (String, código de 6 dígitos).
*   **Retorno:** Token JWT si el código es correcto.

---

### 1.2. Controlador de Propiedades
**Archivo:** `backend/src/controllers/controladorPropiedades.js`

#### `obtenerPropiedades(req, res)`
Lista propiedades públicas con filtros.
*   **Query Params:** `search` (opcional) - Filtra por título o descripción.
*   **Retorno:** Array de objetos `Propiedad`.

#### `crearPropiedad(req, res)`
Crea una nueva ficha de inmueble.
*   **Requiere:** Autenticación.
*   **Body:** `titulo`, `descripcion`, `precio`, `habitaciones`, `wc`, `estacionamiento`, `lat`, `lng`, `imagen`.
*   **Lógica:** Asigna `userId` del solicitante. Si no hay imagen, asigna una por defecto.

#### `descargarPDF(req, res)`
Genera folleto PDF al vuelo.
*   **Params:** `id` de la propiedad.
*   **Retorno:** Stream binario (application/pdf).
*   **Librería:** `pdfkit`.

### 1.3. Controlador de Mensajes
**Archivo:** `backend/src/controllers/controladorMensajes.js`

#### `crearConsulta(req, res)`
Inicia una nueva conversación sobre una propiedad.
*   **Body:** `propiedadId` (Integer), `mensaje` (String).
*   **Lógica:** Verifica que el usuario no sea el dueño de la propiedad.

#### `responderMensaje(req, res)`
Añade un mensaje a un hilo existente.
*   **Params:** `id` (ID de la consulta/hilo).
*   **Body:** `respuesta` (String).
*   **Lógica:** Determina el remitente ('usuario' o 'admin') según el rol del que responde.

---

## 2. FRONTEND - SCRIPTS

### 2.1. Gestión de Mensajes
**Archivo:** `frontend/src/mensajes.js`

#### `loadThreads()`
Carga la lista lateral de conversaciones.
*   **Async:** Sí.
*   **Retorno:** `void` (Manipula DOM).
*   **Detalle:** Pide `/mensajes` a la API y renderiza tarjetas de vista previa.

#### `loadMessages(id, backgroundUpdate)`
Carga el contenido del chat seleccionado.
*   **Parámetros:**
    *   `id` (String): ID de la conversación.
    *   `backgroundUpdate` (Boolean): Si es `true`, no muestra "Cargando..." (para polling).
*   **Detalle:** Renderiza burbujas de chat, diferenciando clases `.mine` y `.theirs`.

### 2.2. Panel de Administración
**Archivo:** `frontend/src/mensajes-admin.js`

#### `loadThreads()`
Versión admin de la carga de hilos.
*   **Diferencia:** Muestra un indicador rojo (punto) si el último mensaje es del usuario y no ha sido respondido por el admin.

#### `deleteCurrentThread()`
Elimina la conversación activa.
*   **Confirmación:** Requiere interacción del usuario (`confirm()`).
*   **API:** Llama a `DELETE /mensajes/:id`.
