CREATE TYPE "public"."notification_type" AS ENUM('PEDIDO_RECIBIDO', 'PEDIDO_EN_PREPARACION', 'PEDIDO_ASIGNADO_REPARTIDOR', 'PEDIDO_EN_CAMINO', 'PEDIDO_ENTREGADO', 'PEDIDO_CANCELADO', 'PAGO_CONFIRMADO', 'PAGO_FALLIDO');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('RECIBIDO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('TARJETA', 'PSE');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pendiente', 'completado', 'fallido');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('cliente', 'admin', 'repartidor');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(100),
	"address" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"related_order_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"dish_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"observations" varchar(150)
);
--> statement-breakpoint
CREATE TABLE "order_status_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"previous_status" "order_status",
	"new_status" "order_status" NOT NULL,
	"changed_by" uuid NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"repartidor_id" uuid,
	"status" "order_status" DEFAULT 'RECIBIDO' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"delivery_address" text NOT NULL,
	"address_lat" numeric(10, 7),
	"address_lng" numeric(10, 7),
	"observations" text,
	"estimated_delivery" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pendiente' NOT NULL,
	"transaction_ref" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "repartidor_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repartidor_id" uuid NOT NULL,
	"is_available" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repartidor_availability_repartidor_id_unique" UNIQUE("repartidor_id")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(80) NOT NULL,
	"logo_url" text,
	"cover_url" text,
	"is_open" boolean DEFAULT true,
	"address" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"avg_rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"min_order" numeric(10, 2) DEFAULT '0' NOT NULL,
	"estimated_time" integer DEFAULT 30 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(20),
	"role" "user_role" DEFAULT 'cliente' NOT NULL,
	"email_verified" boolean DEFAULT false,
	"notifications_enabled" boolean DEFAULT true,
	"avatar_url" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_order_id_orders_id_fk" FOREIGN KEY ("related_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_log" ADD CONSTRAINT "order_status_log_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_log" ADD CONSTRAINT "order_status_log_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cliente_id_users_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_repartidor_id_users_id_fk" FOREIGN KEY ("repartidor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repartidor_availability" ADD CONSTRAINT "repartidor_availability_repartidor_id_users_id_fk" FOREIGN KEY ("repartidor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_cliente_id_users_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_addresses_user" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dishes_restaurant" ON "dishes" USING btree ("restaurant_id","is_active") WHERE "dishes"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_dishes_price" ON "dishes" USING btree ("price") WHERE "dishes"."is_active" = true AND "dishes"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id","is_read","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_notifications_order" ON "notifications" USING btree ("related_order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_log_order" ON "order_status_log" USING btree ("order_id","changed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_orders_cliente" ON "orders" USING btree ("cliente_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_orders_restaurant" ON "orders" USING btree ("restaurant_id","status");--> statement-breakpoint
CREATE INDEX "idx_orders_repartidor" ON "orders" USING btree ("repartidor_id","status");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_orders_date" ON "orders" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_payments_order" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_repartidor_availability_user" ON "repartidor_availability" USING btree ("repartidor_id");--> statement-breakpoint
CREATE INDEX "idx_restaurants_admin" ON "restaurants" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_restaurants_category" ON "restaurants" USING btree ("category","is_open") WHERE "restaurants"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_restaurants_rating" ON "restaurants" USING btree ("avg_rating" DESC NULLS LAST,"is_open") WHERE "restaurants"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_reviews_restaurant" ON "reviews" USING btree ("restaurant_id","rating");--> statement-breakpoint
CREATE INDEX "idx_reviews_cliente" ON "reviews" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email") WHERE "users"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");