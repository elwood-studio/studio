import joi from 'joi';

import type { WorkflowJob } from '@elwood-studio/workflow-types';

import { timeout, env, when, matrix } from './scalar';
import { step } from './step';

export const job = joi
  .object<WorkflowJob>({
    steps: joi.array().items(step).required().min(1),
    description: joi.string().optional(),
    matrix: matrix.optional(),
    when: when.optional(),
    timeout: timeout.optional(),
    env: env.optional(),
  })
  .unknown(false);
