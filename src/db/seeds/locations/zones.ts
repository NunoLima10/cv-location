import { DB } from '@/db';
import { parishes, zones } from '@/db/schemas';
import values from '@/db/seeds/data/zones.json';
import { logger } from '@/utils/logger';
import { eq } from 'drizzle-orm';

async function getparishesId(db: DB, parishCode: string): Promise<number> {
  const foundisland = await db
    .select()
    .from(parishes)
    .where(eq(parishes.code, parishCode));

  if (foundisland.length === 0) throw Error('Consenho foi  não encontrado');

  return foundisland[0].id;
}

export default async function seed(db: DB) {
  const data = await db.query.zones.findMany();
  if (data.length !== 0) return;

  const zoneLevel = values[0].level;
  let currentParishCode = values[0].code.slice(0, zoneLevel + 3);
  let parishId: number | null = null;

  const zonesValues = await Promise.all(
    values.map(async (zone) => {
      const islandCode = zone.code.slice(0, zoneLevel + 3);

      if (!parishId) {
        parishId = await getparishesId(db, currentParishCode);
      }

      if (currentParishCode === islandCode) {
        return {
          ...zone,
          parishId: parishId,
        };
      }
      currentParishCode = islandCode;
      parishId = await getparishesId(db, islandCode);

      return {
        ...zone,
        parishId: parishId,
      };
    }),
  );

  await db.insert(zones).values(zonesValues);

  logger.info('Zonas  inseridos');
}
