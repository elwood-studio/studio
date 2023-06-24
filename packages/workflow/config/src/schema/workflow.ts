import joi from 'joi';

import { job } from './job';

import { name, env, extend, when, permission } from './scalar';

export const workflow = joi
  .object({
    name: name
      .required()
      .description('The name of the workflow')
      .example('my_workflow'),
    description: joi
      .string()
      .description('A description of the workflow')
      .optional(),
    extends: extend
      .description('The name of the workflow or workflows to extend')
      .example('https://x.elwood.studio/w/echo.yml'),
    when: when
      .description('Conditional for when to run the workflow')
      .example('{%= input.run === true %}')
      .example('${ input.run }'),
    jobs: joi
      .object()
      .keys()
      .pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/, job)
      .required()
      .description('List of jobs to run')
      .unknown(true),
    defaults: joi
      .object({
        permission: permission.optional(),
        env: env.optional(),
        job: joi
          .object({
            permission: permission.optional(),
            env: env.optional(),
          })
          .optional(),
        step: joi
          .object({
            permission: permission.optional(),
            env: env.optional(),
          })
          .optional(),
      })
      .description('Default values set for each job & step in a workflow')
      .optional(),
    env: joi
      .array()
      .items(joi.string())
      .description(
        'Environment variables to copy from the runner and make available to the workflow (in context.env).',
      ),
    timeout: joi.object({}).description('Maximum time to run the workflow'),
    meta: joi
      .object({})
      .unknown(true)
      .description('Metadata about the workflow'),
  })
  .example('https://x.elwood.studio/w/hello-world.yml')
  .example('https://x.elwood.studio/w/echo.yml')
  .description(
    'Workflow configuration. More information at https://elwood.studio/docs/workflow',
  );
