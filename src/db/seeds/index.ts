import { logger } from '@/utils/logger';
import { DB } from '@/db';
import seedCountries from '@/db/seeds/locations/countries';
import seedIslands from '@/db/seeds/locations/islands';
import seedMunicipalities from '@/db/seeds/locations/municipalities';
import seedParishes from '@/db/seeds/locations/parishes';
import seedZones from '@/db/seeds/locations/zones';
import seedPlaces from '@/db/seeds/locations/places';

export async function runSeeding(db: DB) {
  logger.info('Seeding started');

  await seedCountries(db);
  await seedIslands(db);
  await seedMunicipalities(db);
  await seedParishes(db);
  await seedZones(db);
  await seedPlaces(db);

  logger.info('Seeding finished');
}
