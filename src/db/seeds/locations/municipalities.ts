import { DB } from '@/db';
import { islands, municipalities } from '@/db/schemas';
import values from '@/db/seeds/data/municipality.json';
import { logger } from '@/utils/logger';
import { eq } from 'drizzle-orm';

async function getIslandId(db: DB, islandCode: string): Promise<number> {
  const foundisland = await db
    .select()
    .from(islands)
    .where(eq(islands.code, islandCode));

  if (foundisland.length === 0) throw Error('Ilha foi  não encontrado');

  return foundisland[0].id;
}

export default async function seed(db: DB) {
  const data = await db.query.municipalities.findMany();

  if (data.length !== 0) return;
  const municipalityLevel = values[0].level;
  let currentIslandCode = values[0].code.slice(0, municipalityLevel);
  let islandId: number | null = null;

  const municipalitiesValues = await Promise.all(
    values.map(async (municipality) => {
      const islandCode = municipality.code.slice(0, municipalityLevel);

      if (!islandId) {
        islandId = await getIslandId(db, currentIslandCode);
      }

      if (currentIslandCode === islandCode) {
        return {
          ...municipality,
          islandId: islandId,
        };
      }
      currentIslandCode = islandCode;
      islandId = await getIslandId(db, islandCode);

      return {
        ...municipality,
        islandId: islandId,
      };
    }),
  );

  await db.insert(municipalities).values(municipalitiesValues);

  logger.info('Munnicipios inseridos');
}
