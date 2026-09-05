import { DB } from '@/db';
import { places, zones } from '@/db/schemas';
import values from '@/db/seeds/data/places.json';
import { logger } from '@/utils/logger';
import { eq } from 'drizzle-orm';

async function getZonessId(db: DB, zoneCode: string): Promise<number> {
  const foundisland = await db
    .select()
    .from(zones)
    .where(eq(zones.code, zoneCode));

  if (foundisland.length === 0) throw Error('Zona foi  não encontrado');

  return foundisland[0].id;
}

export default async function seed(db: DB) {
  const data = await db.query.places.findMany();
  if (data.length !== 0) return;

  const zoneLevel = values[0].level;
  let currentZoneCode = values[0].code.slice(0, zoneLevel + 7);
  let zoneId: number | null = null;

  const placesValues = await Promise.all(
    values.map(async (palces) => {
      const islandCode = palces.code.slice(0, zoneLevel + 7);

      if (!zoneId) {
        zoneId = await getZonessId(db, currentZoneCode);
      }

      if (currentZoneCode === islandCode) {
        return {
          ...palces,
          zoneId: zoneId,
        };
      }
      currentZoneCode = islandCode;
      zoneId = await getZonessId(db, islandCode);

      return {
        ...palces,
        zoneId: zoneId,
      };
    }),
  );

  await db.insert(places).values(placesValues);

  logger.info('Lugares  inseridos');
}
