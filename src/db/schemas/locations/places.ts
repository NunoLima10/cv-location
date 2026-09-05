import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { zones } from './zones';
import { nameNormalizedColumn } from './_shared';

export const places = pgTable(
  'places',
  {
    id: serial('id').primaryKey(),
    zoneId: integer('zone_id')
      .notNull()
      .references(() => zones.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    level: integer('level').default(6).notNull(),
    nameNormalized: nameNormalizedColumn(),
  },
  (t) => [
    index('places_name_normalized_trgm_idx').using(
      'gin',
      sql`${t.nameNormalized} gin_trgm_ops`,
    ),
  ],
);

export const placesRelations = relations(places, ({ one }) => ({
  zone: one(zones, {
    fields: [places.zoneId],
    references: [zones.id],
  }),
}));
