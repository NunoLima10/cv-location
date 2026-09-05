import { sql } from 'drizzle-orm';
import {
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { nameNormalizedColumn } from './_shared';

export const countries = pgTable(
  'countries',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 2 }).notNull(),
    level: integer('level').default(1).notNull(),
    lat: doublePrecision('lat').notNull(),
    long: doublePrecision('long').notNull(),
    nameNormalized: nameNormalizedColumn(),
  },
  (t) => [
    index('countries_name_normalized_trgm_idx').using(
      'gin',
      sql`${t.nameNormalized} gin_trgm_ops`,
    ),
  ],
);
