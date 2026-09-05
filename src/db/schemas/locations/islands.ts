import {
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';
import { countries } from './countries';
import { nameNormalizedColumn } from './_shared';

export const islands = pgTable(
  'islands',
  {
    id: serial('id').primaryKey(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countries.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 3 }).notNull(),
    level: integer('level').default(2).notNull(),
    lat: doublePrecision('lat').notNull(),
    long: doublePrecision('long').notNull(),
    nameNormalized: nameNormalizedColumn(),
  },
  (t) => [
    index('islands_name_normalized_trgm_idx').using(
      'gin',
      sql`${t.nameNormalized} gin_trgm_ops`,
    ),
  ],
);

export const islandsRelations = relations(islands, ({ one }) => ({
  country: one(countries, {
    fields: [islands.countryId],
    references: [countries.id],
  }),
}));
