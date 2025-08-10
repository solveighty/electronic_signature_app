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
