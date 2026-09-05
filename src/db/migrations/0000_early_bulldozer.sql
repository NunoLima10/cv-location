CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(2) NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"lat" double precision NOT NULL,
	"long" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "islands" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(3) NOT NULL,
	"level" integer DEFAULT 2 NOT NULL,
	"lat" double precision NOT NULL,
	"long" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "municipalities" (
	"id" serial PRIMARY KEY NOT NULL,
	"island_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(5) NOT NULL,
	"level" integer DEFAULT 3 NOT NULL,
	"lat" double precision NOT NULL,
	"long" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parishes" (
	"id" serial PRIMARY KEY NOT NULL,
	"municipality_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(8) NOT NULL,
	"level" integer DEFAULT 4 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"parish_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(14) NOT NULL,
	"level" integer DEFAULT 5 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" serial PRIMARY KEY NOT NULL,
	"zone_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	"level" integer DEFAULT 6 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "islands" ADD CONSTRAINT "islands_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_island_id_islands_id_fk" FOREIGN KEY ("island_id") REFERENCES "public"."islands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parishes" ADD CONSTRAINT "parishes_municipality_id_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zones" ADD CONSTRAINT "zones_parish_id_parishes_id_fk" FOREIGN KEY ("parish_id") REFERENCES "public"."parishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE cascade ON UPDATE no action;