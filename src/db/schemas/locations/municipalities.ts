import {
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';
import { islands } from './islands';
import { nameNormalizedColumn } from './_shared';

export const municipalities = pgTable(
  'municipalities',
  {
    id: serial('id').primaryKey(),
    islandId: integer('island_id')
      .notNull()
      .references(() => islands.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 5 }).notNull(),
    level: integer('level').default(3).notNull(),
    lat: doublePrecision('lat').notNull(),
    long: doublePrecision('long').notNull(),
    nameNormalized: nameNormalizedColumn(),
  },
  (t) => [
    index('municipalities_name_normalized_trgm_idx').using(
      'gin',
      sql`${t.nameNormalized} gin_trgm_ops`,
    ),
  ],
);

export const municipalitiesRelations = relations(municipalities, ({ one }) => ({
  island: one(islands, {
    fields: [municipalities.islandId],
    references: [islands.id],
  }),
}));
