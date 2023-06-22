import type { Workflow } from '@elwood/workflow-types';

export const workflow: Workflow = {
  name: 'hello-world',
  when: '*',
  jobs: {
    default: {
      steps: [
        {
          name: 'echo',
          action: 'echo',
          input: {
            message: '{%= input.message %}',
          },
        },
      ],
    },
  },
};

export const input = { message: 'Hello World!' };
