/** 

Hello World Secrets Example
============================

This is an example of a workflow that uses secrets to print
"Hello World, I am secret!". If no Key is provided, the default
root key is used

Usage:
------
yarn cli secrets.ts

Expected Output:
-----------------
[default.echo.stdout]: Hello World, I am secret!

Learn More:
 - https://elwood.studio/docs/workflow/
 - https://elwood.studio/docs/workflow/secrets/
 - https://elwood.studio/docs/getting-started/
 
*/

import type { Workflow } from '@elwood/workflow-types';

export const workflow: Workflow = {
  name: 'hello-world-secret',
  when: '*',
  jobs: {
    default: {
      steps: [
        {
          action: 'echo',
          input: {
            message: '{%= secret("secret_message") %}',
          },
        },
      ],
    },
  },
};

export const secrets = [['secret_message', 'Hello World, I am secret!']];
