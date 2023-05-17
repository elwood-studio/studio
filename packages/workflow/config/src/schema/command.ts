import joi from 'joi';

import type { WorkflowCommand } from '@elwood-studio/workflow-types';

import { name, access, env } from './scalar';

export const command = joi
  .object<WorkflowCommand>({
    access,
    env,
  })
  .unknown(false);

export const commands = joi.object().pattern(name, command);
