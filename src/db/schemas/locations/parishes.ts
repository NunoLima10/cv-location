import {
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { municipalities } from './municipalities';
import { relations, sql } from 'drizzle-orm';
import { nameNormalizedColumn } from './_shared';

export const parishes = pgTable(
  'parishes',
  {
    id: serial('id').primaryKey(),
    municipalityId: integer('municipality_id')
      .notNull()
      .references(() => municipalities.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 8 }).notNull(),
    level: integer('level').default(4).notNull(),
    nameNormalized: nameNormalizedColumn(),
  },
  (t) => [
    index('parishes_name_normalized_trgm_idx').using(
      'gin',
      sql`${t.nameNormalized} gin_trgm_ops`,
    ),
  ],
);

export const parishesRelations = relations(parishes, ({ one }) => ({
  municipality: one(municipalities, {
    fields: [parishes.municipalityId],
    references: [municipalities.id],
  }),
}));
