import { config } from '@/config';
import { routeErrorResponses } from '@/plugins/error.handler';
import {
  paramExamples,
  searchResponseExample,
  searchResultExample,
} from '@/shared/examples';
import { metadataSchema, querystringSchema } from '@/shared/schemas';
import { FastifyRequest } from 'fastify';
import z from 'zod';

export const LOCATION_LEVELS = [1, 2, 3, 4, 5, 6] as const;

const searchResult = z
  .object({
    id: z
      .number()
      .describe('Surrogate primary key of the matched row.')
      .meta({ example: searchResultExample.id }),
    name: z
      .string()
      .describe('Location name that matched.')
      .meta({ example: searchResultExample.name }),
    code: z
      .string()
      .describe('Stable code of the matched location.')
      .meta({ example: searchResultExample.code }),
    level: z
      .number()
      .describe('Hierarchy depth of the match (1 country … 6 place).')
      .meta({ example: searchResultExample.level }),
    type: z
      .enum(['country', 'island', 'municipality', 'parish', 'zone', 'place'])
      .describe('Entity kind, derived from `level`.')
      .meta({ example: searchResultExample.type }),
    parentId: z
      .number()
      .nullable()
      .describe('`id` of the immediate parent, or null for the country.')
      .meta({ example: searchResultExample.parentId }),
    score: z
      .number()
      .describe('Trigram similarity score; higher is a closer match.')
      .meta({ example: searchResultExample.score }),
  })
  .meta({
    id: 'SearchResult',
    description: 'A single ranked hit from a cross-level text search.',
  });

export const searchQuerystring = querystringSchema.extend({
  q: z
    .string()
    .trim()
    .min(2, 'O parâmetro `q` deve ter no mínimo 2 caracteres')
    .max(100)
    .describe(
      'Search text, 2–100 characters. Accent-insensitive; matched with ' +
        'trigram similarity across all levels.',
    )
    .meta({ example: paramExamples.searchQuery }),
  level: z.coerce
    .number()
    .int()
    .refine(
      (v): v is (typeof LOCATION_LEVELS)[number] =>
        (LOCATION_LEVELS as readonly number[]).includes(v),
      'O parâmetro `level` deve estar entre 1 e 6',
    )
    .optional()
    .describe('Restrict results to a single hierarchy level (1–6).')
    .meta({ example: paramExamples.searchLevel }),
});

export const search = {
  tags: ['search'],
  summary: 'Search locations by text',
  description:
    'Fuzzy, accent-insensitive search across every hierarchy level, ranked by ' +
    'trigram similarity. Optionally narrow to one `level`. Paginated with ' +
    '`limit` / `offset`.',
  operationId: 'searchLocations',
  hide: !config.docsEnabled,
  querystring: searchQuerystring,
  response: {
    200: z
      .object({
        data: z.array(searchResult),
        meta: metadataSchema,
      })
      .meta({ example: searchResponseExample }),
    ...routeErrorResponses,
  },
};

export type SearchRequest = FastifyRequest<{
  Querystring: z.infer<typeof searchQuerystring>;
}>;
