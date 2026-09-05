CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
	RETURNS text
	LANGUAGE sql
	IMMUTABLE PARALLEL SAFE STRICT
	AS $$ SELECT unaccent('unaccent', $1) $$;--> statement-breakpoint
ALTER TABLE "countries" ADD COLUMN "name_normalized" text GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "islands" ADD COLUMN "name_normalized" text GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "municipalities" ADD COLUMN "name_normalized" text GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "parishes" ADD COLUMN "name_normalized" text GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "zones" ADD COLUMN "name_normalized" text GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "name_normalized" text GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED NOT NULL;--> statement-breakpoint
CREATE INDEX "countries_name_normalized_trgm_idx" ON "countries" USING gin ("name_normalized" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "islands_name_normalized_trgm_idx" ON "islands" USING gin ("name_normalized" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "municipalities_name_normalized_trgm_idx" ON "municipalities" USING gin ("name_normalized" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "parishes_name_normalized_trgm_idx" ON "parishes" USING gin ("name_normalized" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "zones_name_normalized_trgm_idx" ON "zones" USING gin ("name_normalized" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "places_name_normalized_trgm_idx" ON "places" USING gin ("name_normalized" gin_trgm_ops);