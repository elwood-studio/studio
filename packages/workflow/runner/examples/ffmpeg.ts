import type { Workflow } from '@elwood-studio/workflow-types';

export const workflow: Workflow = {
  name: 'ffmpeg',
  when: '*',
  jobs: {
    default: {
      steps: [
        {
          action: 'run/ffmpeg',
          input: {
            args: '-version',
          },
        },
      ],
    },
  },
};
