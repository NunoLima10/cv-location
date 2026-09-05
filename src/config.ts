import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const schema = z
  .object({
    // Application Settings
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development')
      .describe('Runtime environment of the application'),
    PORT: z.coerce
      .number()
      .default(4000)
      .describe('Port the server listens on'),
    HOST: z.string().default('0.0.0.0').describe('Host address for the server'),
    ALLOWED_ORIGINS: z
      .string()
      .transform((val) => val.split(','))
      .describe('Comma-separated list of allowed CORS origins'),

    // Database Configuration
    DATABASE_URL: z.string().describe('Connection URL for the database'),
    DB_MIGRATING: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
    DB_SEEDING: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),

    // Logging
    LOG_LEVEL: z
      .string()
      .default('info')
      .describe('Logging level (e.g., info, debug, error)'),

    // Rate Limiting
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    RATE_LIMIT_TIME_WINDOW: z.string().default('1 minute'),

    // API Documentation
    DOCS_ENABLED: z
      .enum(['true', 'false'])
      .optional()
      .describe(
        'Serve the OpenAPI spec and Swagger UI. Defaults to true outside production.',
      ),
  })
  .transform((cfg) => ({
    ...cfg,
    isDev: cfg.NODE_ENV === 'development',
    isProd: cfg.NODE_ENV === 'production',
    docsEnabled: cfg.DOCS_ENABLED
      ? cfg.DOCS_ENABLED === 'true'
      : cfg.NODE_ENV !== 'production',
  }));

export type Config = z.infer<typeof schema>;
export const config = schema.parse(process.env);
