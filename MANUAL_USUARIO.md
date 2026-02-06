# MANUAL DE USUARIO CORPORATIVO - CASAFINDER

**Versión:** 2.2 (Release Final / Producción)
**Departamento:** Operaciones y Ventas
**Fecha de Publicación:** Febrero 2026

---

## 1. INTRODUCCIÓN

Bienvenido al ecosistema **Casafinder**. Este manual operativo ha sido diseñado para guiar a todos los perfiles de usuario (Agentes Inmobiliarios, Administradores de Sistema y Clientes Finales) en el aprovechamiento integral de la plataforma.

Casafinder trasciende el concepto de buscador tradicional; se posiciona como una herramienta de gestión 360º que centraliza el inventario de activos inmobiliarios y dinamiza la comunicación bidireccional entre la fuerza de ventas y el mercado potencial.

---

## 2. MANUAL DE PROCEDIMIENTOS: PERFIL CLIENTE / COMPRADOR

Esta sección detalla las funcionalidades disponibles para los usuarios interesados en la adquisición o alquiler de inmuebles.

### 2.1. Navegación en el Catálogo Digital
Al acceder a la plataforma, el sistema despliega el inventario actualizado en tiempo real.
*   **Motor de Búsqueda Semántico:** Nuestro algoritmo permite localizar propiedades no solo por título, sino interpretando necesidades a través de palabras clave en la descripción (ej. "reformado", "soleado", "céntrico").
*   **Tarjetas de Visualización Rápida:** Cada activo se presenta con sus KPIs (Indicadores Clave de Desempeño) visibles: Precio, Dimensiones y Ubicación, facilitando la toma de decisiones ágil.

### 2.2. Protocolo de Contacto Seguro
Para garantizar la trazabilidad y seguridad de las comunicaciones:
1.  **Registro de Usuario:** Es indispensable crear una cuenta verificada. Este paso actúa como primer filtro de seguridad contra *bots* y *spam*.
2.  **Gestión de Interés:** En la ficha detallada de cada propiedad, encontrará el módulo de contacto directo.
    *   *Nota:* Al enviar una consulta, sus datos de contacto verificados (Email) se compartirán automáticamente con el agente asignado, agilizando el tiempo de respuesta.

---

## 3. MANUAL DE PROCEDIMIENTOS: PERFIL ADMINISTRADOR / AGENTE

Esta sección aborda las capacidades del **Backoffice** de gestión.

### 2.3. Panel de Usuario (Nueva Funcionalidad)
La plataforma incluye ahora un área personal accesible desde el menú "Hola, [Nombre]":
1.  **Ajustes de Perfil:** Modifique su foto o datos de contacto.
2.  **Seguridad (2FA):** Puede activar la "Autenticación de Dos Factores".
    *   Se generará un código QR único.
    *   Escanéelo con Google Authenticator o Microsoft Authenticator.
    *   A partir de ese momento, necesitará el código de 6 dígitos para iniciar sesión (mayor seguridad).
3.  **Gestión de Contraseña:** Módulo seguro para renovar sus credenciales.

### 2.4. Chat Móvil Optimizado
La interfaz de mensajes ha sido rediseñada para dispositivos móviles. Ahora funciona con una navegación fluida estilo "Historias", permitiéndole deslizar horizontalmente entre sus conversaciones activas sin perder de vista el chat actual.

---

## 3. MANUAL DE PROCEDIMIENTOS: PERFIL ADMINISTRADOR / AGENTE

3.1. Alta de Activos Inmobiliarios
La calidad de la información introducida impacta directamente en el posicionamiento SEO y la tasa de conversión.
1.  Acceda a su **Panel de Control**.
2.  Seleccione la opción **"Nuevo Activo"**.
3.  **Directrices de Calidad de Datos:**
    *   **Título:** Utilice técnicas de *Copywriting*. Evite genéricos como "Piso en venta". Prefiera descripciones evocadoras: "Ático Lujoso con Terraza Panorámica".
    *   **Geolocalización:** El sistema utiliza coordenadas precisas. Verifique la chincheta en el mapa interactivo.

### 3.2. Gestión Avanzada de Mensajes
*   **Indicadores de Estado:** Un punto rojo indica mensajes de clientes pendientes de respuesta.
*   **Borrado de Hilos:** Ahora es posible eliminar conversaciones finalizadas o spam utilizando el icono de papelera. Esta acción es irreversible.


---

## 4. SOLUCIÓN DE INCIDENCIAS (TROUBLESHOOTING)

Guía rápida para la autogestión de situaciones comunes.

| Síntoma | Diagnóstico Probable | Protocolo de Solución |
| :--- | :--- | :--- |
| **"Error 401/403: No autorizado"** | Caducidad del Token de Seguridad (JWT). | El sistema cierra sesiones inactivas por seguridad. Recargue la página e inicie sesión nuevamente. |
| **Imágenes no disponibles** | Enlace roto en el servidor de origen. | Edite la propiedad y reemplace la URL por una alojada en un servidor CDN estable (ej. Cloudinary). |
| **Ausencia de Email de Confirmación** | Filtrado estricto del proveedor de correo. | Verifique la carpeta *Spam/Junk*. En entornos de prueba, solicite el enlace de activación al administrador. |
| **Mapa no interactivo** | Fallo de conexión con API de terceros. | Verifique su conectividad a Internet. Generalmente es una incidencia temporal del proveedor de mapas. |

---

## 5. GLOSARIO CORPORATIVO

*   **Login/Auth:** Proceso de acreditación de identidad segura.
*   **2FA (Two-Factor Authentication):** Protocolo de seguridad bancaria que requiere un código temporal del dispositivo móvil.
*   **Frontend:** Interfaz visual de interacción con el usuario.
*   **Backend:** Lógica de negocio y procesamiento de datos en servidor.
*   **Bug/Incidencia:** Comportamiento anómalo del software. Reportar inmediatamente al equipo técnico.

---
*Documento confidencial propiedad de Casafinder S.L. Prohibida su reproducción total o parcial sin autorización expresa.*
