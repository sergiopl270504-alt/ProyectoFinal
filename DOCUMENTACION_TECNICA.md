# MEMORIA TÉCNICA DEL PROYECTO - CASAFINDER

**Autor:** Sergio Peral López
**Ciclo Formativo:** Desarrollo de Aplicaciones Web (DAW)
**Curso Académico:** 2025-2026

---

## ÍNDICE DE CONTENIDOS

1.  [Resumen Ejecutivo](#1-resumen-ejecutivo)
2.  [Introducción y Objetivos](#2-introducción-y-objetivos)
3.  [Stack Tecnológico y Justificación](#3-stack-tecnológico-y-justificación)
4.  [Análisis y Arquitectura del Sistema](#4-análisis-y-arquitectura-del-sistema)
5.  [Documentación Detallada del Backend (API)](#5-documentación-detallada-del-backend-api)
    *   5.1. Estructura de Controladores y Lógica de Negocio
    *   5.2. Modelado de Datos y Relaciones (ORM)
    *   5.3. Seguridad y Middleware
6.  [Documentación del Frontend](#6-documentación-del-frontend)
7.  [Seguridad Avanzada (2FA y Hashing)](#7-seguridad-avanzada-2fa-y-hashing)
8.  [Conclusiones](#8-conclusiones)
9.  [Anexo: Referencias](#9-anexo-referencias)

---

## 1. RESUMEN EJECUTIVO

**Casafinder** es una plataforma tecnológica integral para el sector inmobiliario que permite la gestión completa del ciclo de vida de propiedades en venta y alquiler. Desarrollada como proyecto final de ciclo superior, la aplicación simula un entorno de producción real, incorporando características avanzadas de seguridad como autenticación de doble factor (2FA), validación estricta de datos y una arquitectura modular escalable. El sistema conecta a agentes inmobiliarios con clientes potenciales mediante un sistema de mensajería interna, garantizando la privacidad e integridad de las transacciones.

---

## 2. INTRODUCCIÓN Y OBJETIVOS

### 2.1. Contexto
La modernización del sector *PropTech* requiere herramientas que vayan más allá de un simple tablón de anuncios. Se necesita trazabilidad, seguridad en la gestión de identidades y una experiencia de usuario fluida. Casafinder responde a estas necesidades con una arquitectura *Full Stack* basada en JavaScript.

### 2.2. Objetivos Técnicos
*   **Modularidad:** Código organizado bajo el patrón MVC (Modelo-Vista-Controlador) para facilitar el mantenimiento.
*   **Seguridad por Diseño:** Implementación de hashing de contraseñas (`bcrypt`), tokens de sesión (`JWT`) y validación de esquemas (`express-validator`).
*   **Interoperabilidad:** Diseño de una API RESTful consumible por diversos clientes.
*   **Despliegue:** Contenerización mediante Docker para garantizar la consistencia entre entornos de desarrollo y producción.

---

## 3. STACK TECNOLÓGICO Y JUSTIFICACIÓN

### 3.1. Backend: Node.js + Express
Se seleccionó **Node.js** por su modelo de E/S no bloqueante, ideal para aplicaciones con alta concurrencia de lectura (búsquedas de propiedades).
*   **Express:** Framework minimalista que permite estructurar las rutas y *middlewares* de forma clara.

### 3.2. Base de Datos: MySQL + Sequelize
La naturaleza relacional de los datos (Usuarios <-> Propiedades <-> Mensajes) hace que MySQL sea la elección óptima. **Sequelize ORM** abstrae las consultas SQL, protegiendo contra inyecciones y facilitando la gestión de relaciones complejas.

### 3.3. Frontend: Vanilla JavaScript
Se evitó el uso de frameworks pesados (React/Angular) para demostrar un dominio profundo de los fundamentos del lenguaje: manipulación del DOM, gestión de eventos y consumo asíncrono de APIs (`fetch`).

---

## 4. ANÁLISIS Y ARQUITECTURA DEL SISTEMA

### 4.1. Patrón Arquitectónico
La aplicación sigue una arquitectura **RESTful** estricta:
*   **Stateless:** El servidor no guarda estado de sesión; cada petición es autenticada independientemente mediante JWT.
*   **Recursos:** URLs semánticas (`/propiedades`, `/auth`, `/mensajes`).
*   **Verbos HTTP:** Uso correcto de GET, POST, PUT y DELETE según la operación.

### 4.2. Modelo de Datos (DER)
Las entidades principales y sus relaciones, definidas en `backend/src/models/index.js`, son:
*   **Usuario:** Entidad central. Tiene muchas *Propiedades* (1:N) y muchas *Consultas* (1:N).
*   **Propiedad:** Pertenece a una *Categoría* y a un *Usuario*.
*   **Consulta:** Hilo de conversación que vincula *Usuario* y *Propiedad*. Contiene múltiples *Mensajes*.

---

## 5. DOCUMENTACIÓN DETALLADA DEL BACKEND (API)

Esta sección profundiza en la lógica interna, guiada por la documentación JSDoc implementada en el código fuente.

### 5.1. Estructura de Controladores
Los controladores (`backend/src/controllers`) encapsulan la lógica de negocio.

#### 5.1.1. Gestión de Autenticación (`controladorAuth.js`)
*   **`registrar`**: Orquesta el alta de usuarios.
    *   *Validación:* Verifica que el email no exista y que la contraseña cumpla los requisitos de longitud.
    *   *Hashing:* Utiliza el *hook* `beforeCreate` del modelo Usuario para hashear la contraseña con `bcrypt`.
    *   *Confirmación:* Genera un token único (UUID) y envía un correo mediante `emailRegistro`.
*   **`login`**: Gestiona el acceso seguro.
    *   *Verificación:* Busca al usuario y utiliza el método de instancia `usuario.verificarPassword(password)` que compara el hash almacenado con el texto plano.
    *   *JWT:* Si las credenciales son válidas, `generateJWT` crea un token firmado con el ID del usuario y una caducidad de 1 día.

#### 5.1.2. Gestión de Propiedades (`controladorPropiedades.js`)
*   **`crearPropiedad`**:
    *   Recibe datos del formulario (título, precio, imagen, etc.).
    *   Asigna automáticamente el usuario autenticado (`req.usuario.id`) como propietario.
    *   Almacena la ruta de la imagen seleccionada o subida.
*   **`buscarPropiedades`**:
    *   Implementa un motor de búsqueda avanzado utilizando operadores de Sequelize (`Op.like`) para filtrar por título o descripción.

#### 5.1.3. Sistema de Mensajería (`controladorMensajes.js`)
*   **`crearConsulta`**:
    *   Inicia un hilo de conversación. Verifica que el usuario no sea el propietario del inmueble (evita auto-mensajes).
*   **`obtenerMensajes`**:
    *   Devuelve las conversaciones agrupadas. Si es admin, ve *todas* las consultas; si es usuario, solo las propias.

### 5.2. Modelado de Datos y Relaciones (ORM)
Los modelos (`backend/src/models`) definen la estructura de las tablas.

*   **`Usuario.js`**: Incluye métodos de instancia críticos como `verificarPassword` y scopes para excluir info sensible (password, tokens) en las consultas por defecto.
*   **`Propiedad.js`**: Define campos con tipos de datos estrictos (DECIMAL para precios, TEXT para descripciones largas).

### 5.3. Seguridad y Middleware
Los *middlewares* (`backend/src/middleware`) actúan como guardianes de las rutas.

*   **`checkAuth`**:
    *   Intercepta cada petición protegida.
    *   Extrae el token del header `Authorization: Bearer <token>`.
    *   Verifica la firma digital usando `jwt.verify`.
    *   Si es válido, inyecta el objeto `req.usuario` en la petición para uso posterior.
*   **`checkAdmin`**:
    *   Verifica si `req.usuario.tipo_usuario === 'admin'`. Si no, devuelve un error 403 (Prohibido).

---

## 6. DOCUMENTACIÓN DEL FRONTEND

El cliente web (`frontend/src`) consume la API mediante módulos JavaScript reutilizables.

### 6.1. Capa de Comunicación (`api.js`)
Este archivo exporta la función `request`, que actúa como *wrapper* de `fetch`:
*   Añade automáticamente el header `Content-Type: application/json`.
*   Inyecta el token JWT desde `localStorage` si existe.
*   Centraliza el manejo de errores HTTP (401, 404, 500).

### 6.2. Lógica de Interfaz (`propiedades.js`, `mensajes.js`)
*   **`propiedades_final.js`**: Maneja el formulario de creación. Realiza validaciones en cliente (campos vacíos, formatos numéricos) antes de enviar la petición POST, reduciendo la carga al servidor.
*   **`mensajes.js`**: Implementa lógica de *polling* (consultas periódicas) para simular tiempo real en el chat, actualizando la lista de mensajes cada 10 segundos.

---

## 7. SEGURIDAD AVANZADA (2FA y Hashing)

Casafinder implementa capas de seguridad por encima del estándar académico.

### 7.1. Hashing de Contraseñas
No se almacenan contraseñas en texto plano. Se utiliza `bcrypt` con un factor de coste (salt rounds) de 10, lo que hace computacionalmente inviable los ataques de fuerza bruta.

### 7.2. Doble Factor de Autenticación (2FA)
Alojado en `rutasAuth.js` y `controladorAuth.js`:
1.  **Activación**: Se genera un secreto Base32 usando `speakeasy`.
2.  **Vinculación**: Se crea un código QR (`qrcode`) que el usuario escanea con Google Authenticator.
3.  **Verificación**: El servidor valida el código TOTP temporal generado por el usuario contra el secreto almacenado.

---

## 8. CONCLUSIONES

El desarrollo de Casafinder ha permitido integrar competencias de desarrollo backend, frontend y devops en un único producto cohesivo. La documentación exhaustiva mediante JSDoc no solo facilita la comprensión actual del código, sino que garantiza su mantenibilidad futura, cumpliendo con los estándares de calidad de software profesional.

---

## 9. ANEXO: REFERENCIAS

*   [Documentación de Express.js](https://expressjs.com/)
*   [Sequelize ORM Documentation](https://sequelize.org/)
*   [JWT.io Introduction](https://jwt.io/introduction)
*   [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
