<img align="right" width="110" src="public/vite.svg" alt="Logo" />

# Aplicación de Firma Electrónica

Plataforma de escritorio (Electron + React + Express + MongoDB + Supabase) para gestionar certificados, documentos y flujos de firma colaborativa con notificaciones por correo.

---

## Índice
1. Características
2. Arquitectura
3. Requisitos
4. Instalación y Variables de entorno
5. Scripts
6. Estructura
7. Modelos de datos
8. Flujos
9. Endpoints REST
10. Seguridad
11. Emails
12. Firma PDF (coordenadas)
13. Roadmap

---

## 1. Características
- Autenticación / registro con verificación y recuperación (Supabase + JWT)
- Solicitudes de certificado (aprobación / rechazo con motivo + email)
- Generación y/o subida de certificados P12 cifrados
- Gestión de PDFs (subir, listar, descargar, eliminar)
- Firma digital incremental con sello visual (QR + texto)
- Solicitudes de firma a otros usuarios (aceptar / rechazar con motivo)
- Sistema de amigos (enviar, aceptar solicitudes, listar)
- Interfaz moderna (Mantine + Tailwind), dark mode, toasts, modales
- Cifrado AES-256-CBC para PDFs y certificados
- Empaquetado con Electron Builder

## 2. Arquitectura
| Capa | Tecnología | Detalle |
|------|-----------|---------|
| UI | React 18 + TypeScript | Mantine + Tailwind |
| Backend | Express | Rutas modulares TS |
| DB | MongoDB (Mongoose) | Documentos y estados |
| Usuarios | Supabase | Perfil / email / isAdmin |
| Auth | JWT | Bearer token |
| Firma | pdf-lib / incremental signer | Inserta sello + firma PKCS#7 |
| Email | Nodemailer (SMTP) | Plantillas en `emailService` |

## 3. Requisitos
- Node >=16
- MongoDB
- Supabase
- SMTP para emails

## 4. Instalación & .env
```bash
git clone <url>
cd electronic_signature_app
npm install
```
`.env` ejemplo:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
JWT_SECRET=super_secreto
VITE_API_HOST=localhost
VITE_API_PORT=5174
VITE_API_URL=http://localhost:5174
VITE_MONGODB_URL=mongodb://localhost:27017/firma
ENCRYPTION_KEY_PDF=<32_bytes>
ENCRYPTION_KEY_CERTIFICATE=<32_bytes>
SMTP_HOST=smtp.proveedor.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=clave
```

## 5. Scripts
| Script | Descripción |
|--------|-------------|
| `dev` | Front + API en desarrollo |
| `dev:server` | Solo backend |
| `build` | Build producción |

## 6. Estructura (resumen)
```
electron/
src/
   renderer/src/...
   server/{controllers,routes,services,models,utils}
files/{certificates,pdf}
```

## 7. Modelos
Mongo:
- CertificateRequest(status, rejectionReason, certificateId)
- SignatureRequest(status, rejectionReason)
- PdfDocument(encryptedContent, status)
- Certificate(encryptedContent, hash, userId)
- UserMongo(friends, friendRequestsSent/Received)
Supabase:
- users(id,name,email,isAdmin,...)

## 8. Flujos
1. Registro / login -> token
2. Solicitud de certificado (admin aprueba/rechaza)
3. Subir PDF
4. Enviar solicitud de firma
5. Receptor firma (x,y,page) o rechaza con motivo
6. Emails automáticos en cada evento clave

## 9. Endpoints REST
Prefijo típico: `/api`. Requieren `Authorization: Bearer <token>` salvo auth.

### Auth
| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| POST | /login | { email,password } | Inicia sesión |
| POST | /register | { name,email,password } | Registra usuario |
| POST | /register/verify | { email,code } | Verifica código |
| POST | /register/resend | { email } | Reenvía código |
| POST | /password/request-reset | { email } | Solicita reset |
| POST | /password/reset | { email,code,newPassword } | Resetea password |

### Usuarios
| GET | /users/:id | Perfil público |

### Amistad
| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| GET | /users | - | Lista usuarios no admin |
| GET | /friends/:id | - | Amigos y solicitudes |
| POST | /friend-request | { fromId,toId } | Enviar solicitud |
| POST | /friend-request/accept | { fromId,toId } | Aceptar |

### Solicitudes de Certificado
| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| POST | /certificate-requests | datos CSR | Crear solicitud |
| GET | /certificate-requests | - | Admin: pendientes / User: propias |
| POST | /certificate-requests/:id/approve | - | Aprobar y generar p12 |
| POST | /certificate-requests/:id/reject | { rejectionReason } | Rechazar |

### Solicitudes de Firma
| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| POST | /signature-request | { documentId,fromUserId,toUserId } | Crear |
| GET | /signature-requests/:userId | - | Recibidas |
| POST | /signature-request/:id/complete | - | Marcar firmada |
| POST | /signature-request/:id/reject | { rejectionReason } | Rechazar |

### Documentos / Certificados
| Método | Ruta | Body/FormData | Descripción |
|--------|------|-------------|-------------|
| POST | /uploads/pdf | file=pdf | Subir PDF |
| GET | /documents | - | Listar propios |
| GET | /documents/:id | - | Metadatos autorizados |
| DELETE | /documents/:id | - | Borrar PDF |
| GET | /pdf/:id/download | - | Descargar PDF |
| POST | /sign-pdf | { documentId,certId,certPassword,stampImageBase64,userName,x,y,page } | Firmar |
| GET | /pdf/:id/signatures | - | Metadatos firma (placeholder) |
| POST | /uploads/certificates | certificate(p12) | Subir |
| PUT | /uploads/certificates | certificate(p12) | Reemplazar |
| GET | /certificates | - | Listar certificados |
| DELETE | /certificates/:id | - | Eliminar |
| POST | /uploads/certificates/generate | { datos } | Generar |
| GET | /certificates/:id/download | - | Descargar (GET) |
| POST | /certificates/:id/download | { password? } | Descargar (POST) |

## 10. Seguridad
- AES-256-CBC para PDFs / P12
- JWT tokens
- Verificación de estados (no doble aprobación / firma)
- Datos sensibles nunca en claro en BD

## 11. Emails
Eventos: solicitud/ aprobación / rechazo de certificado; solicitud / firma / rechazo de firma; solicitud de amistad. Plantillas en `utils/emailService.ts`.

## 12. Firma PDF
Frontend captura coordenadas reales -> backend inserta estampa (QR + texto) y firma incremental con certificado P12 (pkcs12 + password). Se actualiza documento cifrado.

## 13. Roadmap
- Auditoría y logs
- Verificación pública de firmas
- Historial de versiones
- Paginación y búsqueda
- i18n

---
© 2025 Proyecto de Firma Electrónica