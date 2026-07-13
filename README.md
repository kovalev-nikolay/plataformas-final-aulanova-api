# AulaNova API

API REST desarrollada para el frontend de AulaNova, una plataforma de gestión de cursos y clases de idiomas.

Autor: Nikolay Kovalev

Este repositorio contiene la API REST propia del frontend AulaNova.

## Tecnologías

- Node.js
- Express
- MySQL
- mysql2
- bcrypt
- JSON Web Token
- CORS

## Requisitos

- Node.js
- MySQL o XAMPP

## Instalación

```bash
npm install
```

## Configuración

Copiar `.env.example` como `.env` y completar los valores necesarios.

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=aulanova_db
DB_PORT=3306
PORT=8888
JWT_ACCESS_TOKEN_SECRET=cambiar_por_una_clave_segura
FRONTEND_URL=http://localhost:5173
```

- `DB_HOST`: dirección del servidor MySQL.
- `DB_USER`: usuario de MySQL.
- `DB_PASSWORD`: contraseña del usuario de MySQL.
- `DB_NAME`: nombre de la base de datos.
- `DB_PORT`: puerto de MySQL.
- `PORT`: puerto de la API.
- `JWT_ACCESS_TOKEN_SECRET`: clave privada usada para firmar los tokens.
- `FRONTEND_URL`: origen permitido por CORS para el frontend.

## Creación de la base de datos

El archivo SQL del proyecto es `database/aulanova.sql`.

En phpMyAdmin, abrir la pestaña **Importar**, seleccionar ese archivo y ejecutar la importación. También se puede importar desde MySQL:

```bash
mysql -u root -p < database/aulanova.sql
```

Para cargar los usuarios y datos iniciales de prueba después de crear la base:

```bash
npm run seed
```

## Ejecución

```bash
npm run dev
```

- URL local: `http://localhost:8888`
- URL base: `http://localhost:8888/api`

## Autenticación y roles

Las rutas protegidas reciben el token con esta cabecera:

```text
Authorization: Bearer TOKEN
```

Los roles disponibles son `admin`, `profesor` y `alumno`.

## Endpoints principales

| Método | Ruta | Roles permitidos |
| --- | --- | --- |
| GET | `/api/test` | Público |
| GET | `/api/db-test` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/profile` | admin, profesor, alumno |
| GET | `/api/users` | admin |
| POST | `/api/users` | admin |
| PUT | `/api/users/:id` | admin |
| DELETE | `/api/users/:id` | admin |
| GET | `/api/courses` | admin, profesor, alumno |
| POST | `/api/courses` | admin |
| PUT | `/api/courses/:id` | admin |
| PUT | `/api/courses/:id/students` | admin |
| DELETE | `/api/courses/:id` | admin |
| GET | `/api/classes` | admin, profesor, alumno |
| POST | `/api/classes` | admin, profesor |
| PUT | `/api/classes/:id` | admin, profesor |
| DELETE | `/api/classes/:id` | admin, profesor |

## Funcionalidades principales

- Login y consulta del perfil autenticado.
- Gestión de usuarios por administradores.
- Gestión de cursos por administradores.
- Asignación de alumnos a cursos.
- Gestión de clases por administradores y profesores según sus permisos.
- Consultas filtradas para profesores y alumnos.

## Usuarios de prueba

| Rol | Email | Contraseña |
| --- | --- | --- |
| Admin | `admin@aulanova.com` | `admin123` |
| Profesor | `profesor@aulanova.com` | `profe123` |
| Alumno | `alumno@aulanova.com` | `alumno123` |

## Frontend

El frontend del proyecto está disponible en:

https://github.com/kovalev-nikolay/plataformas-tp2-aulanova
