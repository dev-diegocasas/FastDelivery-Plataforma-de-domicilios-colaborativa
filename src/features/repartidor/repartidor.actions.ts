"use server";

import { eq, and, sql, desc, notInArray } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { auth } from "@/lib/auth/auth";
import {
  orders,
  orderItems,
  orderStatusLog,
  notifications,
  restaurants,
  users,
  payments,
  repartidorAvailability,
  orderRejections,
} from "../../../drizzle/schema";
import type { OrderStatus } from "@/config/constants";

async function getRepartidorSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "repartidor") {
    throw new Error("No autorizado");
  }
  return session.user;
}

// ── DISPONIBILIDAD ──

export async function getRepartidorStatus() {
  const user = await getRepartidorSession();

  const [availability] = await db
    .select()
    .from(repartidorAvailability)
    .where(eq(repartidorAvailability.repartidorId, user.id))
    .limit(1);

  const isAvailable = availability?.isAvailable ?? false;

  const activeDelivery = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.repartidorId, user.id),
        sql`${orders.status} IN ('EN_CAMINO')`,
      ),
    )
    .limit(1);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [todayDeliveries] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.repartidorId, user.id),
        eq(orders.status, "ENTREGADO"),
        sql`${orders.updatedAt} >= ${todayStart.toISOString()}`,
        sql`${orders.updatedAt} < ${todayEnd.toISOString()}`,
      ),
    );

  const [unread] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, user.id),
        eq(notifications.isRead, false),
      ),
    );

  return {
    isAvailable,
    activeDelivery: (activeDelivery[0] ?? null) as any,
    todayDeliveries: Number(todayDeliveries.count),
    unreadNotifications: Number(unread.count),
  };
}

export async function getRepartidorAvailability() {
  const user = await getRepartidorSession();
  const [avail] = await db
    .select()
    .from(repartidorAvailability)
    .where(eq(repartidorAvailability.repartidorId, user.id))
    .limit(1);
  return avail?.isAvailable ?? false;
}

export async function toggleAvailability() {
  const user = await getRepartidorSession();
  const existing = await db
    .select()
    .from(repartidorAvailability)
    .where(eq(repartidorAvailability.repartidorId, user.id))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(repartidorAvailability).values({
      repartidorId: user.id,
      isAvailable: true,
    });
    return true;
  }

  const newState = !existing[0].isAvailable;
  await db
    .update(repartidorAvailability)
    .set({ isAvailable: newState, updatedAt: new Date() })
    .where(eq(repartidorAvailability.repartidorId, user.id));
  return newState;
}

// ── PEDIDOS ASIGNADOS ──

export async function getAvailableOrders() {
  const user = await getRepartidorSession();
  const [avail] = await db
    .select()
    .from(repartidorAvailability)
    .where(eq(repartidorAvailability.repartidorId, user.id))
    .limit(1);

  if (!avail?.isAvailable) return [];

  const rejectedIds = db
    .select({ orderId: orderRejections.orderId })
    .from(orderRejections)
    .where(eq(orderRejections.repartidorId, user.id));

  return db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "EN_PREPARACION" as OrderStatus),
        sql`${orders.repartidorId} IS NULL`,
        notInArray(orders.id, rejectedIds),
      ),
    )
    .orderBy(desc(orders.createdAt));
}

export async function acceptDelivery(orderId: string) {
  const user = await getRepartidorSession();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) throw new Error("Pedido no encontrado");
  if (order.repartidorId) throw new Error("El pedido ya tiene un repartidor asignado");
  if (order.status !== "EN_PREPARACION") throw new Error("El pedido no está disponible");

  const [updated] = await db
    .update(orders)
    .set({
      repartidorId: user.id,
      status: "EN_CAMINO",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusLog).values({
    orderId,
    previousStatus: order.status as OrderStatus,
    newStatus: "EN_CAMINO",
    changedBy: user.id,
  });

  await db.insert(notifications).values({
    userId: order.clienteId,
    type: "PEDIDO_ASIGNADO_REPARTIDOR",
    title: "Repartidor asignado",
    message: `Tu pedido está siendo llevado por ${user.name}`,
    relatedOrderId: orderId,
  });

  // Notificar al admin
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, order.restaurantId))
    .limit(1);

  if (restaurant) {
    await db.insert(notifications).values({
      userId: restaurant.adminId,
      type: "PEDIDO_ASIGNADO_REPARTIDOR",
      title: "Repartidor asignado",
      message: `El pedido #${order.id.slice(0, 8)} está siendo llevado por ${user.name}.`,
      relatedOrderId: orderId,
    });
  }

  // Bloquear disponibilidad del repartidor
  await db
    .update(repartidorAvailability)
    .set({ isAvailable: false, updatedAt: new Date() })
    .where(eq(repartidorAvailability.repartidorId, user.id));

  return updated;
}

export async function rejectDelivery(orderId: string) {
  const user = await getRepartidorSession();

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.status, "EN_PREPARACION" as OrderStatus),
        sql`${orders.repartidorId} IS NULL`,
      ),
    )
    .limit(1);

  if (!order) throw new Error("Pedido no encontrado o ya no disponible");

  await db.insert(orderRejections).values({
    orderId,
    repartidorId: user.id,
  });

  return { success: true };
}

export async function getRepartidorDeliveryHistory() {
  const user = await getRepartidorSession();
  return db
    .select()
    .from(orders)
    .where(eq(orders.repartidorId, user.id))
    .orderBy(desc(orders.createdAt));
}

// ── DETALLE ENTREGA ──

export async function getDeliveryDetail(orderId: string) {
  const user = await getRepartidorSession();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return null;
  if (order.repartidorId && order.repartidorId !== user.id) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const [restaurant] = await db
    .select({ name: restaurants.name, address: restaurants.address })
    .from(restaurants)
    .where(eq(restaurants.id, order.restaurantId))
    .limit(1);

  const [cliente] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, order.clienteId))
    .limit(1);

  return { order, items, restaurant, cliente };
}

export async function updateDeliveryStatus(
  orderId: string,
  newStatus: OrderStatus,
  purchaseToken?: string,
) {
  const user = await getRepartidorSession();

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.repartidorId, user.id)))
    .limit(1);
  if (!order) throw new Error("Pedido no encontrado");

  const validTransitions: Record<string, OrderStatus[]> = {
    EN_CAMINO: ["ENTREGADO", "CANCELADO"],
  };

  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new Error(`No se puede cambiar de ${order.status} a ${newStatus}`);
  }

  // Validar token de compra al entregar
  if (newStatus === "ENTREGADO") {
    if (!purchaseToken) throw new Error("Debes ingresar el token de compra del cliente");
    if (order.purchaseToken && purchaseToken !== order.purchaseToken) {
      console.log("[DEBUG] Token mismatch:", { entered: purchaseToken, stored: order.purchaseToken });
      throw new Error("Token de compra inválido");
    }
  }

  const [updated] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusLog).values({
    orderId,
    previousStatus: order.status as OrderStatus,
    newStatus,
    changedBy: user.id,
  });

  // Notificar al cliente
  await db.insert(notifications).values({
    userId: order.clienteId,
    type: newStatus === "ENTREGADO" ? "PEDIDO_ENTREGADO" : "PEDIDO_CANCELADO",
    title: newStatus === "ENTREGADO" ? "Pedido entregado" : "Pedido cancelado",
    message: newStatus === "ENTREGADO"
      ? "Tu pedido ha sido entregado exitosamente."
      : "El pedido fue cancelado.",
    relatedOrderId: orderId,
  });

  // Notificar al admin del restaurante
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, order.restaurantId))
    .limit(1);

  if (restaurant) {
    await db.insert(notifications).values({
      userId: restaurant.adminId,
      type: newStatus === "ENTREGADO" ? "PEDIDO_ENTREGADO" : "PEDIDO_CANCELADO",
      title: newStatus === "ENTREGADO" ? "Pedido entregado" : "Pedido cancelado",
      message: newStatus === "ENTREGADO"
        ? `El pedido #${order.id.slice(0, 8)} ha sido entregado.`
        : `El pedido #${order.id.slice(0, 8)} fue cancelado.`,
      relatedOrderId: orderId,
    });
  }

  // Desbloquear disponibilidad del repartidor
  await db
    .update(repartidorAvailability)
    .set({ isAvailable: true, updatedAt: new Date() })
    .where(eq(repartidorAvailability.repartidorId, user.id));

  return updated;
}
