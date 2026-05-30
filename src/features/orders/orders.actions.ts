"use server";

import { eq, like, and, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import {
  restaurants,
  dishes,
  orders,
  orderItems,
  payments,
  notifications,
  orderStatusLog,
  addresses,
  users,
} from "../../../drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { createOrderSchema } from "@/lib/validations";

export async function getRestaurants(search?: string, category?: string) {
  const conditions = [sql`${restaurants.deletedAt} IS NULL`];

  if (search) {
    conditions.push(
      sql`(${like(restaurants.name, `%${search}%`)} OR ${like(restaurants.description, `%${search}%`)})`,
    );
  }
  if (category) {
    conditions.push(eq(restaurants.category, category));
  }

  return db
    .select()
    .from(restaurants)
    .where(and(...conditions))
    .orderBy(desc(restaurants.avgRating));
}

export async function getRestaurantCategories() {
  const result = await db
    .select({ category: restaurants.category })
    .from(restaurants)
    .where(sql`${restaurants.deletedAt} IS NULL`)
    .groupBy(restaurants.category);
  return result.map((r) => r.category);
}

export async function getRestaurantById(id: string) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, id), sql`${restaurants.deletedAt} IS NULL`))
    .limit(1);
  return restaurant ?? null;
}

export async function getDishesByRestaurant(restaurantId: string) {
  return db
    .select()
    .from(dishes)
    .where(
      and(
        eq(dishes.restaurantId, restaurantId),
        eq(dishes.isActive, true),
        sql`${dishes.deletedAt} IS NULL`,
      ),
    )
    .orderBy(dishes.price);
}

export async function getUserAddresses() {
  const session = await auth();
  if (!session?.user) return [];
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id))
    .orderBy(desc(addresses.isDefault));
}

export async function createOrder(formData: {
  restaurantId: string;
  items: { dishId: string; quantity: number; unitPrice: string; observations: string }[];
  total: string;
  deliveryAddress: string;
  observations?: string;
  paymentMethod: "TARJETA" | "PSE";
}) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  createOrderSchema.parse(formData);

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(
      and(
        eq(restaurants.id, formData.restaurantId),
        sql`${restaurants.deletedAt} IS NULL`,
      ),
    )
    .limit(1);

  if (!restaurant) throw new Error("Restaurante no encontrado");
  if (!restaurant.isOpen) throw new Error("El restaurante no está recibiendo pedidos");

  const [order] = await db
    .insert(orders)
    .values({
      clienteId: session.user.id,
      restaurantId: formData.restaurantId,
      status: "RECIBIDO",
      total: formData.total,
      deliveryAddress: formData.deliveryAddress,
      observations: formData.observations,
    })
    .returning();

  await db.insert(orderItems).values(
    formData.items.map((item) => ({
      orderId: order.id,
      dishId: item.dishId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: (
        Number(item.unitPrice) * item.quantity
      ).toString(),
      observations: item.observations || null,
    })),
  );

  await db.insert(orderStatusLog).values({
    orderId: order.id,
    previousStatus: null,
    newStatus: "RECIBIDO",
    changedBy: session.user.id,
  });

  // Notificación al admin del restaurante
  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, restaurant.adminId))
    .limit(1);

  if (adminUser) {
    await db.insert(notifications).values({
      userId: adminUser.id,
      type: "PEDIDO_RECIBIDO",
      title: "Nuevo pedido",
      message: `Tienes un nuevo pedido para ${restaurant.name}.`,
      relatedOrderId: order.id,
    });
  }

  // Notificación al cliente
  await db.insert(notifications).values({
    userId: session.user.id,
    type: "PEDIDO_RECIBIDO",
    title: "Pedido registrado",
    message: "Tu pedido ha sido registrado. Espera la confirmación del restaurante.",
    relatedOrderId: order.id,
  });

  return order;
}

export async function payOrder(orderId: string, paymentMethod: "TARJETA" | "PSE") {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.clienteId, session.user.id)))
    .limit(1);

  if (!order) throw new Error("Pedido no encontrado");
  if (order.status !== "ACEPTADO") throw new Error("El pedido no está listo para pago");

  const purchaseToken = crypto.randomUUID();

  await db.insert(payments).values({
    orderId: order.id,
    method: paymentMethod,
    status: "completado",
    transactionRef: `txn_mock_${Date.now()}`,
  });

  await db
    .update(orders)
    .set({
      status: "EN_PREPARACION",
      purchaseToken,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusLog).values({
    orderId: order.id,
    previousStatus: "ACEPTADO",
    newStatus: "EN_PREPARACION",
    changedBy: session.user.id,
  });

  // Notificación al admin
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, order.restaurantId))
    .limit(1);

  if (restaurant) {
    await db.insert(notifications).values({
      userId: restaurant.adminId,
      type: "PEDIDO_PAGADO",
      title: "Pedido pagado",
      message: `El pedido #${order.id.slice(0, 8)} ha sido pagado y está listo para reparto.`,
      relatedOrderId: order.id,
    });
  }

  // Notificar a todos los repartidores
  const repartidores = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.role, "repartidor" as any),
        sql`${users.deletedAt} IS NULL`,
      ),
    );

  for (const rep of repartidores) {
    await db.insert(notifications).values({
      userId: rep.id,
      type: "PEDIDO_PAGADO",
      title: "Nuevo pedido disponible",
      message: `Hay un nuevo pedido listo para reparto en ${restaurant?.name ?? "el restaurante"}.`,
      relatedOrderId: order.id,
    });
  }

  return { ...order, status: "EN_PREPARACION", purchaseToken };
}

export async function getUserOrders() {
  const session = await auth();
  if (!session?.user) return [];

  const rows = await db
    .select({
      id: orders.id,
      clienteId: orders.clienteId,
      restaurantId: orders.restaurantId,
      repartidorId: orders.repartidorId,
      status: orders.status,
      total: orders.total,
      deliveryAddress: orders.deliveryAddress,
      addressLat: orders.addressLat,
      addressLng: orders.addressLng,
      observations: orders.observations,
      purchaseToken: orders.purchaseToken,
      estimatedDelivery: orders.estimatedDelivery,
      cancellationReason: orders.cancellationReason,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      itemCount: sql<number>`(
        SELECT COUNT(*) FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id}
      )`,
    })
    .from(orders)
    .where(eq(orders.clienteId, session.user.id))
    .orderBy(desc(orders.createdAt));

  return rows as any;
}

export async function getOrderById(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.id, id), eq(orders.clienteId, session.user.id)),
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
    .where(eq(orderItems.orderId, id));

  const [restaurant] = await db
    .select({ name: restaurants.name, category: restaurants.category })
    .from(restaurants)
    .where(eq(restaurants.id, order.restaurantId))
    .limit(1);

  const statusLogs = await db
    .select()
    .from(orderStatusLog)
    .where(eq(orderStatusLog.orderId, id))
    .orderBy(orderStatusLog.changedAt);

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, id))
    .limit(1);

  return { order, items, restaurant, statusLogs, payment };
}
