import { DB } from '@/db';
import Fastify, { FastifyInstance } from 'fastify';

import { registerPlugins } from '@/plugins';
import { registerRoutes } from '@/routes';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { loggerOptions } from './utils/logger';

declare module 'fastify' {
  interface FastifyRequest {
    db: DB;
  }
}

export async function buildServer(db: DB) {
  const server: FastifyInstance = Fastify({
    logger: loggerOptions,
  }).withTypeProvider<ZodTypeProvider>();

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.addHook('onRequest', async (req) => {
    req.db = db;
  });

  await server.register(registerPlugins);
  await server.register(registerRoutes);

  return server;
}
