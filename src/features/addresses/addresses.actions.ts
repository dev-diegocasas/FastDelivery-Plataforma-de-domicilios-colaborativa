"use server";

import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { auth } from "@/lib/auth/auth";
import {
  createAddressSchema,
  updateAddressSchema,
} from "@/lib/validations";
import { addresses } from "../../../drizzle/schema";
import { MAX_ADDRESSES_PER_USER } from "@/config/constants";

export async function getUserAddresses() {
  const session = await auth();
  if (!session?.user) return [];
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id))
    .orderBy(sql`${addresses.isDefault} DESC`);
}

export async function createAddress(data: {
  label?: string;
  address: string;
  lat?: string;
  lng?: string;
  isDefault?: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  const parsed = createAddressSchema.parse(data);

  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(addresses)
    .where(eq(addresses.userId, session.user.id));

  if (Number(existing[0]?.count ?? 0) >= MAX_ADDRESSES_PER_USER) {
    throw new Error(
      `Solo puedes tener hasta ${MAX_ADDRESSES_PER_USER} direcciones guardadas`,
    );
  }

  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, session.user.id));
  }

  const [addr] = await db
    .insert(addresses)
    .values({
      userId: session.user.id,
      label: parsed.label ?? null,
      address: parsed.address,
      lat: parsed.lat ?? null,
      lng: parsed.lng ?? null,
      isDefault: parsed.isDefault ?? existing.length === 0,
    })
    .returning();
  return addr;
}

export async function updateAddress(
  addressId: string,
  data: {
    label?: string;
    address?: string;
    lat?: string;
    lng?: string;
    isDefault?: boolean;
  },
) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  const parsed = updateAddressSchema.parse(data);

  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, session.user.id));
  }

  const [addr] = await db
    .update(addresses)
    .set({
      ...(parsed.label !== undefined && { label: parsed.label ?? null }),
      ...(parsed.address && { address: parsed.address }),
      ...(parsed.lat !== undefined && { lat: parsed.lat ?? null }),
      ...(parsed.lng !== undefined && { lng: parsed.lng ?? null }),
      ...(parsed.isDefault !== undefined && { isDefault: parsed.isDefault }),
    })
    .where(
      and(
        eq(addresses.id, addressId),
        eq(addresses.userId, session.user.id),
      ),
    )
    .returning();
  return addr;
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  const [addr] = await db
    .delete(addresses)
    .where(
      and(
        eq(addresses.id, addressId),
        eq(addresses.userId, session.user.id),
      ),
    )
    .returning();
  return addr;
}
