ALTER TYPE "public"."notification_type" ADD VALUE 'PEDIDO_ACEPTADO' BEFORE 'PEDIDO_EN_PREPARACION';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'PEDIDO_PAGADO' BEFORE 'PEDIDO_EN_PREPARACION';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'ACEPTADO' BEFORE 'EN_PREPARACION';--> statement-breakpoint
CREATE TABLE "order_rejections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"repartidor_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "purchase_token" varchar(255);--> statement-breakpoint
ALTER TABLE "order_rejections" ADD CONSTRAINT "order_rejections_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_rejections" ADD CONSTRAINT "order_rejections_repartidor_id_users_id_fk" FOREIGN KEY ("repartidor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_order_rejections_order" ON "order_rejections" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_rejections_repartidor" ON "order_rejections" USING btree ("repartidor_id");