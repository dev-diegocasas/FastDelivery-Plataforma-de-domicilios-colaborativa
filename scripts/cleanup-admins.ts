import "dotenv/config";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../src/lib/db/connection";
import { users, restaurants } from "../drizzle/schema";

async function cleanAdminsWithoutRestaurant() {
  const adminUsers = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(
      and(
        eq(users.role, "admin"),
        sql`${users.deletedAt} IS NULL`,
      ),
    );

  let deleted = 0;
  for (const admin of adminUsers) {
    const [restaurant] = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(
        and(
          eq(restaurants.adminId, admin.id),
          sql`${restaurants.deletedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!restaurant) {
      console.log(`Soft-deleting admin: ${admin.email} (${admin.id})`);
      await db
        .update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, admin.id));
      deleted++;
    }
  }

  console.log(`Done. ${deleted} admin(s) deleted.`);
  process.exit(0);
}

cleanAdminsWithoutRestaurant().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
