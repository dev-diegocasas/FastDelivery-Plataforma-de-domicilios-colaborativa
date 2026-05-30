import "dotenv/config";
import { eq, and, sql, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/connection";
import { users, restaurants, dishes, orders, orderStatusLog } from "../drizzle/schema";

async function cleanOrphanData() {
  console.log("1. Limpiando pedidos con repartidor asignado (EN_CAMINO)...");
  const orphanOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "EN_CAMINO"),
        sql`${orders.repartidorId} IS NOT NULL`,
      ),
    );

  for (const order of orphanOrders) {
    console.log(`  → Reiniciando pedido #${order.id.slice(0, 8)} (repartidor: ${order.repartidorId!.slice(0, 8)})`);
    await db
      .update(orders)
      .set({
        status: "EN_PREPARACION",
        repartidorId: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
  }
  console.log(`  ${orphanOrders.length} pedido(s) reiniciado(s).`);

  console.log("\n2. Buscando restaurantes con admin eliminado...");
  const deletedAdmins = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.role, "admin"),
        sql`${users.deletedAt} IS NOT NULL`,
      ),
    );

  const adminIds = deletedAdmins.map((a) => a.id);

  if (adminIds.length > 0) {
    const orphanRestaurants = await db
      .select()
      .from(restaurants)
      .where(
        and(
          inArray(restaurants.adminId, adminIds),
          sql`${restaurants.deletedAt} IS NULL`,
        ),
      );

    for (const r of orphanRestaurants) {
      console.log(`  → Eliminando restaurante "${r.name}" (admin eliminado)`);
      // Soft-delete dishes
      await db
        .update(dishes)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(dishes.restaurantId, r.id));
      // Soft-delete restaurant
      await db
        .update(restaurants)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(restaurants.id, r.id));
    }
    console.log(`  ${orphanRestaurants.length} restaurante(s) eliminado(s).`);
  } else {
    console.log("  No hay admins eliminados.");
  }

  // Specifically find "Casa Real" by name
  console.log("\n3. Buscando restaurante 'Casa Real'...");
  const [casaReal] = await db
    .select()
    .from(restaurants)
    .where(
      and(
        sql`LOWER(${restaurants.name}) LIKE '%casa real%'`,
        sql`${restaurants.deletedAt} IS NULL`,
      ),
    )
    .limit(1);

  if (casaReal) {
    console.log(`  → Eliminando "${casaReal.name}" (id: ${casaReal.id.slice(0, 8)})`);
    await db
      .update(dishes)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(dishes.restaurantId, casaReal.id));
    await db
      .update(restaurants)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(restaurants.id, casaReal.id));
    console.log("  Eliminado.");
  } else {
    console.log("  No encontrado.");
  }

  console.log("\n✅ Limpieza completada.");
  process.exit(0);
}

cleanOrphanData().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
