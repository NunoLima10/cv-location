import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { zones } from './zones';

export const places = pgTable('places', {
  id: serial('id').primaryKey(),
  zoneId: integer('zone_id')
    .notNull()
    .references(() => zones.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  level: integer('level').default(6).notNull(),
});

export const placesRelations = relations(places, ({ one }) => ({
  zone: one(zones, {
    fields: [places.zoneId],
    references: [zones.id],
  }),
}));
