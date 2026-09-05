import { DB } from '@/db';
import { countries, islands } from '@/db/schemas';
import values from '@/db/seeds/data/islands.json';
import { logger } from '@/utils/logger';
import { eq } from 'drizzle-orm';

export default async function seed(db: DB) {
  const data = await db.query.islands.findMany();

  if (data.length !== 0) return;

  const islandCode = values[0].code;
  const islandLevel = values[0].level;
  const countryCode = islandCode.slice(0, islandLevel);

  const foundCountry = await db
    .select()
    .from(countries)
    .where(eq(countries.code, countryCode));

  if (foundCountry.length === 0) throw Error('Countries not found');

  const islandsMap = values.map((island) => {
    return {
      ...island,
      countryId: foundCountry[0].id,
    };
  });

  await db.insert(islands).values(islandsMap);

  logger.info('Islands seeded successfully.');
}
