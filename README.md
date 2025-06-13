# Aplicación de Firma Electrónica

Una aplicación de escritorio para gestión y firma electrónica de documentos, desarrollada con Electron, React, TypeScript y Express.

## Características

- Autenticación de usuarios (registro e inicio de sesión)
- Subida de documentos PDF
- Gestión de documentos para firma electrónica
- Interfaz moderna con Mantine UI y Tailwind CSS

## Requisitos previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Supabase para la base de datos

## Instalación

1. Clona este repositorio:
```bash
git clone <url-del-repositorio>
cd electronic_signature_app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
JWT_SECRET=tu_clave_secreta_para_jwt
```

## Desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

Esto iniciará tanto el servidor de desarrollo de Vite (frontend) como el servidor Express (backend).

Para ejecutar solo el servidor backend:

```bash
npm run dev:server
```

## Estructura del proyecto

- `/electron`: Código principal de Electron
- `/src`: Código fuente de la aplicación React
  - `/renderer/src`: Componentes React
  - `/server`: Servidor Express con controladores y rutas
    - `/controllers`: Lógica de negocio
    - `/models`: Modelos de datos
    - `/routes`: Rutas de la API
    - `/utils`: Utilidades y configuración

## Construcción para producción

Para construir la aplicación para producción:

```bash
npm run build
```

Esto generará los archivos de distribución en las carpetas `dist` y `release`.

## Tecnologías utilizadas

- Electron: Framework para aplicaciones de escritorio
- React: Biblioteca para interfaces de usuario
- TypeScript: Superset tipado de JavaScript
- Express: Framework para el servidor backend
- Mantine UI: Biblioteca de componentes para React
- Tailwind CSS: Framework de CSS utilitario
- Supabase: Plataforma de backend como servicio
