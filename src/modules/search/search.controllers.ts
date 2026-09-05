import { buildPaginationMeta } from '@/shared/schemas';
import { FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SearchRequest } from './search.schemas';
import { searchServices } from './search.services';

async function search(req: SearchRequest, reply: FastifyReply) {
  const { q, limit, offset, level } = req.query;

  const { result, total } = await searchServices.search(
    req.db,
    q,
    limit,
    offset,
    level,
  );

  return reply.code(StatusCodes.OK).send({
    data: result,
    meta: buildPaginationMeta(total, limit, offset, result.length),
  });
}

export const searchControllers = {
  search,
};
