import "dotenv/config";
import { hashSync } from "bcryptjs";
import { db } from "../src/lib/db/connection";
import {
  orderRejections,
  orderStatusLog,
  orderItems,
  payments,
  reviews,
  notifications,
  orders,
  dishes,
  addresses,
  repartidorAvailability,
  restaurants,
  users,
} from "../drizzle/schema";

const PASSWORD = "123456";

async function seed() {
  console.log("🗑️  Eliminando datos existentes...");
  await db.delete(orderRejections);
  await db.delete(orderStatusLog);
  await db.delete(orderItems);
  await db.delete(payments);
  await db.delete(reviews);
  await db.delete(notifications);
  await db.delete(orders);
  await db.delete(dishes);
  await db.delete(addresses);
  await db.delete(repartidorAvailability);
  await db.delete(restaurants);
  await db.delete(users);
  console.log("✅  Datos eliminados.\n");

  // ── USUARIO ADMIN ──
  console.log("👤  Creando admin: alejandrocasas102@gmail.com");
  const [admin] = await db
    .insert(users)
    .values({
      email: "alejandrocasas102@gmail.com",
      passwordHash: hashSync(PASSWORD, 10),
      name: "Alejandro Casas",
      phone: "3001234567",
      role: "admin",
      emailVerified: true,
      notificationsEnabled: true,
    })
    .returning();
  console.log(`    ✅ Admin creado (id: ${admin.id.slice(0, 8)})`);

  // ── RESTAURANTE + PLATOS ──
  console.log("\n🏪  Creando restaurante 'Burger House'...");
  const [restaurant] = await db
    .insert(restaurants)
    .values({
      adminId: admin.id,
      name: "Burger House",
      description: "Las mejores hamburguesas artesanales de la ciudad. Carne 100% de res, ingredientes frescos y pan artesanal.",
      category: "Hamburguesas",
      address: "Carrera 15 # 85-20, Bogotá",
      isOpen: true,
      minOrder: "15000",
      estimatedTime: 30,
      avgRating: "0",
    })
    .returning();
  console.log(`    ✅ Restaurante creado (id: ${restaurant.id.slice(0, 8)})`);

  const dishList = [
    { name: "Clásica Burger", description: "Carne angus 150g, queso cheddar, lechuga, tomate y cebolla caramelizada.", price: "18500", isActive: true },
    { name: "BBQ Burger", description: "Carne angus 150g, queso ahumado, aros de cebolla y salsa BBQ casera.", price: "22000", isActive: true },
    { name: "Crispy Chicken", description: "Pechuga de pollo empanizada, lechuga, tomate y mayonesa de la casa.", price: "16500", isActive: true },
    { name: "Doble Queso", description: "Doble carne angus 200g, doble queso, pepinillos y salsa especial.", price: "26000", isActive: true },
    { name: "Papas Cheddar", description: "Papas crujientes bañadas en queso cheddar y tocineta.", price: "12000", isActive: true },
  ];

  for (const dish of dishList) {
    await db.insert(dishes).values({
      restaurantId: restaurant.id,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      isActive: dish.isActive,
    });
  }
  console.log(`    ✅ ${dishList.length} platos creados`);

  // ── USUARIO REPARTIDOR ──
  console.log("\n👤  Creando repartidor: aa.rcdev@gmail.com");
  const [repartidor] = await db
    .insert(users)
    .values({
      email: "aa.rcdev@gmail.com",
      passwordHash: hashSync(PASSWORD, 10),
      name: "Andrés Rincón",
      phone: "3109876543",
      role: "repartidor",
      emailVerified: true,
      notificationsEnabled: true,
    })
    .returning();
  console.log(`    ✅ Repartidor creado (id: ${repartidor.id.slice(0, 8)})`);

  // ── USUARIO CLIENTE ──
  console.log("\n👤  Creando cliente: pepereyez785@gmail.com");
  const [cliente] = await db
    .insert(users)
    .values({
      email: "pepereyez785@gmail.com",
      passwordHash: hashSync(PASSWORD, 10),
      name: "Pepe Reyes",
      phone: "3207654321",
      role: "cliente",
      emailVerified: true,
      notificationsEnabled: true,
    })
    .returning();
  console.log(`    ✅ Cliente creado (id: ${cliente.id.slice(0, 8)})`);

  console.log("\n═══════════════════════════════════════");
  console.log("✅  SEED COMPLETADO");
  console.log("═══════════════════════════════════════");
  console.log("");
  console.log("📋  CREDENCIALES:");
  console.log(`   Admin:      alejandrocasas102@gmail.com / ${PASSWORD}`);
  console.log(`   Repartidor: aa.rcdev@gmail.com / ${PASSWORD}`);
  console.log(`   Cliente:    pepereyez785@gmail.com / ${PASSWORD}`);
  console.log("");
  console.log("📦  DATOS CREADOS:");
  console.log(`   Restaurante: Burger House (${dishList.length} platos)`);
  console.log("   Pedidos:     0");
  console.log("═══════════════════════════════════════");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
