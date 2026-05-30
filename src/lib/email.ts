import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

function buildVerificationLink(token: string) {
  return `${process.env.AUTH_URL}/verificar-correo?token=${token}`;
}

function buildResetLink(token: string) {
  return `${process.env.AUTH_URL}/recuperar-contrasena?token=${token}`;
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
) {
  const link = buildVerificationLink(token);
  console.log("=".repeat(60));
  console.log(`📧 EMAIL PARA: ${name} <${email}>`);
  console.log(`📋 ASUNTO: Verifica tu correo — FastDelivery`);
  console.log(`🔗 LINK: ${link}`);
  console.log("=".repeat(60));

  await transporter.sendMail({
    from: `"FastDelivery" <${process.env.SMTP_USER!}>`,
    to: email,
    subject: "Verifica tu correo — FastDelivery",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>¡Hola ${name}!</h2>
      <p>Gracias por registrarte en FastDelivery. Verifica tu correo para activar tu cuenta:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">Verificar correo</a>
      <p style="color:#666;font-size:14px;">Este enlace expira en 24 horas.</p>
      <p style="color:#666;font-size:12px;">Si no creaste esta cuenta, ignora este mensaje.</p>
    </div>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
) {
  const link = buildResetLink(token);
  console.log("=".repeat(60));
  console.log(`📧 EMAIL PARA: ${name} <${email}>`);
  console.log(`📋 ASUNTO: Restablece tu contraseña — FastDelivery`);
  console.log(`🔗 LINK: ${link}`);
  console.log("=".repeat(60));

  await transporter.sendMail({
    from: `"FastDelivery" <${process.env.SMTP_USER!}>`,
    to: email,
    subject: "Restablece tu contraseña — FastDelivery",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>Hola ${name}</h2>
      <p>Solicitaste restablecer tu contraseña. Haz clic en el enlace:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">Restablecer contraseña</a>
      <p style="color:#666;font-size:14px;">Este enlace expira en 1 hora.</p>
      <p style="color:#666;font-size:12px;">Si no solicitaste esto, ignora este correo.</p>
    </div>`,
  });
}
