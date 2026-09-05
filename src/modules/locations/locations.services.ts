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
import { asc, count, eq, like, SQL } from 'drizzle-orm';
import { CODE_LENGTH_BY_LEVEL } from './locations.constants';

/** 1-based hierarchy level a code belongs to, or `null` if its length matches
 *  no level (i.e. the code is malformed). */
function levelFromCode(code: string): number | null {
  const idx = (CODE_LENGTH_BY_LEVEL as readonly number[]).indexOf(code.length);
  return idx === -1 ? null : idx + 1;
}

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
  const [country, island, municipality, parish, zone, place] =
    await Promise.all([
      db.query.countries.findFirst({ where: eq(countries.code, code) }),
      db.query.islands.findFirst({ where: eq(islands.code, code) }),
      db.query.municipalities.findFirst({
        where: eq(municipalities.code, code),
      }),
      db.query.parishes.findFirst({ where: eq(parishes.code, code) }),
      db.query.zones.findFirst({ where: eq(zones.code, code) }),
      db.query.places.findFirst({ where: eq(places.code, code) }),
    ]);

  if (country) return { type: 'country' as const, ...country };
  if (island) return { type: 'island' as const, ...island };
  if (municipality) return { type: 'municipality' as const, ...municipality };
  if (parish) return { type: 'parish' as const, ...parish };
  if (zone) return { type: 'zone' as const, ...zone };
  if (place) return { type: 'place' as const, ...place };

  return undefined;
}

/**
 * Resolves the full ancestry of `code`: the country, then every level down to
 * and including `code` itself, ordered level 1 → target. Ancestor codes are
 * derived by slicing `CODE_LENGTH_BY_LEVEL` prefixes off the front, so this is
 * six point lookups in parallel, no hierarchy traversal. Returns `null` when the
 * code is malformed or the target row is missing.
 */
async function getLocationBreadcrumb(db: DB, code: string) {
  const level = levelFromCode(code);
  if (level === null) return null;

  // A prefix per level, but only for levels at or above the target.
  const prefixAt = (idx: number) =>
    idx < level ? code.slice(0, CODE_LENGTH_BY_LEVEL[idx]) : null;

  const [p1, p2, p3, p4, p5, p6] = [0, 1, 2, 3, 4, 5].map(prefixAt);

  const [country, island, municipality, parish, zone, place] =
    await Promise.all([
      p1
        ? db.query.countries.findFirst({ where: eq(countries.code, p1) })
        : null,
      p2 ? db.query.islands.findFirst({ where: eq(islands.code, p2) }) : null,
      p3
        ? db.query.municipalities.findFirst({
            where: eq(municipalities.code, p3),
          })
        : null,
      p4 ? db.query.parishes.findFirst({ where: eq(parishes.code, p4) }) : null,
      p5 ? db.query.zones.findFirst({ where: eq(zones.code, p5) }) : null,
      p6 ? db.query.places.findFirst({ where: eq(places.code, p6) }) : null,
    ]);

  const chain = [
    country && { type: 'country' as const, ...country },
    island && { type: 'island' as const, ...island },
    municipality && { type: 'municipality' as const, ...municipality },
    parish && { type: 'parish' as const, ...parish },
    zone && { type: 'zone' as const, ...zone },
    place && { type: 'place' as const, ...place },
  ].filter((node): node is NonNullable<typeof node> => Boolean(node));

  // The target row must be the tail of the chain; otherwise `code` resolves to
  // nothing and the caller should 404.
  if (!chain.length || chain[chain.length - 1].code !== code) return null;

  return chain;
}

/** Table, ordering column and `type` tag for the children of a given level. */
const CHILD_LEVEL = {
  2: { table: islands, code: islands.code, type: 'island' as const },
  3: {
    table: municipalities,
    code: municipalities.code,
    type: 'municipality' as const,
  },
  4: { table: parishes, code: parishes.code, type: 'parish' as const },
  5: { table: zones, code: zones.code, type: 'zone' as const },
  6: { table: places, code: places.code, type: 'place' as const },
} as const;

/**
 * Lists the immediate children of `code` — the next level down, paginated. Child
 * codes are exactly those prefixed by `code`, and each level lives in its own
 * table, so a single `LIKE 'code%'` on the child table is enough. Returns `null`
 * when `code` resolves to no location, and an empty page for a level-6 place.
 */
async function getLocationChildren(
  db: DB,
  code: string,
  limit: number,
  offset: number,
) {
  const parent = await getLocationByCode(db, code);
  if (!parent) return null;

  const child = CHILD_LEVEL[(parent.level + 1) as keyof typeof CHILD_LEVEL];
  if (!child) return { result: [], total: 0 };

  const where = like(child.code, `${code}%`);

  const [rows, [{ count: total }]] = await Promise.all([
    db
      .select()
      .from(child.table)
      .where(where)
      .orderBy(asc(child.code))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(child.table).where(where),
  ]);

  return { result: rows.map((row) => ({ type: child.type, ...row })), total };
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
  const where: SQL | undefined = zoneId ? eq(places.zoneId, zoneId) : undefined;

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
  listCountries: errorResolver(
    listCountries,
    'locationsServices.listCountries',
  ),
  getLocationByCode: errorResolver(
    getLocationByCode,
    'locationsServices.getLocationByCode',
  ),
  getLocationBreadcrumb: errorResolver(
    getLocationBreadcrumb,
    'locationsServices.getLocationBreadcrumb',
  ),
  getLocationChildren: errorResolver(
    getLocationChildren,
    'locationsServices.getLocationChildren',
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
  getZoneByCode: errorResolver(
    getZoneByCode,
    'locationsServices.getZoneByCode',
  ),
  listPlaces: errorResolver(listPlaces, 'locationsServices.listPlaces'),
  getPlaceByCode: errorResolver(
    getPlaceByCode,
    'locationsServices.getPlaceByCode',
  ),
};
