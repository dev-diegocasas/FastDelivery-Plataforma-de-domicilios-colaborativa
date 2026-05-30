"use server";

import { eq, and, sql } from "drizzle-orm";
import { hashSync, compare } from "bcryptjs";
import { db } from "@/lib/db/connection";
import { auth } from "@/lib/auth/auth";
import { users, restaurants, dishes, addresses, notifications, repartidorAvailability } from "../../../drizzle/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import {
  requestResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from "@/lib/validations";

export async function requestPasswordReset(email: string) {
  const parsed = requestResetSchema.parse({ email });

  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, parsed.email),
        sql`${users.deletedAt} IS NULL`,
      ),
    )
    .limit(1);

  if (!user) {
    throw new Error("No existe una cuenta con ese correo electrónico");
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    })
    .where(eq(users.id, user.id));

  await sendPasswordResetEmail(user.email, user.name, token);

  return { success: true, message: "Revisa tu correo para restablecer tu contraseña." };
}

export async function resetPassword(token: string, newPassword: string) {
  const parsed = resetPasswordSchema.parse({ token, newPassword });

  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.resetPasswordToken, parsed.token),
        sql`${users.resetPasswordExpires} > NOW()`,
        sql`${users.deletedAt} IS NULL`,
      ),
    )
    .limit(1);

  if (!user) {
    throw new Error("Token inválido o expirado");
  }

  const hashed = hashSync(parsed.newPassword, 10);

  await db
    .update(users)
    .set({
      passwordHash: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { success: true, message: "Contraseña actualizada exitosamente." };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const parsed = changePasswordSchema.parse({ currentPassword, newPassword });

  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) throw new Error("Usuario no encontrado");

  const isValid = await compare(parsed.currentPassword, user.passwordHash);
  if (!isValid) throw new Error("La contraseña actual no es correcta");

  const hashed = hashSync(parsed.newPassword, 10);

  await db
    .update(users)
    .set({
      passwordHash: hashed,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { success: true, message: "Contraseña actualizada exitosamente." };
}

export async function verifyEmail(token: string) {
  const parsed = verifyEmailSchema.parse({ token });

  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.emailVerificationToken, parsed.token),
        sql`${users.emailVerificationExpires} > NOW()`,
        sql`${users.deletedAt} IS NULL`,
      ),
    )
    .limit(1);

  if (!user) {
    throw new Error("Token inválido o expirado");
  }

  await db
    .update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { success: true, message: "Correo verificado exitosamente." };
}

export async function resendVerification(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.emailVerified, false),
        sql`${users.deletedAt} IS NULL`,
      ),
    )
    .limit(1);

  if (!user) {
    throw new Error("No hay una cuenta pendiente de verificación con ese correo");
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    })
    .where(eq(users.id, user.id));

  await sendVerificationEmail(user.email, user.name, token);

  return { success: true, message: "Correo reenviado." };
}

export async function deleteAccount(currentPassword: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) throw new Error("Usuario no encontrado");

  const isValid = await compare(currentPassword, user.passwordHash);
  if (!isValid) throw new Error("Contraseña incorrecta");

  // Limpiar datos vinculados según rol
  if (user.role === "admin") {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(
        and(
          eq(restaurants.adminId, user.id),
          sql`${restaurants.deletedAt} IS NULL`,
        ),
      )
      .limit(1);
    if (restaurant) {
      await db
        .update(dishes)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(dishes.restaurantId, restaurant.id));
      await db
        .update(restaurants)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(restaurants.id, restaurant.id));
    }
  }

  if (user.role === "repartidor") {
    await db
      .delete(repartidorAvailability)
      .where(eq(repartidorAvailability.repartidorId, user.id));
  }

  await db.delete(addresses).where(eq(addresses.userId, user.id));
  await db.delete(notifications).where(eq(notifications.userId, user.id));

  const anonEmail = `deleted-${user.id.slice(0, 8)}@deleted.local`;

  await db
    .update(users)
    .set({
      email: anonEmail,
      passwordHash: "",
      emailVerificationToken: null,
      emailVerificationExpires: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const { signOut } = await import("@/lib/auth/auth");
  await signOut({ redirect: false });
}
