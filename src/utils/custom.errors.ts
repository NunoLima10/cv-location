import createError from '@fastify/error';

export const NotFoundError = createError(
  'FST_DB_NOT_FOUND',
  'O recurso solicitado não foi encontrado.',
  404,
);

export const ValidationError = createError(
  'FST_VALIDATION_ERROR',
  'Falha na validação: %s. Por favor, corrija a entrada e tente novamente.',
  400,
);

export const BadRequestError = createError(
  'FST_BAD_REQUEST',
  'Requisição inválida: %s',
  400,
);

export const ConflictError = createError('FST_CONFLICT', 'Conflito: %s', 409);

export const DatabaseError = createError(
  'FST_DB_ERROR',
  'Ocorreu um erro no banco de dados. Por favor, tente novamente mais tarde.',
  500,
);

export const InternalServerError = createError(
  'FST_INTERNAL_ERROR',
  'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.',
  500,
);
