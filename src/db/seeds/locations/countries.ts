import { DB } from '@/db';
import { countries } from '@/db/schemas';
import values from '@/db/seeds/data/countries.json';
import { logger } from '@/utils/logger';

export default async function seed(db: DB) {
  const data = await db.query.countries.findMany();

  if (data.length !== 0) return;

  await db.insert(countries).values(values);

  logger.info('Paises inseridos');
}
