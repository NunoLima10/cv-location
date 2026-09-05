import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 2 }).notNull(),
  level: integer('level').default(1).notNull(),
  lat: doublePrecision('lat').notNull(),
  long: doublePrecision('long').notNull(),
});
