import { FastifySchema } from 'fastify';
import { JSONSchema } from 'json-schema-to-ts';

export const post: FastifySchema = {
  description: 'Create a new blob from a source or base64 content string',
  params: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Object path composed of object names or ids',
      },
    },
  } as const satisfies JSONSchema,
  body: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'URL of the remote file',
      },
      content: {
        type: 'string',
        description: 'Base64 content of the blob',
      },
    },
  } as const satisfies JSONSchema,
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Object id',
        },
      },
    } as const satisfies JSONSchema,
  },
};

export const get = {};
