const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: String(process.env.SMTP_SECURE) === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendOtpEmail({ to, fullName, otp }) {
  const subject = "Código de verificación - Sistema de Registro";

  const text = `
Hola ${fullName},

Tu código de verificación es: ${otp}

Este código expira en 5 minutos.

Si no solicitaste este registro, puedes ignorar este mensaje.
  `.trim();

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Verifica tu cuenta</h2>
      <p>Hola <strong>${fullName}</strong>,</p>
      <p>Tu código de verificación para completar el registro es:</p>

      <div style="margin: 24px 0; padding: 18px; text-align: center; border-radius: 14px; background: #eef2ff; border: 1px solid #c7d2fe;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
      </div>

      <p>Este código expira en <strong>5 minutos</strong>.</p>
      <p>Si no solicitaste este registro, puedes ignorar este correo.</p>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #6b7280;">Sistema de Registro</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html
  });
}

module.exports = {
  sendOtpEmail
};