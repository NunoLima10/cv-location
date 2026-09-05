import z from 'zod';
import { paginationMetaExample, paramExamples } from '@/shared/examples';

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const querystringSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, 'O parâmetro `limit` deve ser no mínimo 1')
    .max(
      MAX_PAGE_LIMIT,
      `O parâmetro \`limit\` deve ser no máximo ${MAX_PAGE_LIMIT}`,
    )
    .default(DEFAULT_PAGE_LIMIT)
    .describe(
      `Maximum number of rows to return (1–${MAX_PAGE_LIMIT}). Defaults to ${DEFAULT_PAGE_LIMIT}.`,
    )
    .meta({ example: paramExamples.limit }),
  offset: z.coerce
    .number()
    .int()
    .min(0, 'O parâmetro `offset` deve ser um número não negativo')
    .default(0)
    .describe(
      'Number of rows to skip before collecting the page. Defaults to 0.',
    )
    .meta({ example: paramExamples.offset }),
});

export const metadataSchema = z
  .object({
    total: z
      .number()
      .describe('Total rows matching the query, ignoring pagination.')
      .meta({ example: paginationMetaExample.total }),
    limit: z
      .number()
      .describe('The `limit` that was applied to this response.')
      .meta({ example: paginationMetaExample.limit }),
    offset: z
      .number()
      .describe('The `offset` that was applied to this response.')
      .meta({ example: paginationMetaExample.offset }),
    hasMore: z
      .boolean()
      .describe('True when further rows exist beyond this page.')
      .meta({ example: paginationMetaExample.hasMore }),
  })
  .meta({
    id: 'PaginationMeta',
    description: 'Pagination envelope returned alongside every list response.',
  });

export const codeParamSchema = z.object({
  code: z
    .string()
    .min(1)
    .describe(
      'Stable location code. Case-sensitive; length grows with the level ' +
        '(`CV` country … `CV111111111011110101` place).',
    )
    .meta({ example: paramExamples.code }),
});

export function buildPaginationMeta(
  total: number,
  limit: number,
  offset: number,
  resultCount: number,
) {
  return {
    total,
    limit,
    offset,
    hasMore: offset + resultCount < total,
  };
}
