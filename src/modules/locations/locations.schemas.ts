import { config } from '@/config';
import { routeErrorResponses } from '@/plugins/error.handler';
import {
  countryExample,
  dataExamples,
  islandExample,
  locationStatsExample,
  municipalityExample,
  parishExample,
  paramExamples,
  placeExample,
  zoneExample,
} from '@/shared/examples';
import {
  codeParamSchema,
  metadataSchema,
  querystringSchema,
} from '@/shared/schemas';
import { FastifyRequest } from 'fastify';
import z from 'zod';

const docsHidden = !config.docsEnabled;

const id = z
  .number()
  .describe('Surrogate primary key, unique within its level.')
  .meta({ example: 1 });

const name = (example: string) =>
  z
    .string()
    .describe('Official location name, in Portuguese.')
    .meta({ example });

const code = (example: string) =>
  z
    .string()
    .describe('Stable public identifier used in path parameters.')
    .meta({ example });

const level = (value: number) =>
  z
    .number()
    .describe(
      'Hierarchy depth: 1 country, 2 island, 3 municipality, 4 parish, 5 zone, 6 place.',
    )
    .meta({ example: value });

const lat = (example: number) =>
  z.number().describe('Latitude in decimal degrees (WGS84).').meta({ example });

const long = (example: number) =>
  z
    .number()
    .describe('Longitude in decimal degrees (WGS84).')
    .meta({ example });

const parentId = (label: string, example: number) =>
  z
    .number()
    .describe(`\`id\` of the parent ${label} this entity belongs to.`)
    .meta({ example });

const country = z
  .object({
    id,
    name: name(countryExample.name),
    code: code(countryExample.code),
    level: level(countryExample.level),
    lat: lat(countryExample.lat),
    long: long(countryExample.long),
  })
  .meta({ id: 'Country', description: 'A level-1 country.' });

const island = z
  .object({
    id,
    countryId: parentId('country', islandExample.countryId),
    name: name(islandExample.name),
    code: code(islandExample.code),
    level: level(islandExample.level),
    lat: lat(islandExample.lat),
    long: long(islandExample.long),
  })
  .meta({ id: 'Island', description: 'A level-2 island.' });

const municipality = z
  .object({
    id,
    islandId: parentId('island', municipalityExample.islandId),
    name: name(municipalityExample.name),
    code: code(municipalityExample.code),
    level: level(municipalityExample.level),
    lat: lat(municipalityExample.lat),
    long: long(municipalityExample.long),
  })
  .meta({
    id: 'Municipality',
    description: 'A level-3 municipality (concelho).',
  });

const parish = z
  .object({
    id,
    municipalityId: parentId('municipality', parishExample.municipalityId),
    name: name(parishExample.name),
    code: code(parishExample.code),
    level: level(parishExample.level),
  })
  .meta({ id: 'Parish', description: 'A level-4 civil parish (freguesia).' });

const zone = z
  .object({
    id,
    parishId: parentId('parish', zoneExample.parishId),
    name: name(zoneExample.name),
    code: code(zoneExample.code),
    level: level(zoneExample.level),
  })
  .meta({ id: 'Zone', description: 'A level-5 zone within a parish.' });

const place = z
  .object({
    id,
    zoneId: parentId('zone', placeExample.zoneId),
    name: name(placeExample.name),
    code: code(placeExample.code),
    level: level(placeExample.level),
  })
  .meta({ id: 'Place', description: 'A level-6 named place or locality.' });

const stats = z
  .object({
    total: z
      .number()
      .describe('Sum of every level below.')
      .meta({ example: locationStatsExample.total }),
    countries: z.number().meta({ example: locationStatsExample.countries }),
    islands: z.number().meta({ example: locationStatsExample.islands }),
    municipalities: z
      .number()
      .meta({ example: locationStatsExample.municipalities }),
    parishes: z.number().meta({ example: locationStatsExample.parishes }),
    zones: z.number().meta({ example: locationStatsExample.zones }),
    places: z.number().meta({ example: locationStatsExample.places }),
  })
  .meta({
    id: 'LocationStats',
    description:
      'Seed-data row counts per level. Served from static constants.',
  });

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const getLocationStats = {
  tags: ['locations'],
  summary: 'Location counts per level',
  description:
    'Returns the number of seeded rows for each hierarchy level plus a grand ' +
    'total. Served from static constants, not a live `COUNT(*)`.',
  operationId: 'getLocationStats',
  hide: docsHidden,
  response: {
    200: z.object({ data: stats }).meta({ example: dataExamples.stats }),
    ...routeErrorResponses,
  },
};

function listSchema<T extends z.ZodTypeAny, Q extends z.ZodTypeAny>(
  item: T,
  querystring: Q,
  tag: string,
) {
  return {
    tags: [tag],
    summary: `List ${tag}`,
    description:
      `Returns a paginated list of ${tag}. Use \`limit\` and \`offset\` to ` +
      `page through results; \`meta\` reports the full match count.`,
    operationId: `list${capitalize(tag)}`,
    hide: docsHidden,
    querystring,
    response: {
      200: z.object({
        data: z.array(item),
        meta: metadataSchema,
      }),
      ...routeErrorResponses,
    },
  };
}

const locationByCode = z.discriminatedUnion('type', [
  country.extend({ type: z.literal('country') }),
  island.extend({ type: z.literal('island') }),
  municipality.extend({ type: z.literal('municipality') }),
  parish.extend({ type: z.literal('parish') }),
  zone.extend({ type: z.literal('zone') }),
  place.extend({ type: z.literal('place') }),
]);

export const getLocationByCode = {
  tags: ['locations'],
  summary: 'Resolve any location by code',
  description:
    'Looks up a single location by `code` across every level. The response ' +
    '`type` field discriminates which shape was returned. Responds 404 when ' +
    'no location carries that code.',
  operationId: 'getLocationByCode',
  hide: docsHidden,
  params: codeParamSchema,
  response: {
    200: z
      .object({ data: locationByCode })
      .meta({ example: dataExamples.locationByCode }),
    ...routeErrorResponses,
  },
};

function getByCodeSchema<T extends z.ZodTypeAny>(
  item: T,
  tag: string,
  singular: string,
) {
  return {
    tags: [tag],
    summary: `Get a ${singular} by code`,
    description:
      `Resolves a single ${singular} by its \`code\`. Responds 404 when no ` +
      `${singular} carries that code.`,
    operationId: `get${capitalize(singular)}`,
    hide: docsHidden,
    params: codeParamSchema,
    response: {
      200: z.object({ data: item }),
      ...routeErrorResponses,
    },
  };
}

export const listCountries = listSchema(
  country,
  querystringSchema,
  'countries',
);
export const getCountry = getByCodeSchema(country, 'countries', 'country');

export const listIslandsQuerystring = querystringSchema.extend({
  countryId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Filter to islands whose parent country has this `id`.')
    .meta({ example: paramExamples.parentId }),
});
export const listIslands = listSchema(
  island,
  listIslandsQuerystring,
  'islands',
);
export const getIsland = getByCodeSchema(island, 'islands', 'island');

export const listMunicipalitiesQuerystring = querystringSchema.extend({
  islandId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Filter to municipalities whose parent island has this `id`.')
    .meta({ example: paramExamples.parentId }),
});
export const listMunicipalities = listSchema(
  municipality,
  listMunicipalitiesQuerystring,
  'municipalities',
);
export const getMunicipality = getByCodeSchema(
  municipality,
  'municipalities',
  'municipality',
);

export const listParishesQuerystring = querystringSchema.extend({
  municipalityId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Filter to parishes whose parent municipality has this `id`.')
    .meta({ example: paramExamples.parentId }),
});
export const listParishes = listSchema(
  parish,
  listParishesQuerystring,
  'parishes',
);
export const getParish = getByCodeSchema(parish, 'parishes', 'parish');

export const listZonesQuerystring = querystringSchema.extend({
  parishId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Filter to zones whose parent parish has this `id`.')
    .meta({ example: paramExamples.parentId }),
});
export const listZones = listSchema(zone, listZonesQuerystring, 'zones');
export const getZone = getByCodeSchema(zone, 'zones', 'zone');

export const listPlacesQuerystring = querystringSchema.extend({
  zoneId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Filter to places whose parent zone has this `id`.')
    .meta({ example: paramExamples.parentId }),
});
export const listPlaces = listSchema(place, listPlacesQuerystring, 'places');
export const getPlace = getByCodeSchema(place, 'places', 'place');

export type GetLocationByCodeRequest = FastifyRequest<{
  Params: z.infer<typeof codeParamSchema>;
}>;

export type ListCountriesRequest = FastifyRequest<{
  Querystring: z.infer<typeof listCountries.querystring>;
}>;
export type GetCountryRequest = FastifyRequest<{
  Params: z.infer<typeof getCountry.params>;
}>;

export type ListIslandsRequest = FastifyRequest<{
  Querystring: z.infer<typeof listIslandsQuerystring>;
}>;
export type GetIslandRequest = FastifyRequest<{
  Params: z.infer<typeof getIsland.params>;
}>;

export type ListMunicipalitiesRequest = FastifyRequest<{
  Querystring: z.infer<typeof listMunicipalitiesQuerystring>;
}>;
export type GetMunicipalityRequest = FastifyRequest<{
  Params: z.infer<typeof getMunicipality.params>;
}>;

export type ListParishesRequest = FastifyRequest<{
  Querystring: z.infer<typeof listParishesQuerystring>;
}>;
export type GetParishRequest = FastifyRequest<{
  Params: z.infer<typeof getParish.params>;
}>;

export type ListZonesRequest = FastifyRequest<{
  Querystring: z.infer<typeof listZonesQuerystring>;
}>;
export type GetZoneRequest = FastifyRequest<{
  Params: z.infer<typeof getZone.params>;
}>;

export type ListPlacesRequest = FastifyRequest<{
  Querystring: z.infer<typeof listPlacesQuerystring>;
}>;
export type GetPlaceRequest = FastifyRequest<{
  Params: z.infer<typeof getPlace.params>;
}>;
