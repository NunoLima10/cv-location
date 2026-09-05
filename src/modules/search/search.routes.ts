import { FastifyInstance } from 'fastify';
import { searchControllers } from './search.controllers';
import { search } from './search.schemas';

export async function searchRoutes(server: FastifyInstance) {
  server.get('/search', {
    schema: search,
    handler: searchControllers.search,
  });
}
