import { config } from '@/config';
import { routeErrorResponses } from '@/plugins/error.handler';
import { metadataSchema, querystringSchema } from '@/shared/schemas';
import { FastifyRequest } from 'fastify';
import z from 'zod';

export const LOCATION_LEVELS = [1, 2, 3, 4, 5, 6] as const;

const searchResult = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
  type: z.enum([
    'country',
    'island',
    'municipality',
    'parish',
    'zone',
    'place',
  ]),
  parentId: z.number().nullable(),
  score: z.number(),
});

export const searchQuerystring = querystringSchema.extend({
  q: z
    .string()
    .trim()
    .min(2, 'O parâmetro `q` deve ter no mínimo 2 caracteres')
    .max(100),
  level: z.coerce
    .number()
    .int()
    .refine(
      (v): v is (typeof LOCATION_LEVELS)[number] =>
        (LOCATION_LEVELS as readonly number[]).includes(v),
      'O parâmetro `level` deve estar entre 1 e 6',
    )
    .optional(),
});

export const search = {
  tags: ['search'],
  hide: config.isProd,
  querystring: searchQuerystring,
  response: {
    200: z.object({
      data: z.array(searchResult),
      meta: metadataSchema,
    }),
    ...routeErrorResponses,
  },
};

export type SearchRequest = FastifyRequest<{
  Querystring: z.infer<typeof searchQuerystring>;
}>;
