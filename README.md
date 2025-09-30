# Book Social - Progressive Web App
Book Social es una moderna Progressive Web App (PWA) diseñada para amantes de los libros. Permite a los usuarios descubrir nuevos libros, gestionar su biblioteca personal, escribir reseñas y seguir a sus autores favoritos para recibir notificaciones de sus nuevos lanzamientos.

La aplicación está construida con un enfoque "offline-first", permitiendo a los usuarios interactuar con el contenido incluso sin una conexión a internet estable, y sincronizando sus acciones automáticamente cuando la conexión se restablece.

# Características Principales
Experiencia PWA Completa: Instala la aplicación en cualquier dispositivo (móvil o escritorio) para una experiencia nativa, con pantalla de splash y acceso offline.

Autenticación de Usuarios: Sistema seguro de registro e inicio de sesión con tokens JWT.

Catálogo de Libros: Explora una lista de libros y visualiza los detalles de cada uno, incluyendo reseñas.

Biblioteca Personal: Añade o elimina libros de tu biblioteca personal para llevar un registro de tus lecturas.

Sistema de Reseñas Offline: Escribe y envía reseñas. Si no tienes conexión, se guardarán localmente y se publicarán automáticamente cuando vuelvas a estar en línea gracias a la API de Background Sync.

Sistema de Notificaciones Avanzado:

Sigue a tus Autores Favoritos: Suscríbete a autores para recibir alertas.

Notificaciones Push Multi-dispositivo: Activa las notificaciones en todos tus dispositivos (PC, celular, tablet) y recibe alertas en todos ellos.

Perfil de Usuario Personalizable: Actualiza tu foto de perfil usando la cámara de tu dispositivo directamente desde la aplicación.

Diseño Responsivo: Interfaz moderna construida con Tailwind CSS, optimizada para cualquier tamaño de pantalla.

# Tecnologías Utilizadas
Framework: Next.js (App Router)

Librería Frontend: React

Estilos: Tailwind CSS

Base de Datos: MySQL

Autenticación: JSON Web Tokens (JWT), bcryptjs

PWA y Notificaciones: Service Workers, Web Push API, Background Sync API

# Instalación y Puesta en Marcha
Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

Prerrequisitos

Node.js (versión 18.x o superior)

npm

Un servidor de MySQL funcionando.

# Consideraciones

Para este proyecto no se configuro un certificado SSL, en su lugar se utilizo ngrok, esto es importante ya que al relaizar las pruebas en un dispositivo móvil al no contar con un comunicación HTTPS la aplicación se ve limitada, por lo que, si se desean probar todas las funcionalidades de la aplicación en un dispositivo móvil se debe crear una conexión HTTPS con ayuda de ngrok que es la manera más rápida para realizar pruebas.

# 1. Clonar el Repositorio
git clone https://github.com/AlejandroIGA/book_social_pwa.git

cd book-social-pwa

# 2. Instalar Dependencias
npm install

# 3. Configurar la Base de Datos
Abre tu cliente de MySQL y ejecuta el siguiente script SQL para crear todas las tablas necesarias:

-- Tabla de Usuarios

CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    psw VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255)
);

-- Tabla de Autores

CREATE TABLE Author (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Tabla de Libros

CREATE TABLE Book (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_author INT,
    genre VARCHAR(255),
    editorial VARCHAR(255),
    editorial_review TEXT,
    FOREIGN KEY (id_author) REFERENCES Author(id)
);

-- Tabla de Reseñas

CREATE TABLE Review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_book INT NOT NULL,
    id_user INT NOT NULL,
    review TEXT NOT NULL,
    FOREIGN KEY (id_book) REFERENCES Book(id) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES User(id) ON DELETE CASCADE
);

-- Tabla de Librería Personal

CREATE TABLE Library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_book INT NOT NULL,
    id_user INT NOT NULL,
    start_date DATE,
    finish_date DATE,
    FOREIGN KEY (id_book) REFERENCES Book(id) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES User(id) ON DELETE CASCADE
);

-- Tabla para seguir autores

CREATE TABLE UserAuthorFollow (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_author INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (id_author) REFERENCES Author(id) ON DELETE CASCADE,
    UNIQUE KEY user_author_follow_unique (id_user, id_author)
);

-- Tabla para registrar dispositivos

CREATE TABLE DeviceSubscription (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_user) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY user_endpoint_unique (id_user, endpoint(255))
);

# 4. Configurar Variables de Entorno

Crea un archivo llamado .env.local en la raíz del proyecto y añade las siguientes variables.

# Base de Datos MySQL

DB_HOST=localhost

DB_PORT=3306

DB_USER=tu_usuario_mysql

DB_PASSWORD=tu_contraseña_mysql

DB_DATABASE=nombre_de_tu_bd

# Autenticación JWT

JWT_SECRET=genera_una_clave_secreta_larga_y_aleatoria_aqui

# Notificaciones Push (VAPID Keys)

Genera estas claves con el comando: npx web-push generate-vapid-keys

NEXT_PUBLIC_VAPID_PUBLIC_KEY="PEGA_TU_CLAVE_PUBLICA_AQUI"

VAPID_PRIVATE_KEY="PEGA_TU_CLAVE_PRIVADA_AQUI"

VAPID_SUBJECT="mailto:tuemail@ejemplo.com"

# 5. Ejecutar la Aplicación

Una vez configurado todo, inicia el servidor de desarrollo:

npm run dev

La aplicación estará disponible en http://localhost:3000.

# Scripts Disponibles

npm run dev: Inicia el servidor en modo de desarrollo.

npm run build: Compila la aplicación para producción.

npm run start: Inicia el servidor en modo de producción (requiere build previo).

npm run lint: Ejecuta el linter para revisar el código.