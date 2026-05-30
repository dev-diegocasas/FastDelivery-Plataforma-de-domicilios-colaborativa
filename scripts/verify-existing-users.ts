import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/connection";
import { users } from "../drizzle/schema";

async function verifyExistingUsers() {
  const result = await db
    .update(users)
    .set({ emailVerified: true })
    .where(sql`${users.deletedAt} IS NULL`);

  console.log("All existing users marked as verified.");
  process.exit(0);
}

verifyExistingUsers().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
