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

async function getCountryById(db: DB, id: number) {
  return db.query.countries.findFirst({ where: eq(countries.id, id) });
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

async function getIslandById(db: DB, id: number) {
  return db.query.islands.findFirst({ where: eq(islands.id, id) });
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

async function getMunicipalityById(db: DB, id: number) {
  return db.query.municipalities.findFirst({
    where: eq(municipalities.id, id),
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

async function getParishById(db: DB, id: number) {
  return db.query.parishes.findFirst({ where: eq(parishes.id, id) });
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

async function getZoneById(db: DB, id: number) {
  return db.query.zones.findFirst({ where: eq(zones.id, id) });
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

async function getPlaceById(db: DB, id: number) {
  return db.query.places.findFirst({ where: eq(places.id, id) });
}

export const locationsServices = {
  listCountries: errorResolver(listCountries, 'locationsServices.listCountries'),
  getCountryById: errorResolver(
    getCountryById,
    'locationsServices.getCountryById',
  ),
  listIslands: errorResolver(listIslands, 'locationsServices.listIslands'),
  getIslandById: errorResolver(
    getIslandById,
    'locationsServices.getIslandById',
  ),
  listMunicipalities: errorResolver(
    listMunicipalities,
    'locationsServices.listMunicipalities',
  ),
  getMunicipalityById: errorResolver(
    getMunicipalityById,
    'locationsServices.getMunicipalityById',
  ),
  listParishes: errorResolver(listParishes, 'locationsServices.listParishes'),
  getParishById: errorResolver(
    getParishById,
    'locationsServices.getParishById',
  ),
  listZones: errorResolver(listZones, 'locationsServices.listZones'),
  getZoneById: errorResolver(getZoneById, 'locationsServices.getZoneById'),
  listPlaces: errorResolver(listPlaces, 'locationsServices.listPlaces'),
  getPlaceById: errorResolver(getPlaceById, 'locationsServices.getPlaceById'),
};
