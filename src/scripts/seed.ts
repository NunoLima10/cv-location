import { config } from '@/config';
import { setupDB } from '@/db';
import { runSeeding } from '@/db/seeds';
import { logger } from '@/utils/logger';

async function main() {
  try {
    const { db, dbClient } = await setupDB(config.DATABASE_URL, {
      seeding: true,
    });

    await runSeeding(db);

    await dbClient.end();
    logger.info('Seeding finished successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Seeding failed');
    process.exit(1);
  }
}

main();
