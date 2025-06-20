# Aplicación de Firma Electrónica

Una aplicación de escritorio para gestión y firma electrónica de documentos, desarrollada con Electron, React, TypeScript y Express.

## Características

- Autenticación de usuarios: Registro e inicio de sesión con almacenamiento seguro en Supabase
- Gestión de documentos PDF, Cifrado AES-256-CBC para máxima seguridad
- Gestión de certificados digitales: Soporte para certificados P12, con almacenamiento seguro de hash del Certificado (no el certificado completo)
- Interfaz moderna con Mantine UI y Tailwind CSS, notificaciones con React Toastify y animaciones con React Spring
- Autenticación basada en JWT, cifrado de extremo a extremo para documentos y certificados

## Requisitos previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Supabase para la base de datos
- MongoDB (local o Atlas)

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
VITE_API_HOST=tu_host
VITE_API_PORT=tu_puerto_host
VITE_API_URL=http://${VITE_API_HOST}:${VITE_API_PORT}
VITE_MONGODB_URL=tu_url_de_mongo
ENCRYPTION_KEY_PDF=tu_clave_para_encriptar_pdf
ENCRYPTION_KEY_CERTIFICATE=tu_clave_para_encriptar_certificado
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

```
electronic_signature_app/
├── electron/            # Código principal de Electron
├── src/                 # Código fuente principal
│   ├── assets/          # Recursos estáticos
│   ├── files/           # Directorio temporal para archivos
│   │   ├── certificates/    # Certificados P12
│   │   └── pdf/             # Archivos PDF
│   ├── renderer/        # Código del frontend
│   │   └── src/
│   │       ├── components/  # Componentes de React
│   │       │   ├── AuthLayout.tsx
│   │       │   ├── Dashboard.tsx
│   │       │   ├── Login.tsx
│   │       │   ├── PrivateRoute.tsx
│   │       │   └── Register.tsx
│   │       ├── context/     # Contextos de React (autenticación)
│   │       ├── hooks/       # Custom hooks
│   │       │   └── useDocumentManager.ts  # Gestión de documentos
│   │       └── utils/       # Utilidades frontend
│   │           └── api.ts   # Cliente API con Axios
│   └── server/          # Servidor Express
│       ├── controllers/     # Controladores
│       │   ├── authController.ts
│       │   └── uploadsController.ts
│       ├── models/          # Modelos de datos MongoDB
│       │   ├── Certificate.ts
│       │   ├── PdfDocument.ts
│       │   └── User.ts
│       ├── routes/          # Rutas de la API
│       │   ├── auth.ts
│       │   └── uploads.ts
│       ├── services/        # Servicios y lógica de negocio
│       │   ├── crtService.ts    # Manejo de certificados
│       │   └── pdfService.ts    # Manejo de PDFs
│       └── utils/           # Utilidades backend
│           ├── mongoConnect.ts  # Conexión a MongoDB
│           └── supabase.ts      # Cliente Supabase
```

## Construcción para producción

Para construir la aplicación para producción:

```bash
npm run build
```

Esto generará los archivos de distribución en las carpetas `dist` y `release`.

## Tecnologías utilizadas

### Frontend:

- React 18 con TypeScript
- Mantine UI 8.0 para componentes
- React Router v7 para navegación
- React Spring para animaciones
- React Toastify para notificaciones
- Axios para peticiones HTTP
- Tailwind CSS para estilos

### Backend:

- Express para API RESTful
- MongoDB con Mongoose para almacenamiento de documentos
- Supabase para gestión de usuarios
- JWT para autenticación
- Multer para carga de archivos
- Crypto para cifrado de documentos
- Bcrypt para hashing de contraseñas

### Empaquetado y despliegue:

- Electron para aplicación de escritorio
- Vite para desarrollo y construcción
- Electron Builder para empaquetado

## Flujo de trabajo
### Autenticación
- El usuario se registra o inicia sesión
### Subida de certificado
- El usuario sube su certificado P12
### Subida de documentos 
- El usuario sube documentos PDF para firmar
### Gestión de documentos
- El usuario puede ver y gestionar sus documentos