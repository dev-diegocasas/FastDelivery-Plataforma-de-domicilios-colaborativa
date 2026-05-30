import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/connection";
import { users } from "../../../../../drizzle/schema";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["cliente", "admin", "repartidor"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 409 },
      );
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: hashSync(data.password, 10),
        role: data.role,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    await sendVerificationEmail(data.email, data.name, token);

    return NextResponse.json(
      {
        success: true,
        message:
          "Te enviamos un correo de verificación. Revisa tu bandeja de entrada.",
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 },
    );
  }
}
