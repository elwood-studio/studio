export const post = {
  description: 'Create a blob from content or a remote file',
  params: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Object path composed of object names or ids',
      },
    },
  },
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
  },
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
    },
  },
};

export const get = {};
