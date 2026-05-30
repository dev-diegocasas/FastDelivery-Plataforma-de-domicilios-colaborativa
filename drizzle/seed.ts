import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import * as schema from "../drizzle/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  // ── LIMPIAR DATOS EXISTENTES ──
  await db.delete(schema.notifications);
  await db.delete(schema.orderStatusLog);
  await db.delete(schema.reviews);
  await db.delete(schema.payments);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.repartidorAvailability);
  await db.delete(schema.addresses);
  await db.delete(schema.dishes);
  await db.delete(schema.restaurants);
  await db.delete(schema.users);

  const password = (pw: string) => hashSync(pw, 10);

  // ── USUARIOS ──
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@fastdelivery.com",
      passwordHash: password("admin123"),
      name: "Carlos Restrepo",
      phone: "3001112233",
      role: "admin",
      emailVerified: true,
    })
    .returning();

  const [repartidor] = await db
    .insert(schema.users)
    .values({
      email: "repartidor@fastdelivery.com",
      passwordHash: password("repartidor123"),
      name: "Pedro Martínez",
      phone: "3004445566",
      role: "repartidor",
      emailVerified: true,
    })
    .returning();

  const [cliente1] = await db
    .insert(schema.users)
    .values({
      email: "cliente@fastdelivery.com",
      passwordHash: password("cliente123"),
      name: "Ana García",
      phone: "3007778899",
      role: "cliente",
      emailVerified: true,
    })
    .returning();

  const [cliente2] = await db
    .insert(schema.users)
    .values({
      email: "maria@email.com",
      passwordHash: password("cliente123"),
      name: "María López",
      phone: "3000001122",
      role: "cliente",
      emailVerified: true,
    })
    .returning();

  console.log("✅ 4 usuarios creados");

  // ── DIRECCIONES ──
  await db.insert(schema.addresses).values([
    {
      userId: cliente1.id,
      label: "Casa",
      address: "Carrera 15 # 80-20, Bogotá",
      lat: "4.6683000",
      lng: "-74.0588000",
      isDefault: true,
    },
    {
      userId: cliente1.id,
      label: "Oficina",
      address: "Calle 100 # 11-45, Bogotá",
      lat: "4.6913000",
      lng: "-74.0486000",
      isDefault: false,
    },
    {
      userId: cliente2.id,
      label: "Casa",
      address: "Avenida 68 # 53-10, Bogotá",
      lat: "4.6479000",
      lng: "-74.0917000",
      isDefault: true,
    },
  ]);

  console.log("✅ 3 direcciones creadas");

  // ── RESTAURANTES ──
  const [restaurant1] = await db
    .insert(schema.restaurants)
    .values({
      adminId: admin.id,
      name: "Burger House",
      description:
        "Las mejores hamburguesas artesanales de la ciudad, con ingredientes frescos y pan artesanal.",
      category: "Hamburguesas",
      isOpen: true,
      address: "Calle 85 # 15-20, Bogotá",
      lat: "4.6722000",
      lng: "-74.0550000",
      avgRating: "4.5",
      minOrder: "15000",
      estimatedTime: 30,
    })
    .returning();

  const [restaurant2] = await db
    .insert(schema.restaurants)
    .values({
      adminId: admin.id,
      name: "Pizza Roma",
      description:
        "Auténtica pizza italiana horneada en horno de leña, con ingredientes importados.",
      category: "Pizza",
      isOpen: true,
      address: "Carrera 7 # 45-30, Bogotá",
      lat: "4.6201000",
      lng: "-74.0687000",
      avgRating: "4.2",
      minOrder: "20000",
      estimatedTime: 40,
    })
    .returning();

  const [restaurant3] = await db
    .insert(schema.restaurants)
    .values({
      adminId: admin.id,
      name: "Sushi Bar",
      description:
        "Sushi fresco preparado al instante. Rolls, nigiris y combinaciones especiales.",
      category: "Sushi",
      isOpen: true,
      address: "Calle 93 # 12-40, Bogotá",
      lat: "4.6805000",
      lng: "-74.0509000",
      avgRating: "4.7",
      minOrder: "25000",
      estimatedTime: 35,
    })
    .returning();

  console.log("✅ 3 restaurantes creados");

  // ── PLATOS ──
  await db.insert(schema.dishes).values([
    // Burger House
    {
      restaurantId: restaurant1.id,
      name: "Clásica Burger",
      description:
        "Carne 180g, queso cheddar, lechuga, tomate y cebolla caramelizada.",
      price: "18500",
      isActive: true,
    },
    {
      restaurantId: restaurant1.id,
      name: "Doble Queso Burger",
      description:
        "Doble carne 180g, doble queso, tocino ahumado y salsa BBQ.",
      price: "24500",
      isActive: true,
    },
    {
      restaurantId: restaurant1.id,
      name: "Burger Pollo Crispy",
      description:
        "Pechuga de pollo empanizada, queso suizo y mayonesa de chipotle.",
      price: "20500",
      isActive: true,
    },
    {
      restaurantId: restaurant1.id,
      name: "Papas Fritas Grandes",
      description: "Papas fritas crujientes con sal marina.",
      price: "8500",
      isActive: true,
    },
    {
      restaurantId: restaurant1.id,
      name: "Malteada de Vainilla",
      description: "Malteada cremosa de vainilla con crema batida.",
      price: "12000",
      isActive: true,
    },
    // Pizza Roma
    {
      restaurantId: restaurant2.id,
      name: "Pizza Margherita",
      description: "Tomate, mozzarella fresca, albahaca y aceite de oliva.",
      price: "32000",
      isActive: true,
    },
    {
      restaurantId: restaurant2.id,
      name: "Pizza Pepperoni",
      description:
        "Pepperoni clásico con queso mozzarella y salsa de tomate.",
      price: "35000",
      isActive: true,
    },
    {
      restaurantId: restaurant2.id,
      name: "Pizza Vegetariana",
      description:
        "Pimientos, champiñones, cebolla, aceitunas y espinaca.",
      price: "34000",
      isActive: true,
    },
    {
      restaurantId: restaurant2.id,
      name: "Alitas BBQ",
      description:
        "Alitas de pollo bañadas en salsa BBQ ahumada (6 unidades).",
      price: "22000",
      isActive: true,
    },
    {
      restaurantId: restaurant2.id,
      name: "Breadsticks con Queso",
      description: "Palitos de pan con queso derretido y salsa marinara.",
      price: "15000",
      isActive: true,
    },
    // Sushi Bar
    {
      restaurantId: restaurant3.id,
      name: "California Roll",
      description:
        "Cangrejo, aguacate, pepino y masago. 8 piezas.",
      price: "28000",
      isActive: true,
    },
    {
      restaurantId: restaurant3.id,
      name: "Dragon Roll",
      description:
        "Tempura de camarón, aguacate, queso crema y salsa anguila.",
      price: "35000",
      isActive: true,
    },
    {
      restaurantId: restaurant3.id,
      name: "Nigiri Salmón",
      description:
        "3 piezas de salmón fresco sobre arroz de sushi.",
      price: "22000",
      isActive: true,
    },
    {
      restaurantId: restaurant3.id,
      name: "Edamame",
      description: "Vainas de soja al vapor con sal marina.",
      price: "12000",
      isActive: true,
    },
    {
      restaurantId: restaurant3.id,
      name: "Té Verde",
      description: "Té verde japonés caliente o frío.",
      price: "6000",
      isActive: true,
    },
  ]);

  console.log("✅ 15 platos creados");

  // ── DISPONIBILIDAD REPARTIDOR ──
  await db.insert(schema.repartidorAvailability).values({
    repartidorId: repartidor.id,
    isAvailable: true,
  });

  console.log("✅ Disponibilidad de repartidor creada");

  // ── CONSULTAR PLATOS POR RESTAURANTE ──
  const r1Dishes = await db
    .select()
    .from(schema.dishes)
    .where(eq(schema.dishes.restaurantId, restaurant1.id));

  const r2Dishes = await db
    .select()
    .from(schema.dishes)
    .where(eq(schema.dishes.restaurantId, restaurant2.id));

  // ── PEDIDO 1: ENTREGADO ──
  const [order1] = await db
    .insert(schema.orders)
    .values({
      clienteId: cliente1.id,
      restaurantId: restaurant1.id,
      repartidorId: repartidor.id,
      status: "ENTREGADO",
      total: "35500",
      deliveryAddress: "Carrera 15 # 80-20, Bogotá",
      observations: "Sin cebolla por favor",
    })
    .returning();

  await db.insert(schema.orderItems).values([
    {
      orderId: order1.id,
      dishId: r1Dishes[0].id,
      quantity: 1,
      unitPrice: "18500",
      subtotal: "18500",
    },
    {
      orderId: order1.id,
      dishId: r1Dishes[3].id,
      quantity: 1,
      unitPrice: "8500",
      subtotal: "8500",
    },
    {
      orderId: order1.id,
      dishId: r1Dishes[4].id,
      quantity: 1,
      unitPrice: "8500",
      subtotal: "8500",
    },
  ]);

  await db.insert(schema.payments).values({
    orderId: order1.id,
    method: "TARJETA",
    status: "completado",
    transactionRef: "txn_mock_001",
  });

  await db.insert(schema.reviews).values({
    orderId: order1.id,
    clienteId: cliente1.id,
    restaurantId: restaurant1.id,
    rating: 5,
    comment: "Excelente hamburguesa, llegó rápido y bien empaquetada.",
  });

  await db.insert(schema.orderStatusLog).values([
    {
      orderId: order1.id,
      previousStatus: null,
      newStatus: "RECIBIDO",
      changedBy: cliente1.id,
    },
    {
      orderId: order1.id,
      previousStatus: "RECIBIDO",
      newStatus: "EN_PREPARACION",
      changedBy: admin.id,
    },
    {
      orderId: order1.id,
      previousStatus: "EN_PREPARACION",
      newStatus: "EN_CAMINO",
      changedBy: repartidor.id,
    },
    {
      orderId: order1.id,
      previousStatus: "EN_CAMINO",
      newStatus: "ENTREGADO",
      changedBy: repartidor.id,
    },
  ]);

  await db.insert(schema.notifications).values([
    {
      userId: cliente1.id,
      type: "PEDIDO_RECIBIDO",
      title: "Pedido recibido",
      message: "Tu pedido en Burger House ha sido recibido.",
      relatedOrderId: order1.id,
    },
    {
      userId: cliente1.id,
      type: "PEDIDO_EN_PREPARACION",
      title: "Pedido en preparación",
      message: "Tu pedido en Burger House ya está siendo preparado.",
      relatedOrderId: order1.id,
    },
    {
      userId: cliente1.id,
      type: "PEDIDO_ASIGNADO_REPARTIDOR",
      title: "Repartidor asignado",
      message: "Pedro Martínez recogerá tu pedido.",
      relatedOrderId: order1.id,
    },
    {
      userId: cliente1.id,
      type: "PEDIDO_EN_CAMINO",
      title: "Pedido en camino",
      message: "Tu pedido está en camino. Llegará pronto.",
      relatedOrderId: order1.id,
    },
    {
      userId: cliente1.id,
      type: "PEDIDO_ENTREGADO",
      title: "Pedido entregado",
      message:
        "Tu pedido de Burger House ha sido entregado. ¡Disfruta!",
      relatedOrderId: order1.id,
    },
    {
      userId: admin.id,
      type: "PEDIDO_RECIBIDO",
      title: "Nuevo pedido",
      message: "Nuevo pedido recibido en Burger House.",
      relatedOrderId: order1.id,
    },
  ]);

  console.log("✅ Pedido #1 (ENTREGADO) creado con items, reseña y notificaciones");

  // ── PEDIDO 2: EN CURSO (EN_PREPARACION) ──
  const [order2] = await db
    .insert(schema.orders)
    .values({
      clienteId: cliente1.id,
      restaurantId: restaurant2.id,
      status: "EN_PREPARACION",
      total: "47000",
      deliveryAddress: "Carrera 15 # 80-20, Bogotá",
      estimatedDelivery: new Date(Date.now() + 40 * 60 * 1000),
    })
    .returning();

  await db.insert(schema.orderItems).values([
    {
      orderId: order2.id,
      dishId: r2Dishes[0].id,
      quantity: 1,
      unitPrice: "32000",
      subtotal: "32000",
    },
    {
      orderId: order2.id,
      dishId: r2Dishes[4].id,
      quantity: 1,
      unitPrice: "15000",
      subtotal: "15000",
    },
  ]);

  await db.insert(schema.payments).values({
    orderId: order2.id,
    method: "PSE",
    status: "completado",
    transactionRef: "txn_mock_002",
  });

  await db.insert(schema.orderStatusLog).values([
    {
      orderId: order2.id,
      previousStatus: null,
      newStatus: "RECIBIDO",
      changedBy: cliente1.id,
    },
    {
      orderId: order2.id,
      previousStatus: "RECIBIDO",
      newStatus: "EN_PREPARACION",
      changedBy: admin.id,
    },
  ]);

  await db.insert(schema.notifications).values([
    {
      userId: cliente1.id,
      type: "PEDIDO_RECIBIDO",
      title: "Pedido recibido",
      message: "Tu pedido en Pizza Roma ha sido recibido.",
      relatedOrderId: order2.id,
    },
    {
      userId: admin.id,
      type: "PEDIDO_RECIBIDO",
      title: "Nuevo pedido",
      message: "Nuevo pedido recibido en Pizza Roma.",
      relatedOrderId: order2.id,
    },
  ]);

  console.log("✅ Pedido #2 (EN_PREPARACION) creado");

  console.log("\n═══════════════════════════════════════════════");
  console.log("  🌟  SEED COMPLETADO EXITOSAMENTE");
  console.log("═══════════════════════════════════════════════\n");
  console.log("  USUARIOS DE PRUEBA:");
  console.log("  ─────────────────────");
  console.log("  Admin:      admin@fastdelivery.com / admin123");
  console.log("  Repartidor: repartidor@fastdelivery.com / repartidor123");
  console.log("  Cliente:    cliente@fastdelivery.com / cliente123");
  console.log("  Cliente:    maria@email.com / cliente123");
  console.log("");
}

seed().catch((err) => {
  console.error("Error ejecutando seed:", err);
  process.exit(1);
});
