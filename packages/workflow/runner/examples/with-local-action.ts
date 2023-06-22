import type { Workflow } from '@elwood/workflow-types';

export const workflow: Workflow = {
  name: 'local-action',
  when: '*',
  jobs: {
    start: {
      steps: [
        {
          name: 'with-input-message',
          action: '$static/actions/local-action.ts',
          input: {
            message: '{%= input.message %}',
          },
        },
        {
          name: 'no-input-message',
          action: '$static/actions/local-action.ts',
          input: {},
        },
      ],
    },
  },
};

export const input = { message: 'Hello World!' };
