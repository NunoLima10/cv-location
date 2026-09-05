import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

/**
 * Lowercased, accent-stripped copy of `name`, maintained by Postgres.
 * Backed by a `pg_trgm` GIN index on each table for fast fuzzy / substring
 * search. `immutable_unaccent` is created in migration `0001` (drizzle-kit
 * cannot emit `CREATE EXTENSION` / `CREATE FUNCTION`).
 */
export const nameNormalizedColumn = () =>
  text('name_normalized')
    .notNull()
    .generatedAlwaysAs(sql`immutable_unaccent(lower(name))`);
