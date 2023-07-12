import { Schema, JSONSchema } from '@/types.ts';

export const postBody = {
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
    parents: {
      type: 'boolean',
      description: 'Create parent directories if they do not exist',
    },
    display_name: {
      type: 'string',
      description: 'Display name of the blob',
    },
    mime_type: {
      type: 'string',
      description: 'Mime type of the blob',
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

export const post: Schema = {
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
  body: postBody,
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

export const get: Schema = {
  description: 'Create a new blob from a source or base64 content string',
  params: {
    type: 'object',
    properties: {
      '*': {
        type: 'string',
        description: 'Object path composed of object names or ids',
      },
    },
    required: ['*'],
  } as const satisfies JSONSchema,
};
