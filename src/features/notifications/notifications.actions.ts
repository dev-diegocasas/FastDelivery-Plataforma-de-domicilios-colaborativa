"use server";

import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { auth } from "@/lib/auth/auth";
import { notifications } from "../../../drizzle/schema";

export async function getUserNotifications(limit = 50) {
  const session = await auth();
  if (!session?.user) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user) return 0;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false),
      ),
    );

  return Number(result?.count ?? 0);
}

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id),
      ),
    );
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false),
      ),
    );
}

export async function getRecentNotifications(limit = 5) {
  const session = await auth();
  if (!session?.user) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}
