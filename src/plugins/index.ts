import { config } from '@/config';
import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';

import cors from '@/plugins/cors';
import customErrorHandler from '@/plugins/error.handler';
import swagger from '@/plugins/swagger';

async function registerAllPlugins(server: FastifyInstance) {
  await server.register(sensible);

  await server.register(rateLimit, {
    max: config.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: config.RATE_LIMIT_TIME_WINDOW,
  });

  await server.register(cors, {
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    origin: config.ALLOWED_ORIGINS,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  });

  await server.register(customErrorHandler);

  await server.register(swagger, {
    title: 'CV Location API',
    description: 'API for Cape Verde location lookup data',
    version: '0.1.0',
    host: config.HOST,
    port: config.PORT,
    path: '/docs',
  });
}

export const registerPlugins = fastifyPlugin(registerAllPlugins);
