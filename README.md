# Casafinder - Proyecto Final

## Descripción
**Casafinder** es una plataforma de gestión inmobiliaria desarrollada como Proyecto Final de Grado.  
Permite la administración de usuarios, propiedades, y la gestión de consultas (inquiries) mediante una interfaz web moderna y una API RESTful robusta.

**Autor**: Sergio  
**Tecnologías**: Node.js, Express, MySQL, Docker, Vanilla JS.

## Requisitos Previos
- Docker Desktop instalado.

## Instalación y Despliegue
Este proyecto está containerizado para facilitar su ejecución.

1.  **Arrancar el proyecto**:
    ```bash
    docker-compose up --build
    ```

2.  **Acceder a la aplicación**:
    - **Web (Frontend)**: [http://localhost:8080](http://localhost:8080)
    - **API (Backend)**: [http://localhost:3000](http://localhost:3000)
    - **Base de Datos (Adminer)**: [http://localhost:8081](http://localhost:8081)

## Credenciales de Acceso
El sistema crea automáticamente un usuario administrador y propiedades de ejemplo al iniciar.

- **Usuario**: `admin@casafinder.com`
- **Contraseña**: `admin123`

## Funcionalidades Principales
- **Autenticación Completa**: Login, Tokens JWT, Recuperación de contraseña (simulada en logs).
- **Gestión de Propiedades**: Crear, Editar, Eliminar, Buscar y Marcar como Vendida.
- **Consultas**: Los usuarios pueden enviar mensajes de contacto sobre las propiedades.
- **Informes**: Generación de PDF para cada propiedad.
- **Seguridad**: Roles (Admin/Usuario), Hash de contraseñas, Logs de acceso y error.

## Estructura del Proyecto
- `/backend`: Servidor API REST (MVC).
- `/frontend`: Cliente Web (Single Page Application leve).
- `docker-compose.yml`: Orquestación de contenedores.
