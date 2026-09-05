import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { countries } from './countries';

export const islands = pgTable('islands', {
  id: serial('id').primaryKey(),
  countryId: integer('country_id')
    .notNull()
    .references(() => countries.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 3 }).notNull(),
  level: integer('level').default(2).notNull(),
  lat: doublePrecision('lat').notNull(),
  long: doublePrecision('long').notNull(),
});

export const islandsRelations = relations(islands, ({ one }) => ({
  country: one(countries, {
    fields: [islands.countryId],
    references: [countries.id],
  }),
}));
