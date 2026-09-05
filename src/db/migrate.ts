import { config } from '@/config';
import { setupDB } from '@/db';
import { logger } from '@/utils/logger';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

export async function runMigrations() {
  const { db, dbClient } = await setupDB(config.DATABASE_URL, {
    migrating: true,
  });
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  await dbClient.end();
  logger.info('Migrations applied successfully');
}

runMigrations();
