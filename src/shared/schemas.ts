import z from 'zod';

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
    .default(DEFAULT_PAGE_LIMIT),
  offset: z.coerce
    .number()
    .int()
    .min(0, 'O parâmetro `offset` deve ser um número não negativo')
    .default(0),
});

export const metadataSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
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
