# SistemaDeRegistro

Sistema web de registro e inicio de sesión desarrollado con **Node.js**, **Express**, **PostgreSQL**, **HTML**, **CSS**, **JavaScript** y **Bootstrap**.

El proyecto implementa:

- Registro de usuarios
- Verificación por código OTP enviado por correo Gmail
- Inicio de sesión
- Recuperación de contraseña por OTP
- Validación de formularios
- Manejo de sesiones
- Protección básica contra abusos e intentos excesivos

---

## Tecnologías utilizadas

### Backend
- Node.js
- Express
- PostgreSQL
- Nodemailer
- bcryptjs
- express-session
- connect-pg-simple
- express-validator
- express-rate-limit
- helmet

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons

### Base de datos
- PostgreSQL en Docker

---

## Estructura del proyecto

```bash
SistemaDeRegistro/
│
├── DB_SistemaDeRegistro/
│   ├── .env
│   ├── docker-compose.yml
│   └── init/
│       └── 01_init.sql
│
├── docs/
│   └── img/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── public/
│   │   ├── css/
│   │   └── js/
│   ├── routes/
│   ├── services/
│   ├── views/
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md

```
---

## Características principales
- Registro de usuario con:
    - nombre completo
    - correo electrónico
    - contraseña
- Indicador visual de fortaleza de contraseña
- Aceptación de términos de servicio y política de privacidad
- Envío de código OTP de 6 caracteres al correo
- Verificación de cuenta con tiempo límite de 5 minutos
- Reenvío de OTP
- Inicio de sesión para usuarios verificados
- Recuperación de contraseña mediante OTP
- Restablecimiento de contraseña después de verificar OTP
- Manejo de sesión en PostgreSQL

---
## Requisitos previos

1. Node.js
2. npm
3. Docker Desktop
4. Git

---

## Base de datos con Docker

La base de datos PostgreSQL se ejecuta en un contenedor Docker dentro de la carpeta `DB_SistemaDeRegistro`.

### Estructura

```text
DB_SistemaDeRegistro/
├── .env
├── docker-compose.yml
└── init/
    └── 01_init.sql
```

---
## Configuracion de DB

1. Ingresar a la carpeta de DB
```text
cd DB_SistemaDeRegistro
```

2. Configurar el .env
```text
POSTGRES_DB=sistema_de_registro_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Admin123
POSTGRES_PORT=5432
```
3. Levantar el contenedor PostgreSQL
```text
docker compose up -d
```
## Instalar dependencias
1. Instalar dependencias
```text
npm install
```
2. Configurar el archivo .env
```bash
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_de_registro_db
DB_USER=postgres
DB_PASSWORD=Admin123

SESSION_SECRET=mi_clave_super_secreta_123456

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
MAIL_FROM="Sistema de Registro <tu_correo@gmail.com>"
```
3. Ejecutar el Proyecto

```bash
npm run dev
```
4. Abrir en el navegador

```text
http://localhost:3000/register
```

## PRUEBAS

**1. Pantalla Registro de Usuarios**
<br>
<img align="center" alt="coding" width="580" src="imagenes/image_01.png">
<br>

<img align="center" alt="coding" width="580" src="imagenes/image_04.png">
<br>

<br>

**2. Pantalla Loguin**
<br>
<img align="center" alt="coding" width="480" src="imagenes/image_02.png">

**3. Pantalla Recuperar Contraseña**
<br>
<img align="center" alt="coding" width="1080" src="imagenes/image_03.png">

## Flujo funcional del sistema
**DIAGRAMA DE FLUJO**
    <img align="center" alt="coding" width="980" src="imagenes/Diagrama.png">
<br>

**DIAGRAMA BIZAGUI**
    <img align="center" alt="coding" width="1280" src="imagenes/Diagrama_bizagui.png">

---

## Autor
**SHELVY CARRASCO ORÉ**
- GitHub: [@scarrascoore](https://github.com/scarrascoore)
- LinkedIn: [Shelvycarrascoore](https://linkedin.com/in/shelvycarrascoore)


## LICENCIA

MIT License

Copyright (c) 2026 Shelvy Carrasco Oré

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
