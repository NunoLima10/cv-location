import { FastifyInstance, FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import z from 'zod';

import { config } from '@/config';
import { locationsRoutes } from '@/modules/locations/locations.routes';
import { searchRoutes } from '@/modules/search/search.routes';

const healthcheckSchema = {
  tags: ['system'],
  summary: 'Liveness probe',
  description: 'Returns `200` with a static body while the process is running.',
  operationId: 'healthcheck',
  hide: !config.docsEnabled,
  response: {
    200: z
      .object({ status: z.string().meta({ example: 'ok' }) })
      .meta({ example: { status: 'ok' } }),
  },
};

async function registerAllRoutes(server: FastifyInstance) {
  await server.register(locationsRoutes, { prefix: '/v1' });
  await server.register(searchRoutes, { prefix: '/v1/locations' });

  server.get(
    '/',
    { schema: { hide: true } },
    async (_, reply: FastifyReply) => {
      if (config.docsEnabled) return reply.redirect('/docs');
      return reply.send({ status: 'ok' });
    },
  );

  server.get(
    '/healthcheck',
    { schema: healthcheckSchema },
    async (_, reply) => {
      reply.send({ status: 'ok' });
    },
  );
}

export const registerRoutes = fastifyPlugin(registerAllRoutes);
