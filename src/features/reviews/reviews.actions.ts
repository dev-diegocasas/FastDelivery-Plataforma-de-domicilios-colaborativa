"use server";

import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { auth } from "@/lib/auth/auth";
import { createReviewSchema } from "@/lib/validations";
import {
  reviews,
  orders,
  restaurants,
  users,
} from "../../../drizzle/schema";

export async function getRestaurantReviews(restaurantId: string) {
  const data = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      clienteName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.clienteId, users.id))
    .where(eq(reviews.restaurantId, restaurantId))
    .orderBy(desc(reviews.createdAt))
    .limit(20);

  return data;
}

export async function checkCanReview(orderId: string) {
  const session = await auth();
  if (!session?.user) return { canReview: false, reason: "No autenticado" };

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.id, orderId), eq(orders.clienteId, session.user.id)),
    )
    .limit(1);

  if (!order) return { canReview: false, reason: "Pedido no encontrado" };
  if (order.status !== "ENTREGADO")
    return { canReview: false, reason: "El pedido aún no ha sido entregado" };

  const [existing] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.orderId, orderId))
    .limit(1);

  if (existing)
    return { canReview: false, reason: "Ya calificaste este pedido" };

  return { canReview: true, reason: null, order };
}

export async function createReview(
  orderId: string,
  rating: number,
  comment?: string,
) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  createReviewSchema.parse({ rating, comment });

  const { canReview, reason, order } = await checkCanReview(orderId);
  if (!canReview) throw new Error(reason ?? "No puedes calificar este pedido");

  const [review] = await db
    .insert(reviews)
    .values({
      orderId,
      clienteId: session.user.id,
      restaurantId: order!.restaurantId,
      rating,
      comment: comment || null,
    })
    .returning();

  const allReviews = await db
    .select({ avg: sql<number>`avg(${reviews.rating})` })
    .from(reviews)
    .where(eq(reviews.restaurantId, order!.restaurantId));

  const avgRating = allReviews[0]?.avg ?? 0;
  await db
    .update(restaurants)
    .set({ avgRating: Number(avgRating).toFixed(1) })
    .where(eq(restaurants.id, order!.restaurantId));

  return review;
}

export async function getUserReviews() {
  const session = await auth();
  if (!session?.user) return [];

  return db
    .select()
    .from(reviews)
    .where(eq(reviews.clienteId, session.user.id))
    .orderBy(desc(reviews.createdAt));
}
