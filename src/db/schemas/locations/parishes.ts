import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { municipalities } from './municipalities';
import { relations } from 'drizzle-orm';

export const parishes = pgTable('parishes', {
  id: serial('id').primaryKey(),
  municipalityId: integer('municipality_id')
    .notNull()
    .references(() => municipalities.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 8 }).notNull(),
  level: integer('level').default(4).notNull(),
});

export const parishesRelations = relations(parishes, ({ one }) => ({
  municipality: one(municipalities, {
    fields: [parishes.municipalityId],
    references: [municipalities.id],
  }),
}));
