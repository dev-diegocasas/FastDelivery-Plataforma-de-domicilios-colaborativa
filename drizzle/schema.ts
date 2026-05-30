import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  integer,
  smallint,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════

export const userRoleEnum = pgEnum("user_role", [
  "cliente",
  "admin",
  "repartidor",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "RECIBIDO",
  "ACEPTADO",
  "EN_PREPARACION",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "TARJETA",
  "PSE",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pendiente",
  "completado",
  "fallido",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "PEDIDO_RECIBIDO",
  "PEDIDO_ACEPTADO",
  "PEDIDO_PAGADO",
  "PEDIDO_EN_PREPARACION",
  "PEDIDO_ASIGNADO_REPARTIDOR",
  "PEDIDO_EN_CAMINO",
  "PEDIDO_ENTREGADO",
  "PEDIDO_CANCELADO",
  "PAGO_CONFIRMADO",
  "PAGO_FALLIDO",
]);

// ═══════════════════════════════════════════════════════════════════
// TABLAS
// ═══════════════════════════════════════════════════════════════════

// 1. users
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    role: userRoleEnum("role").notNull().default("cliente"),
    emailVerified: boolean("email_verified").default(false),
    emailVerificationToken: varchar("email_verification_token", { length: 255 }),
    emailVerificationExpires: timestamp("email_verification_expires"),
    resetPasswordToken: varchar("reset_password_token", { length: 255 }),
    resetPasswordExpires: timestamp("reset_password_expires"),
    notificationsEnabled: boolean("notifications_enabled").default(true),
    avatarUrl: text("avatar_url"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email).where(sql`${table.deletedAt} IS NULL`),
    index("idx_users_role").on(table.role),
  ],
);

// 2. addresses
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 100 }),
    address: text("address").notNull(),
    lat: decimal("lat", { precision: 10, scale: 7 }),
    lng: decimal("lng", { precision: 10, scale: 7 }),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_addresses_user").on(table.userId)],
);

// 3. restaurants
export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 80 }).notNull(),
    logoUrl: text("logo_url"),
    coverUrl: text("cover_url"),
    isOpen: boolean("is_open").default(true),
    address: text("address").notNull(),
    lat: decimal("lat", { precision: 10, scale: 7 }),
    lng: decimal("lng", { precision: 10, scale: 7 }),
    avgRating: decimal("avg_rating", { precision: 2, scale: 1 })
      .default("0")
      .notNull(),
    minOrder: decimal("min_order", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    estimatedTime: integer("estimated_time").default(30).notNull(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_restaurants_admin").on(table.adminId),
    index("idx_restaurants_category")
      .on(table.category, table.isOpen)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_restaurants_rating")
      .on(table.avgRating.desc(), table.isOpen)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

// 4. dishes
export const dishes = pgTable(
  "dishes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 })
      .notNull(),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_dishes_restaurant")
      .on(table.restaurantId, table.isActive)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_dishes_price")
      .on(table.price)
      .where(sql`${table.isActive} = true AND ${table.deletedAt} IS NULL`),
  ],
);

// 5. orders
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => users.id),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    repartidorId: uuid("repartidor_id").references(() => users.id),
    status: orderStatusEnum("status").notNull().default("RECIBIDO"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    addressLat: decimal("address_lat", { precision: 10, scale: 7 }),
    addressLng: decimal("address_lng", { precision: 10, scale: 7 }),
    observations: text("observations"),
    purchaseToken: varchar("purchase_token", { length: 255 }),
    estimatedDelivery: timestamp("estimated_delivery"),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_orders_cliente").on(table.clienteId, table.createdAt.desc()),
    index("idx_orders_restaurant").on(table.restaurantId, table.status),
    index("idx_orders_repartidor").on(table.repartidorId, table.status),
    index("idx_orders_status").on(table.status, table.createdAt.desc()),
    index("idx_orders_date").on(table.createdAt.desc()),
  ],
);

// 6. order_items
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    dishId: uuid("dish_id")
      .notNull()
      .references(() => dishes.id),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    observations: varchar("observations", { length: 150 }),
  },
  (table) => [index("idx_order_items_order").on(table.orderId)],
);

// 7. payments
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id)
      .unique(),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").notNull().default("pendiente"),
    transactionRef: varchar("transaction_ref", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_payments_order").on(table.orderId),
    index("idx_payments_status").on(table.status),
  ],
);

// 8. reviews
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id)
      .unique(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => users.id),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_reviews_restaurant").on(table.restaurantId, table.rating),
    index("idx_reviews_cliente").on(table.clienteId),
  ],
);

// 9. order_status_log
export const orderStatusLog = pgTable(
  "order_status_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    previousStatus: orderStatusEnum("previous_status"),
    newStatus: orderStatusEnum("new_status").notNull(),
    changedBy: uuid("changed_by")
      .notNull()
      .references(() => users.id),
    changedAt: timestamp("changed_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_order_status_log_order").on(
      table.orderId,
      table.changedAt.desc(),
    ),
  ],
);

// 10. notifications
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false),
    relatedOrderId: uuid("related_order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_notifications_user").on(
      table.userId,
      table.isRead,
      table.createdAt.desc(),
    ),
    index("idx_notifications_order").on(table.relatedOrderId),
  ],
);

// 11. repartidor_availability
export const repartidorAvailability = pgTable(
  "repartidor_availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repartidorId: uuid("repartidor_id")
      .notNull()
      .references(() => users.id)
      .unique(),
    isAvailable: boolean("is_available").default(false),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_repartidor_availability_user").on(table.repartidorId),
  ],
);

// 12. order_rejections
export const orderRejections = pgTable(
  "order_rejections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    repartidorId: uuid("repartidor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_order_rejections_order").on(table.orderId),
    index("idx_order_rejections_repartidor").on(table.repartidorId),
  ],
);

// ═══════════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  restaurants: many(restaurants),
  customerOrders: many(orders, { relationName: "customerOrders" }),
  repartidorOrders: many(orders, { relationName: "repartidorOrders" }),
  reviews: many(reviews),
  notifications: many(notifications),
  availability: many(repartidorAvailability),
  statusLogs: many(orderStatusLog),
  orderRejections: many(orderRejections),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  admin: one(users, {
    fields: [restaurants.adminId],
    references: [users.id],
  }),
  dishes: many(dishes),
  orders: many(orders),
  reviews: many(reviews),
}));

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [dishes.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  cliente: one(users, {
    fields: [orders.clienteId],
    references: [users.id],
    relationName: "customerOrders",
  }),
  repartidor: one(users, {
    fields: [orders.repartidorId],
    references: [users.id],
    relationName: "repartidorOrders",
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  items: many(orderItems),
  payment: one(payments),
  review: one(reviews),
  statusLogs: many(orderStatusLog),
  notifications: many(notifications),
  orderRejections: many(orderRejections),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  dish: one(dishes, {
    fields: [orderItems.dishId],
    references: [dishes.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  cliente: one(users, {
    fields: [reviews.clienteId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [reviews.restaurantId],
    references: [restaurants.id],
  }),
}));

export const orderStatusLogRelations = relations(orderStatusLog, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusLog.orderId],
    references: [orders.id],
  }),
  changedByUser: one(users, {
    fields: [orderStatusLog.changedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedOrder: one(orders, {
    fields: [notifications.relatedOrderId],
    references: [orders.id],
  }),
}));

export const repartidorAvailabilityRelations = relations(
  repartidorAvailability,
  ({ one }) => ({
    repartidor: one(users, {
      fields: [repartidorAvailability.repartidorId],
      references: [users.id],
    }),
  }),
);

export const orderRejectionsRelations = relations(orderRejections, ({ one }) => ({
  order: one(orders, {
    fields: [orderRejections.orderId],
    references: [orders.id],
  }),
  repartidor: one(users, {
    fields: [orderRejections.repartidorId],
    references: [users.id],
  }),
}));
