/** 

Output Example
============================

This is an example of a workflow that sets an output
variable. Output variables are consumable by other 
steps in a job or other jobs. 

Usage:
------
yarn cli 03-output.ts

Expected Output:
-----------------
[start.echo.stdout]: Hello World! from the start job
[finish.echo.stdout]: Hello World! from the finish job
[complex.echo.stdout]: Hello World!

Learn More:
 - https://elwood.studio/docs/workflow/
 - https://elwood.studio/docs/workflow/output/
 - https://elwood.studio/docs/getting-started/
 
*/

import type { Workflow } from '@elwood/workflow-types';

export const workflow: Workflow = {
  name: 'output',
  when: '*',
  jobs: {
    start: {
      steps: [
        {
          name: 'set',
          action: 'output',
          input: {
            name: 'message',
            value: '{%= input.message %}',
          },
        },
        {
          name: 'echo',
          action: 'echo',
          input: {
            message: '{%= job.steps.set.output.message %} from the start job',
          },
        },
      ],
    },
    finish: {
      steps: [
        {
          name: 'echo',
          action: 'echo',
          input: {
            message:
              '{%= jobs.start.steps.set.output.message %} from the finish job',
          },
        },
      ],
    },
    complex: {
      steps: [
        {
          name: 'write',
          action: 'fs/write',
          input: {
            dest: 'output.json',
            content: '{%= toJson({ message: input.message }) %}',
          },
        },
        {
          name: 'read',
          action: 'output',
          input: {
            name: 'result',
            value: 'file://output.json',
          },
        },
        {
          name: 'echo',
          action: 'echo',
          input: {
            message: '{%= fromJson(job.steps.read.output.result).message %}',
          },
        },
      ],
    },
  },
};

export const input = { message: 'Hello World!' };
