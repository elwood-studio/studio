import joi from 'joi';

import type { WorkflowJobStep } from '@elwood/workflow-types';

import {
  name,
  when,
  input,
  env,
  permission,
  timeout,
  matrix,
  action,
} from './scalar';

export const step = joi
  .object<WorkflowJobStep>({
    name: name.optional(),
    description: joi.string().optional(),
    when: when.optional(),
    input: input.optional(),
    output: joi.object().optional(),
    env: env.optional(),
    permission: permission.optional(),
    timeout: timeout.optional(),
    action: action,
    run: joi.string(),
    matrix: matrix.optional(),
  })
  .or('run', 'action');
