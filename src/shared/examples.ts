/**
 * Single source of truth for the example values shown in the OpenAPI docs
 * (Swagger UI "Example Value" panels). Kept in one place so the payloads stay
 * consistent across endpoints and easy to refresh when the seed data changes.
 *
 * Values mirror real rows from `src/db/seeds/data/*.json`.
 */

export const countryExample = {
  id: 1,
  name: 'Cabo Verde',
  code: 'CV',
  level: 1,
  lat: 15.884841,
  long: -24.115387,
} as const;

export const islandExample = {
  id: 1,
  countryId: 1,
  name: 'Santo Antão',
  code: 'CV1',
  level: 2,
  lat: 17.086252,
  long: -25.152696,
} as const;

export const municipalityExample = {
  id: 1,
  islandId: 1,
  name: 'Ribeira Grande',
  code: 'CV111',
  level: 3,
  lat: 17.144901,
  long: -25.130309,
} as const;

export const parishExample = {
  id: 1,
  municipalityId: 1,
  name: 'N. S. Rosario',
  code: 'CV111111',
  level: 4,
} as const;

export const zoneExample = {
  id: 1,
  parishId: 1,
  name: 'Xoxo',
  code: 'CV11111111103',
  level: 5,
} as const;

export const placeExample = {
  id: 1,
  zoneId: 1,
  name: 'Faja de Cima',
  code: 'CV111111111011110105',
  level: 6,
} as const;

/** `GET /v1/locations/stats` payload. Counts come from `pnpm seeds:count`. */
export const locationStatsExample = {
  total: 4040,
  countries: 1,
  islands: 9,
  municipalities: 22,
  parishes: 32,
  zones: 441,
  places: 3535,
} as const;

/** One ranked hit from `GET /v1/locations/search`. */
export const searchResultExample = {
  id: 42,
  name: 'Praia',
  code: 'CV711101',
  level: 4,
  type: 'parish',
  parentId: 7,
  score: 0.83,
} as const;

/** Pagination envelope returned with every list response. */
export const paginationMetaExample = {
  total: 22,
  limit: 20,
  offset: 0,
  hasMore: true,
} as const;

/** Error envelope. `status` mirrors the HTTP status code. */
export const errorResponseExample = {
  status: '404',
  message: 'Recurso não encontrado',
  code: 'FST_NOT_FOUND',
} as const;

/** Scalar examples for shared query/path parameters. */
export const paramExamples = {
  code: 'CV111',
  limit: 20,
  offset: 0,
  parentId: 1,
  searchQuery: 'praia',
  searchLevel: 4,
} as const;

/** `data`-wrapped single-resource response example, keyed by level. */
export const dataExamples = {
  country: { data: countryExample },
  island: { data: islandExample },
  municipality: { data: municipalityExample },
  parish: { data: parishExample },
  zone: { data: zoneExample },
  place: { data: placeExample },
  stats: { data: locationStatsExample },
  locationByCode: { data: { type: 'municipality', ...municipalityExample } },
} as const;

/** `GET /v1/locations/search` full response example. */
export const searchResponseExample = {
  data: [searchResultExample],
  meta: { total: 1, limit: 20, offset: 0, hasMore: false },
} as const;
