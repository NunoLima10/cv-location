import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from '@/db/schemas/index';
import { config } from '@/config';
import { logger } from '@/utils/logger';

type SetupDBOptions = {
  migrating?: boolean;
  seeding?: boolean;
};

export async function setupDB(
  url: string = config.DATABASE_URL,
  opts: SetupDBOptions = {},
) {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  try {
    const dbClient = postgres(url, {
      max: opts.migrating || opts.seeding ? 1 : undefined,
      onnotice: opts.seeding ? () => {} : undefined,
    });

    const db = drizzle(dbClient, {
      schema,
    });

    await db.execute(sql`SELECT 1`);
    logger.info('Database connection successful');
    return { dbClient, db };
  } catch (error) {
    logger.error(error, 'Database connection failed');
    throw error;
  }
}

export type DB = Awaited<ReturnType<typeof setupDB>>['db'];

export type DBClient = Awaited<ReturnType<typeof setupDB>>['dbClient'];

export async function teardownDB(dbClient: DBClient) {
  if (dbClient) {
    await dbClient.end();
  } else {
    console.warn('dbClient is undefined, skipping teardown.');
  }
}
