import { FastifyInstance, FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import { locationsRoutes } from '@/modules/locations/locations.routes';

async function registerAllRoutes(server: FastifyInstance) {
  await server.register(locationsRoutes, { prefix: '/v1/locations' });

  server.get('/', async (_, reply: FastifyReply) => {
    reply.redirect('/docs');
  });

  server.get('/healthcheck', async (_, reply) => {
    reply.send({ status: 'ok' });
  });
}

export const registerRoutes = fastifyPlugin(registerAllRoutes);
