import { errorResponseExample } from '@/shared/examples';
import { logger } from '@/utils/logger';
import { FastifyError, FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';
import { StatusCodes } from 'http-status-codes';
import { PostgresError } from 'postgres';
import { z } from 'zod';

const PG_ERR_UNIQUE_VIOLATION = '23505';

export const errorResponseSchema = z
  .object({
    error: z.object({
      status: z
        .string()
        .describe('HTTP status code, as a string.')
        .meta({ example: errorResponseExample.status }),
      message: z
        .string()
        .describe('Human-readable explanation of what went wrong.')
        .meta({ example: errorResponseExample.message }),
      code: z
        .string()
        .optional()
        .describe('Stable machine-readable error code, when available.')
        .meta({ example: errorResponseExample.code }),
    }),
  })
  .meta({
    id: 'ErrorResponse',
    description:
      'Uniform error envelope. `status` mirrors the HTTP status code; ' +
      '`code` is present for validation, conflict and internal errors.',
  });

export const routeErrorResponses = {
  400: errorResponseSchema,
  404: errorResponseSchema,
  409: errorResponseSchema,
  429: errorResponseSchema,
  500: errorResponseSchema,
};

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

const createErrorResponse = (
  statusCode: StatusCodes,
  message: string,
  code?: string,
): ErrorResponse => ({
  error: {
    status: statusCode.toString(),
    message,
    code,
  },
});

const customErrorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler<FastifyError>((error, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      logger.warn({ error }, `Zod validation error: ${error.message}`);
      return reply
        .code(StatusCodes.BAD_REQUEST)
        .send(
          createErrorResponse(
            StatusCodes.BAD_REQUEST,
            error.message,
            error.code,
          ),
        );
    }

    if (isResponseSerializationError(error)) {
      return reply.code(500).send({
        error: {
          status: '500',
          message: "Response doesn't match the schema",
          code: 'FST_RESPONSE_SERIALIZATION_ERROR',
        },
      });
    }

    if (
      error instanceof PostgresError &&
      error.code === PG_ERR_UNIQUE_VIOLATION
    ) {
      logger.warn({ error }, 'Database unique constraint violation');
      return reply
        .code(StatusCodes.CONFLICT)
        .send(
          createErrorResponse(
            StatusCodes.CONFLICT,
            'O recurso já existe.',
            error.code,
          ),
        );
    }

    if (error.statusCode) {
      logger.error({ error }, `Handled error: ${error.message}`);
      return reply
        .code(error.statusCode)
        .send(
          createErrorResponse(
            error.statusCode,
            error.message,
            error.code?.toString(),
          ),
        );
    }

    logger.error({ error }, 'Unhandled internal server error');
    return reply
      .code(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        createErrorResponse(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Algo deu errado no servidor',
          'FST_INTERNAL_SERVER_ERROR',
        ),
      );
  });
};

export default fastifyPlugin(customErrorHandler);
