import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

function buildVerificationLink(token: string) {
  const base = process.env.AUTH_URL;
  if (!base) {
    console.error("❌ AUTH_URL no está configurada en las variables de entorno de Railway");
    return `[AUTH_URL no configurada] /verificar-correo?token=${token}`;
  }
  return `${base}/verificar-correo?token=${token}`;
}

function buildResetLink(token: string) {
  const base = process.env.AUTH_URL;
  if (!base) {
    console.error("❌ AUTH_URL no está configurada en las variables de entorno de Railway");
    return `[AUTH_URL no configurada] /recuperar-contrasena?token=${token}`;
  }
  return `${base}/recuperar-contrasena?token=${token}`;
}

async function sendEmail(
  email: string,
  name: string,
  subject: string,
  html: string,
  link: string,
) {
  console.log("=".repeat(60));
  console.log(`📧 EMAIL PARA: ${name} <${email}>`);
  console.log(`📋 ASUNTO: ${subject}`);
  console.log(`🔗 LINK: ${link}`);
  console.log("=".repeat(60));

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("⚠️ SMTP_USER/SMTP_PASS no configurados. Usa el link de arriba manualmente.");
    return;
  }

  try {
    await getTransporter().sendMail({
      from: `"FastDelivery" <${process.env.SMTP_USER!}>`,
      to: email,
      subject,
      html,
    });
    console.log("✅ Email enviado correctamente");
  } catch (err) {
    const error = err as Error;
    console.error(`❌ Error al enviar email: ${error.message}`);
    console.log(`🔗 Usa este link manualmente: ${link}`);
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
) {
  const link = buildVerificationLink(token);
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
    <h2>¡Hola ${name}!</h2>
    <p>Gracias por registrarte en FastDelivery. Verifica tu correo para activar tu cuenta:</p>
    <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">Verificar correo</a>
    <p style="color:#666;font-size:14px;">Este enlace expira en 24 horas.</p>
    <p style="color:#666;font-size:12px;">Si no creaste esta cuenta, ignora este mensaje.</p>
  </div>`;
  await sendEmail(email, name, "Verifica tu correo — FastDelivery", html, link);
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
) {
  const link = buildResetLink(token);
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
    <h2>Hola ${name}</h2>
    <p>Solicitaste restablecer tu contraseña. Haz clic en el enlace:</p>
    <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">Restablecer contraseña</a>
    <p style="color:#666;font-size:14px;">Este enlace expira en 1 hora.</p>
    <p style="color:#666;font-size:12px;">Si no solicitaste esto, ignora este correo.</p>
  </div>`;
  await sendEmail(email, name, "Restablece tu contraseña — FastDelivery", html, link);
}
