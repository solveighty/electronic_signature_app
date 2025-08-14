import { mailApi } from "./smtp";

interface SendVerificationEmailOptions {
  email: string;
  name: string;
  verificationCode: string;
}

interface SendPasswordResetEmailOptions {
  email: string;
  resetCode: string;
}

interface SendCertificateRequestConfirmationOptions {
  email: string;
  name: string;
  requestId: string;
}

interface SendCertificateApprovedOptions {
  email: string;
  name: string;
  commonName: string;
}

interface SendCertificateRejectedOptions {
  email: string;
  name: string;
  commonName: string;
  rejectionReason: string;
}

/**
 * Sends a verification email with the 6-digit code
 * @param options - Email options containing recipient email, name, and verification code
 */
export const sendVerificationEmail = async (
  options: SendVerificationEmailOptions
): Promise<void> => {
  const { email, name, verificationCode } = options;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Verificación de correo electrónico - Su código de verificación",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Verificación de correo electrónico</h2>
        <p>Hola ${name},</p>
        <p>¡Gracias por registrarte! Por favor, utiliza el siguiente código de verificación para completar tu registro:</p>
        <div style="background-color: #f5f5f5; border: 2px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 36px; margin: 0; letter-spacing: 4px;">${verificationCode}</h1>
        </div>
        <p>Este código de verificación expirará en 10 minutos.</p>
        <p>Si no solicitaste esta verificación, por favor ignora este correo.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
    `,
    text: `
      Hola ${name},
      
      ¡Gracias por registrarte! Por favor, utiliza el siguiente código de verificación para completar tu registro:
      
      ${verificationCode}
      
      Este código de verificación expirará en 10 minutos.
      
      Si no solicitaste esta verificación, por favor ignora este correo.
    `,
  };

  try {
    await mailApi.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Sends a password reset email with the 6-digit code
 * @param options - Email options containing recipient email and reset code
 */
export const sendPasswordResetEmail = async (
  options: SendPasswordResetEmailOptions
): Promise<void> => {
  const { email, resetCode } = options;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Restablecimiento de contraseña - Su código de verificación",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Restablecimiento de contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Por favor, utiliza el siguiente código de verificación:</p>
        <div style="background-color: #f5f5f5; border: 2px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #dc2626; font-size: 36px; margin: 0; letter-spacing: 4px;">${resetCode}</h1>
        </div>
        <p>Este código de verificación expirará en 15 minutos.</p>
        <p><strong>Si no solicitaste este restablecimiento de contraseña, ignora este correo y tu contraseña permanecerá sin cambios.</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
    `,
    text: `
      Restablecimiento de contraseña
      
      Has solicitado restablecer tu contraseña. Por favor, utiliza el siguiente código de verificación:
      
      ${resetCode}
      
      Este código de verificación expirará en 15 minutos.
      
      Si no solicitaste este restablecimiento de contraseña, ignora este correo y tu contraseña permanecerá sin cambios.
    `,
  };

  try {
    await mailApi.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Sends a certificate request confirmation email
 * @param options - Email options containing recipient email, name, and request ID
 */
export const sendCertificateRequestConfirmation = async (
  options: SendCertificateRequestConfirmationOptions
): Promise<void> => {
  const { email, name, requestId } = options;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Solicitud de Certificado Recibida - Confirmación",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Solicitud de Certificado Recibida</h2>
        <p>Hola ${name},</p>
        <p>Hemos recibido tu solicitud de certificado digital. A continuación los detalles:</p>
        <div style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p><strong>ID de Solicitud:</strong> ${requestId}</p>
          <p><strong>Estado:</strong> Pendiente de revisión</p>
          <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        <p>Un administrador revisará tu solicitud y te notificaremos por correo cuando haya una decisión.</p>
        <p>Gracias por tu paciencia.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
    `,
    text: `
      Solicitud de Certificado Recibida
      
      Hola ${name},
      
      Hemos recibido tu solicitud de certificado digital.
      
      ID de Solicitud: ${requestId}
      Estado: Pendiente de revisión
      Fecha de solicitud: ${new Date().toLocaleDateString('es-ES')}
      
      Un administrador revisará tu solicitud y te notificaremos por correo cuando haya una decisión.
      
      Gracias por tu paciencia.
    `,
  };

  try {
    await mailApi.sendMail(mailOptions);
    console.log(`Certificate request confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending certificate request confirmation email:", error);
    throw new Error("Failed to send certificate request confirmation email");
  }
};

/**
 * Sends a certificate approved notification email
 * @param options - Email options containing recipient email, name, and certificate details
 */
export const sendCertificateApprovedNotification = async (
  options: SendCertificateApprovedOptions
): Promise<void> => {
  const { email, name, commonName } = options;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Certificado Aprobado - ¡Ya puedes descargarlo!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a; text-align: center;">¡Certificado Aprobado!</h2>
        <p>Hola ${name},</p>
        <p>¡Excelentes noticias! Tu solicitud de certificado digital ha sido <strong>aprobada</strong>.</p>
        <div style="background-color: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p><strong>Certificado para:</strong> ${commonName}</p>
          <p><strong>Estado:</strong> ✅ Aprobado</p>
          <p><strong>Fecha de aprobación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        <p>Tu certificado ha sido generado exitosamente y ya está disponible en tu cuenta.</p>
        <p>Puedes acceder a la aplicación para descargar y comenzar a usar tu certificado digital.</p>
        <p>¡Gracias por usar nuestros servicios!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
    `,
    text: `
      ¡Certificado Aprobado!
      
      Hola ${name},
      
      ¡Excelentes noticias! Tu solicitud de certificado digital ha sido aprobada.
      
      Certificado para: ${commonName}
      Estado: ✅ Aprobado
      Fecha de aprobación: ${new Date().toLocaleDateString('es-ES')}
      
      Tu certificado ha sido generado exitosamente y ya está disponible en tu cuenta.
      
      Puedes acceder a la aplicación para descargar y comenzar a usar tu certificado digital.
      
      ¡Gracias por usar nuestros servicios!
    `,
  };

  try {
    await mailApi.sendMail(mailOptions);
    console.log(`Certificate approved notification sent to ${email}`);
  } catch (error) {
    console.error("Error sending certificate approved notification:", error);
    throw new Error("Failed to send certificate approved notification");
  }
};

/**
 * Sends a certificate rejected notification email
 * @param options - Email options containing recipient email, name, certificate details, and rejection reason
 */
export const sendCertificateRejectedNotification = async (
  options: SendCertificateRejectedOptions
): Promise<void> => {
  const { email, name, commonName, rejectionReason } = options;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Solicitud de Certificado Rechazada",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626; text-align: center;">Solicitud de Certificado Rechazada</h2>
        <p>Hola ${name},</p>
        <p>Lamentamos informarte que tu solicitud de certificado digital ha sido <strong>rechazada</strong>.</p>
        <div style="background-color: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p><strong>Certificado para:</strong> ${commonName}</p>
          <p><strong>Estado:</strong> ❌ Rechazado</p>
          <p><strong>Fecha de rechazo:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        <div style="background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p><strong>Motivo del rechazo:</strong></p>
          <p>${rejectionReason}</p>
        </div>
        <p>Si tienes alguna pregunta sobre esta decisión o necesitas más información, por favor contacta al administrador del sistema.</p>
        <p>Puedes enviar una nueva solicitud corrigiendo los aspectos mencionados en el motivo del rechazo.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
    `,
    text: `
      Solicitud de Certificado Rechazada
      
      Hola ${name},
      
      Lamentamos informarte que tu solicitud de certificado digital ha sido rechazada.
      
      Certificado para: ${commonName}
      Estado: ❌ Rechazado
      Fecha de rechazo: ${new Date().toLocaleDateString('es-ES')}
      
      Motivo del rechazo:
      ${rejectionReason}
      
      Si tienes alguna pregunta sobre esta decisión o necesitas más información, por favor contacta al administrador del sistema.
      
      Puedes enviar una nueva solicitud corrigiendo los aspectos mencionados en el motivo del rechazo.
    `,
  };

  try {
    await mailApi.sendMail(mailOptions);
    console.log(`Certificate rejected notification sent to ${email}`);
  } catch (error) {
    console.error("Error sending certificate rejected notification:", error);
    throw new Error("Failed to send certificate rejected notification");
  }
};
