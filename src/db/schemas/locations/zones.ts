import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { parishes } from './parishes';

export const zones = pgTable('zones', {
  id: serial('id').primaryKey(),
  parishId: integer('parish_id')
    .notNull()
    .references(() => parishes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 14 }).notNull(),
  level: integer('level').default(5).notNull(),
});

export const zonesRelations = relations(zones, ({ one }) => ({
  parish: one(parishes, {
    fields: [zones.parishId],
    references: [parishes.id],
  }),
}));
