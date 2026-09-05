import { config } from '@/config';
import { routeErrorResponses } from '@/plugins/error.handler';
import { codeParamSchema, metadataSchema, querystringSchema } from '@/shared/schemas';
import { FastifyRequest } from 'fastify';
import z from 'zod';

const country = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
  lat: z.number(),
  long: z.number(),
});

const island = z.object({
  id: z.number(),
  countryId: z.number(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
  lat: z.number(),
  long: z.number(),
});

const municipality = z.object({
  id: z.number(),
  islandId: z.number(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
  lat: z.number(),
  long: z.number(),
});

const parish = z.object({
  id: z.number(),
  municipalityId: z.number(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
});

const zone = z.object({
  id: z.number(),
  parishId: z.number(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
});

const place = z.object({
  id: z.number(),
  zoneId: z.number(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
});

const stats = z.object({
  total: z.number(),
  countries: z.number(),
  islands: z.number(),
  municipalities: z.number(),
  parishes: z.number(),
  zones: z.number(),
  places: z.number(),
});

export const getLocationStats = {
  tags: ['locations'],
  hide: config.isProd,
  response: {
    200: z.object({ data: stats }),
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
    hide: config.isProd,
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
  hide: config.isProd,
  params: codeParamSchema,
  response: {
    200: z.object({ data: locationByCode }),
    ...routeErrorResponses,
  },
};

function getByCodeSchema<T extends z.ZodTypeAny>(item: T, tag: string) {
  return {
    tags: [tag],
    hide: config.isProd,
    params: codeParamSchema,
    response: {
      200: z.object({ data: item }),
      ...routeErrorResponses,
    },
  };
}

export const listCountries = listSchema(country, querystringSchema, 'countries');
export const getCountry = getByCodeSchema(country, 'countries');

export const listIslandsQuerystring = querystringSchema.extend({
  countryId: z.coerce.number().int().positive().optional(),
});
export const listIslands = listSchema(island, listIslandsQuerystring, 'islands');
export const getIsland = getByCodeSchema(island, 'islands');

export const listMunicipalitiesQuerystring = querystringSchema.extend({
  islandId: z.coerce.number().int().positive().optional(),
});
export const listMunicipalities = listSchema(
  municipality,
  listMunicipalitiesQuerystring,
  'municipalities',
);
export const getMunicipality = getByCodeSchema(municipality, 'municipalities');

export const listParishesQuerystring = querystringSchema.extend({
  municipalityId: z.coerce.number().int().positive().optional(),
});
export const listParishes = listSchema(parish, listParishesQuerystring, 'parishes');
export const getParish = getByCodeSchema(parish, 'parishes');

export const listZonesQuerystring = querystringSchema.extend({
  parishId: z.coerce.number().int().positive().optional(),
});
export const listZones = listSchema(zone, listZonesQuerystring, 'zones');
export const getZone = getByCodeSchema(zone, 'zones');

export const listPlacesQuerystring = querystringSchema.extend({
  zoneId: z.coerce.number().int().positive().optional(),
});
export const listPlaces = listSchema(place, listPlacesQuerystring, 'places');
export const getPlace = getByCodeSchema(place, 'places');

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
