import fastifySwagger, { SwaggerTransformObject } from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from 'fastify-type-provider-zod';
import { version } from '../../package.json';

/**
 * Tidy the component schemas emitted by `jsonSchemaTransformObject`:
 *
 * 1. It registers both an output and an `*Input` variant for every named Zod
 *    schema. Our models are response-only, so the `*Input` copies land in the
 *    spec unreferenced — drop any schema nothing `$ref`s, resolving transitively.
 * 2. The OpenAPI 3.1 path passes JSON Schema through verbatim, leaving
 *    `$schema` / `$id` keys on each component. Strip them.
 */
const tidyComponentSchemas =
  (transformObject: SwaggerTransformObject): SwaggerTransformObject =>
  (input) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = transformObject(input);
    const schemas: Record<string, Record<string, unknown>> | undefined =
      doc.components?.schemas;
    if (!schemas) return doc;

    const referenced = new Set<string>();
    const scan = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(scan);
      } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
          if (key === '$ref' && typeof child === 'string') {
            const name = child.replace('#/components/schemas/', '');
            if (!referenced.has(name)) {
              referenced.add(name);
              scan(schemas[name]);
            }
          } else {
            scan(child);
          }
        }
      }
    };

    const { schemas: _omit, ...componentsWithoutSchemas } =
      doc.components ?? {};
    void _omit;
    scan({ ...doc, components: componentsWithoutSchemas });

    doc.components.schemas = Object.fromEntries(
      Object.entries(schemas)
        .filter(([name]) => referenced.has(name))
        .map(([name, schema]) => {
          const { $schema, $id, ...rest } = schema;
          void $schema;
          void $id;
          return [name, rest];
        }),
    );
    return doc;
  };

type SwaggerPluginOptions = {
  port: number;
  host: string;
  title: string;
  description: string;
  version: string;
  path: string;
};

const REPO_URL = 'https://github.com/NunoLima10/cv-location';

const TAGS = [
  {
    name: 'countries',
    description: 'Level 1 — sovereign country (Cape Verde).',
  },
  { name: 'islands', description: 'Level 2 — islands of the archipelago.' },
  {
    name: 'municipalities',
    description: 'Level 3 — municipalities (concelhos).',
  },
  { name: 'parishes', description: 'Level 4 — civil parishes (freguesias).' },
  { name: 'zones', description: 'Level 5 — zones within a parish.' },
  { name: 'places', description: 'Level 6 — named places and localities.' },
  {
    name: 'locations',
    description:
      'Level-agnostic lookups: resolve any code, or read seed-data counts.',
  },
  {
    name: 'search',
    description: 'Fuzzy text search across every hierarchy level.',
  },
  { name: 'system', description: 'Operational endpoints (health, liveness).' },
];

const swagger = async (
  fastify: FastifyInstance,
  options: SwaggerPluginOptions,
) => {
  if (!options.port) throw Error('Port is not defined');
  if (!options.host) throw Error('Host is not defined');
  if (!options.title) throw Error('Title is not defined');
  if (!options.description) throw Error('Description is not defined');
  if (!options.version) throw Error('Version is not defined');
  if (!options.path) throw Error('Path is not defined');

  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: options.title,
        version,
        description: [
          options.description,
          '',
          'Cape Verde administrative geography has six nested levels:',
          '',
          '| Level | Entity | Portuguese | Example code |',
          '| ----- | ------ | ---------- | ------------ |',
          '| 1 | Country | País | `CV` |',
          '| 2 | Island | Ilha | `CV1` |',
          '| 3 | Municipality | Concelho | `CV111` |',
          '| 4 | Parish | Freguesia | `CV111111` |',
          '| 5 | Zone | Zona | `CV11111111101` |',
          '| 6 | Place | Lugar | `CV111111111011110101` |',
          '',
          'Every entity exposes a stable `code` (used in path parameters) and a',
          '`level` matching the table above. List endpoints are paginated with',
          '`limit` / `offset` and return a `meta` block describing the full result set.',
        ].join('\n'),
        contact: { name: 'cv-location', url: REPO_URL },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://${options.host}:${options.port}`,
          description: 'Local development',
        },
      ],
      tags: TAGS,
      externalDocs: {
        url: `${REPO_URL}#readme`,
        description: 'Project README',
      },
    },
    transform: jsonSchemaTransform,
    transformObject: tidyComponentSchemas(jsonSchemaTransformObject),
  });

  await fastify.register(fastifySwaggerUI, {
    routePrefix: options.path,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 2,
      defaultModelRendering: 'model',
    },
  });
};

export default fastifyPlugin(swagger);
