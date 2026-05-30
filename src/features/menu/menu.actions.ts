"use server";

import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { auth } from "@/lib/auth/auth";
import {
  restaurants,
  dishes,
  orders,
  orderItems,
  orderStatusLog,
  notifications,
  users,
  payments,
} from "../../../drizzle/schema";
import type { OrderStatus } from "@/config/constants";
import {
  createDishSchema,
  updateDishSchema,
  updateOrderStatusSchema,
  createRestaurantSchema,
  updateRestaurantSchema,
} from "@/lib/validations";

async function getAdminRestaurant() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(
      and(
        eq(restaurants.adminId, session.user.id),
        sql`${restaurants.deletedAt} IS NULL`,
      ),
    )
    .limit(1);
  return restaurant ?? null;
}

// ── RESTAURANTE CRUD ──

export async function getMyRestaurant() {
  return getAdminRestaurant();
}

export async function createRestaurant(data: {
  name: string;
  description?: string;
  category: string;
  address: string;
  estimatedTime?: number;
  minOrder?: number;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  const existing = await getAdminRestaurant();
  if (existing) throw new Error("Ya tienes un restaurante registrado");

  const parsed = createRestaurantSchema.parse(data);

  const [restaurant] = await db
    .insert(restaurants)
    .values({
      adminId: session.user.id,
      name: parsed.name,
      description: parsed.description ?? null,
      category: parsed.category,
      address: parsed.address,
      estimatedTime: parsed.estimatedTime ?? 30,
      minOrder: parsed.minOrder?.toString() ?? "0",
    })
    .returning();
  return restaurant;
}

export async function updateRestaurant(data: {
  name?: string;
  description?: string;
  category?: string;
  address?: string;
  estimatedTime?: number;
  minOrder?: number;
  isOpen?: boolean;
}) {
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");

  const parsed = updateRestaurantSchema.parse(data);

  const updateData: Record<string, unknown> = {};
  if (parsed.name !== undefined) updateData.name = parsed.name;
  if (parsed.description !== undefined) updateData.description = parsed.description ?? null;
  if (parsed.category !== undefined) updateData.category = parsed.category;
  if (parsed.address !== undefined) updateData.address = parsed.address;
  if (parsed.estimatedTime !== undefined) updateData.estimatedTime = parsed.estimatedTime;
  if (parsed.minOrder !== undefined) updateData.minOrder = parsed.minOrder.toString();
  if (parsed.isOpen !== undefined) updateData.isOpen = parsed.isOpen;
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(restaurants)
    .set(updateData)
    .where(eq(restaurants.id, restaurant.id))
    .returning();
  return updated;
}

// ── DASHBOARD KPIs ──

export async function getAdminStats() {
  const restaurant = await getAdminRestaurant();
  if (!restaurant) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [activeDishes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(dishes)
    .where(
      and(
        eq(dishes.restaurantId, restaurant.id),
        eq(dishes.isActive, true),
        sql`${dishes.deletedAt} IS NULL`,
      ),
    );

  const todayOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurant.id),
        sql`${orders.createdAt} >= ${today.toISOString()}`,
        sql`${orders.createdAt} < ${todayEnd.toISOString()}`,
      ),
    );

  const pendingOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurant.id),
        sql`${orders.status} IN ('RECIBIDO', 'EN_PREPARACION')`,
      ),
    );

  return {
    restaurant,
    activeDishes: Number(activeDishes.count),
    todayOrders: Number(todayOrders[0]?.count ?? 0),
    pendingOrders: Number(pendingOrders[0]?.count ?? 0),
    avgRating: Number(restaurant.avgRating),
  };
}

// ── MENÚ CRUD ──

export async function getAdminDishes() {
  const restaurant = await getAdminRestaurant();
  if (!restaurant) return [];
  return db
    .select()
    .from(dishes)
    .where(
      and(
        eq(dishes.restaurantId, restaurant.id),
        sql`${dishes.deletedAt} IS NULL`,
      ),
    )
    .orderBy(dishes.createdAt);
}

export async function createDish(data: {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}) {
  const parsed = createDishSchema.parse(data);
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");
  const [dish] = await db
    .insert(dishes)
    .values({
      restaurantId: restaurant.id,
      name: parsed.name,
      description: parsed.description ?? null,
      price: parsed.price.toString(),
      imageUrl: parsed.imageUrl ?? null,
    })
    .returning();
  return dish;
}

export async function updateDish(
  dishId: string,
  data: { name?: string; description?: string; price?: number; imageUrl?: string },
) {
  const parsed = updateDishSchema.parse(data);
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");
  const [dish] = await db
    .update(dishes)
    .set({
      ...(parsed.name && { name: parsed.name }),
      ...(parsed.description !== undefined && { description: parsed.description ?? null }),
      ...(parsed.price && { price: parsed.price.toString() }),
      ...(parsed.imageUrl !== undefined && { imageUrl: parsed.imageUrl ?? null }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dishes.id, dishId),
        eq(dishes.restaurantId, restaurant.id),
        sql`${dishes.deletedAt} IS NULL`,
      ),
    )
    .returning();
  return dish;
}

export async function toggleDishActive(dishId: string) {
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");
  const [current] = await db
    .select()
    .from(dishes)
    .where(
      and(
        eq(dishes.id, dishId),
        eq(dishes.restaurantId, restaurant.id),
      ),
    )
    .limit(1);
  if (!current) throw new Error("Plato no encontrado");
  const [dish] = await db
    .update(dishes)
    .set({ isActive: !current.isActive, updatedAt: new Date() })
    .where(eq(dishes.id, dishId))
    .returning();
  return dish;
}

export async function deleteDish(dishId: string) {
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");
  const [dish] = await db
    .update(dishes)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(dishes.id, dishId),
        eq(dishes.restaurantId, restaurant.id),
      ),
    )
    .returning();
  return dish;
}

// ── PEDIDOS ──

export async function getAdminOrders() {
  const restaurant = await getAdminRestaurant();
  if (!restaurant) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.restaurantId, restaurant.id))
    .orderBy(desc(orders.createdAt));
}

export async function getAdminOrderDetail(orderId: string) {
  const restaurant = await getAdminRestaurant();
  if (!restaurant) return null;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.restaurantId, restaurant.id),
      ),
    )
    .limit(1);
  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      dishId: orderItems.dishId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      observations: orderItems.observations,
      dishName: dishes.name,
    })
    .from(orderItems)
    .leftJoin(dishes, eq(orderItems.dishId, dishes.id))
    .where(eq(orderItems.orderId, orderId));

  const [cliente] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, order.clienteId))
    .limit(1);

  const statusLogs = await db
    .select()
    .from(orderStatusLog)
    .where(eq(orderStatusLog.orderId, orderId))
    .orderBy(orderStatusLog.changedAt);

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  return { order, items, cliente, statusLogs, payment };
}

export async function acceptOrder(orderId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.restaurantId, restaurant.id),
        eq(orders.status, "RECIBIDO"),
      ),
    )
    .limit(1);
  if (!order) throw new Error("Pedido no encontrado o ya procesado");

  const [updated] = await db
    .update(orders)
    .set({ status: "ACEPTADO", updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusLog).values({
    orderId,
    previousStatus: "RECIBIDO",
    newStatus: "ACEPTADO",
    changedBy: session.user.id,
  });

  await db.insert(notifications).values({
    userId: order.clienteId,
    type: "PEDIDO_ACEPTADO" as any,
    title: "Pedido aceptado",
    message: "Tu pedido ha sido aceptado por el restaurante. Ya puedes realizar el pago.",
    relatedOrderId: orderId,
  });

  return updated;
}

export async function rejectOrder(orderId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.restaurantId, restaurant.id),
        eq(orders.status, "RECIBIDO"),
      ),
    )
    .limit(1);
  if (!order) throw new Error("Pedido no encontrado o ya procesado");

  const [updated] = await db
    .update(orders)
    .set({ status: "CANCELADO", updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusLog).values({
    orderId,
    previousStatus: "RECIBIDO",
    newStatus: "CANCELADO",
    changedBy: session.user.id,
  });

  await db.insert(notifications).values({
    userId: order.clienteId,
    type: "PEDIDO_CANCELADO" as any,
    title: "Pedido cancelado",
    message: "Tu pedido fue cancelado por el restaurante.",
    relatedOrderId: orderId,
  });

  return updated;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
) {
  updateOrderStatusSchema.parse({ newStatus });
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  const restaurant = await getAdminRestaurant();
  if (!restaurant) throw new Error("No tienes un restaurante registrado");

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.restaurantId, restaurant.id),
      ),
    )
    .limit(1);
  if (!order) throw new Error("Pedido no encontrado");

  const previousStatus = order.status as OrderStatus;
  const validTransitions: Record<string, OrderStatus[]> = {
    RECIBIDO: [],
    ACEPTADO: ["CANCELADO"],
    EN_PREPARACION: ["CANCELADO"],
    EN_CAMINO: ["ENTREGADO", "CANCELADO"],
    ENTREGADO: [],
    CANCELADO: [],
  };

  if (!validTransitions[previousStatus]?.includes(newStatus)) {
    throw new Error(
      `No se puede cambiar de ${previousStatus} a ${newStatus}`,
    );
  }

  const [updated] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusLog).values({
    orderId,
    previousStatus,
    newStatus,
    changedBy: session.user.id,
  });

  const notificationTypes: Record<string, string> = {
    EN_PREPARACION: "PEDIDO_EN_PREPARACION",
    EN_CAMINO: "PEDIDO_EN_CAMINO",
    ENTREGADO: "PEDIDO_ENTREGADO",
    CANCELADO: "PEDIDO_CANCELADO",
  };

  if (notificationTypes[newStatus]) {
    const labels: Record<string, string> = {
      EN_PREPARACION: "en preparación",
      EN_CAMINO: "en camino",
      ENTREGADO: "entregado",
      CANCELADO: "cancelado",
    };
    await db.insert(notifications).values({
      userId: order.clienteId,
      type: notificationTypes[newStatus] as any,
      title: `Pedido ${labels[newStatus]}`,
      message: `Tu pedido ha sido actualizado a: ${labels[newStatus]}`,
      relatedOrderId: orderId,
    });
  }

  return updated;
}
