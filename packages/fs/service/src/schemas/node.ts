import type { JSONSchema } from '@/types.ts';

export const node = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'ID of the node',
    },
  },
} as const satisfies JSONSchema;
