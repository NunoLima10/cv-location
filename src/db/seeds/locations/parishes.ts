import { DB } from '@/db';
import { municipalities, parishes } from '@/db/schemas';
import values from '@/db/seeds/data/parish.json';
import { logger } from '@/utils/logger';
import { eq } from 'drizzle-orm';

async function getMunicipalityId(
  db: DB,
  municipalityCode: string,
): Promise<number> {
  const foundisland = await db
    .select()
    .from(municipalities)
    .where(eq(municipalities.code, municipalityCode));

  if (foundisland.length === 0) throw Error('Municipio foi  não encontrado');

  return foundisland[0].id;
}

export default async function seed(db: DB) {
  const data = await db.query.parishes.findMany();
  if (data.length !== 0) return;

  const parishLevel = values[0].level;
  let currentMunicipalityCode = values[0].code.slice(0, parishLevel + 1);
  let municipalityId: number | null = null;

  const parishesValues = await Promise.all(
    values.map(async (municipality) => {
      const islandCode = municipality.code.slice(0, parishLevel + 1);

      if (!municipalityId) {
        municipalityId = await getMunicipalityId(db, currentMunicipalityCode);
      }

      if (currentMunicipalityCode === islandCode) {
        return {
          ...municipality,
          municipalityId: municipalityId,
        };
      }
      currentMunicipalityCode = islandCode;
      municipalityId = await getMunicipalityId(db, islandCode);

      return {
        ...municipality,
        municipalityId: municipalityId,
      };
    }),
  );

  await db.insert(parishes).values(parishesValues);

  logger.info('Conselhos  inseridos');
}
