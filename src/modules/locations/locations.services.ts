import { DB } from '@/db';
import {
  countries,
  islands,
  municipalities,
  parishes,
  places,
  zones,
} from '@/db/schemas';
import { errorResolver } from '@/utils/error-resolver';
import { count, eq, SQL } from 'drizzle-orm';

async function listCountries(db: DB, limit: number, offset: number) {
  const [result, [{ count: total }]] = await Promise.all([
    db.query.countries.findMany({ limit, offset }),
    db.select({ count: count() }).from(countries),
  ]);

  return { result, total };
}

async function getCountryByCode(db: DB, code: string) {
  return db.query.countries.findFirst({ where: eq(countries.code, code) });
}

/**
 * Resolves a bare code (e.g. `CV11111111101`) to its location, regardless of
 * level. Queries every table in parallel and returns the first match, tagged
 * with its `type` so the caller can tell what it got.
 */
async function getLocationByCode(db: DB, code: string) {
  const [country, island, municipality, parish, zone, place] = await Promise.all(
    [
      db.query.countries.findFirst({ where: eq(countries.code, code) }),
      db.query.islands.findFirst({ where: eq(islands.code, code) }),
      db.query.municipalities.findFirst({
        where: eq(municipalities.code, code),
      }),
      db.query.parishes.findFirst({ where: eq(parishes.code, code) }),
      db.query.zones.findFirst({ where: eq(zones.code, code) }),
      db.query.places.findFirst({ where: eq(places.code, code) }),
    ],
  );

  if (country) return { type: 'country' as const, ...country };
  if (island) return { type: 'island' as const, ...island };
  if (municipality) return { type: 'municipality' as const, ...municipality };
  if (parish) return { type: 'parish' as const, ...parish };
  if (zone) return { type: 'zone' as const, ...zone };
  if (place) return { type: 'place' as const, ...place };

  return undefined;
}

async function listIslands(
  db: DB,
  limit: number,
  offset: number,
  countryId?: number,
) {
  const where: SQL | undefined = countryId
    ? eq(islands.countryId, countryId)
    : undefined;

  const [result, [{ count: total }]] = await Promise.all([
    db.query.islands.findMany({ where, limit, offset }),
    db.select({ count: count() }).from(islands).where(where),
  ]);

  return { result, total };
}

async function getIslandByCode(db: DB, code: string) {
  return db.query.islands.findFirst({ where: eq(islands.code, code) });
}

async function listMunicipalities(
  db: DB,
  limit: number,
  offset: number,
  islandId?: number,
) {
  const where: SQL | undefined = islandId
    ? eq(municipalities.islandId, islandId)
    : undefined;

  const [result, [{ count: total }]] = await Promise.all([
    db.query.municipalities.findMany({ where, limit, offset }),
    db.select({ count: count() }).from(municipalities).where(where),
  ]);

  return { result, total };
}

async function getMunicipalityByCode(db: DB, code: string) {
  return db.query.municipalities.findFirst({
    where: eq(municipalities.code, code),
  });
}

async function listParishes(
  db: DB,
  limit: number,
  offset: number,
  municipalityId?: number,
) {
  const where: SQL | undefined = municipalityId
    ? eq(parishes.municipalityId, municipalityId)
    : undefined;

  const [result, [{ count: total }]] = await Promise.all([
    db.query.parishes.findMany({ where, limit, offset }),
    db.select({ count: count() }).from(parishes).where(where),
  ]);

  return { result, total };
}

async function getParishByCode(db: DB, code: string) {
  return db.query.parishes.findFirst({ where: eq(parishes.code, code) });
}

async function listZones(
  db: DB,
  limit: number,
  offset: number,
  parishId?: number,
) {
  const where: SQL | undefined = parishId
    ? eq(zones.parishId, parishId)
    : undefined;

  const [result, [{ count: total }]] = await Promise.all([
    db.query.zones.findMany({ where, limit, offset }),
    db.select({ count: count() }).from(zones).where(where),
  ]);

  return { result, total };
}

async function getZoneByCode(db: DB, code: string) {
  return db.query.zones.findFirst({ where: eq(zones.code, code) });
}

async function listPlaces(
  db: DB,
  limit: number,
  offset: number,
  zoneId?: number,
) {
  const where: SQL | undefined = zoneId
    ? eq(places.zoneId, zoneId)
    : undefined;

  const [result, [{ count: total }]] = await Promise.all([
    db.query.places.findMany({ where, limit, offset }),
    db.select({ count: count() }).from(places).where(where),
  ]);

  return { result, total };
}

async function getPlaceByCode(db: DB, code: string) {
  return db.query.places.findFirst({ where: eq(places.code, code) });
}

export const locationsServices = {
  listCountries: errorResolver(listCountries, 'locationsServices.listCountries'),
  getLocationByCode: errorResolver(
    getLocationByCode,
    'locationsServices.getLocationByCode',
  ),
  getCountryByCode: errorResolver(
    getCountryByCode,
    'locationsServices.getCountryByCode',
  ),
  listIslands: errorResolver(listIslands, 'locationsServices.listIslands'),
  getIslandByCode: errorResolver(
    getIslandByCode,
    'locationsServices.getIslandByCode',
  ),
  listMunicipalities: errorResolver(
    listMunicipalities,
    'locationsServices.listMunicipalities',
  ),
  getMunicipalityByCode: errorResolver(
    getMunicipalityByCode,
    'locationsServices.getMunicipalityByCode',
  ),
  listParishes: errorResolver(listParishes, 'locationsServices.listParishes'),
  getParishByCode: errorResolver(
    getParishByCode,
    'locationsServices.getParishByCode',
  ),
  listZones: errorResolver(listZones, 'locationsServices.listZones'),
  getZoneByCode: errorResolver(getZoneByCode, 'locationsServices.getZoneByCode'),
  listPlaces: errorResolver(listPlaces, 'locationsServices.listPlaces'),
  getPlaceByCode: errorResolver(
    getPlaceByCode,
    'locationsServices.getPlaceByCode',
  ),
};
