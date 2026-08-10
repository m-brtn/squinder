CREATE TYPE "public"."alcohol" AS ENUM('no', 'socially', 'regularly');--> statement-breakpoint
CREATE TYPE "public"."kids" AS ENUM('have', 'maybe', 'no', 'dont_want');--> statement-breakpoint
CREATE TYPE "public"."pets" AS ENUM('have', 'want', 'no', 'dont_want');--> statement-breakpoint
CREATE TYPE "public"."smoking" AS ENUM('no', 'sometimes', 'yes');--> statement-breakpoint
CREATE TYPE "public"."workouts" AS ENUM('no', 'rarely', 'often');--> statement-breakpoint
CREATE TABLE "interests" (
	"slug" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persona_interests" (
	"persona_id" uuid NOT NULL,
	"interest_slug" text NOT NULL,
	CONSTRAINT "persona_interests_persona_id_interest_slug_pk" PRIMARY KEY("persona_id","interest_slug")
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seed_key" text,
	"name" varchar(80) NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"birth_date" date NOT NULL,
	"gender" "gender" NOT NULL,
	"interested_in" "looking_for" DEFAULT 'everyone' NOT NULL,
	"smoking" "smoking" DEFAULT 'no' NOT NULL,
	"alcohol" "alcohol" DEFAULT 'no' NOT NULL,
	"workouts" "workouts" DEFAULT 'no' NOT NULL,
	"pets" "pets" DEFAULT 'no' NOT NULL,
	"kids" "kids" DEFAULT 'no' NOT NULL,
	"country" varchar(80) DEFAULT '' NOT NULL,
	"city" varchar(80) DEFAULT '' NOT NULL,
	"photo_urls" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personas_seed_key_unique" UNIQUE("seed_key")
);
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"user_id" uuid NOT NULL,
	"interest_slug" text NOT NULL,
	CONSTRAINT "user_interests_user_id_interest_slug_pk" PRIMARY KEY("user_id","interest_slug")
);
--> statement-breakpoint
ALTER TABLE "persona_interests" ADD CONSTRAINT "persona_interests_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_interests" ADD CONSTRAINT "persona_interests_interest_slug_interests_slug_fk" FOREIGN KEY ("interest_slug") REFERENCES "public"."interests"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_slug_interests_slug_fk" FOREIGN KEY ("interest_slug") REFERENCES "public"."interests"("slug") ON DELETE cascade ON UPDATE no action;