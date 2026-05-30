ALTER TABLE "users" ADD COLUMN "email_verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_expires" timestamp;