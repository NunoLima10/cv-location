import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { islands } from './islands';

export const municipalities = pgTable('municipalities', {
  id: serial('id').primaryKey(),
  islandId: integer('island_id')
    .notNull()
    .references(() => islands.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 5 }).notNull(),
  level: integer('level').default(3).notNull(),
  lat: doublePrecision('lat').notNull(),
  long: doublePrecision('long').notNull(),
});

export const municipalitiesRelations = relations(municipalities, ({ one }) => ({
  island: one(islands, {
    fields: [municipalities.islandId],
    references: [islands.id],
  }),
}));
