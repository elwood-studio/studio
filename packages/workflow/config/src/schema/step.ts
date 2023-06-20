import joi from 'joi';

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
  .object({
    name: name.optional(),
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
