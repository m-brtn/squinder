CREATE TYPE "public"."looking_for" AS ENUM('male', 'female', 'everyone');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "looking_for" "looking_for" DEFAULT 'everyone' NOT NULL;