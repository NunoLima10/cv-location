import { config } from '@/config';
import { DBClient, setupDB, teardownDB } from '@/db';
import { logger } from '@/utils/logger';
import { buildServer } from '@/server';
import { FastifyInstance } from 'fastify';

async function gracefulShutdown(server: FastifyInstance, dbClient: DBClient) {
  try {
    logger.info('Shutting down gracefully...');
    await server.close();
    logger.info('Server closed gracefully.');
    await teardownDB(dbClient);
    logger.info('database closed gracefully.');
    process.exit(0);
  } catch (error) {
    logger.error(error, 'Error during shutdown');
    process.exit(1);
  }
}

async function startServer() {
  const start = performance.now();
  const { db, dbClient } = await setupDB(config.DATABASE_URL);

  const server = await buildServer(db);

  process.on('SIGINT', () => gracefulShutdown(server, dbClient));
  process.on('SIGTERM', () => gracefulShutdown(server, dbClient));

  try {
    server.log.info(
      `Successfully built fastify instance in ${(performance.now() - start).toFixed(2)} ms`,
    );
    await server.listen({
      port: config.PORT,
      host: config.HOST,
    });
    logger.info(
      `API documentation available at http://${config.HOST}:${config.PORT}/docs`,
    );
  } catch (error) {
    logger.error(error, 'Server startup failed');
    process.exit(1);
  }
}

startServer();
