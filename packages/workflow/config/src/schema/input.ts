import joi from 'joi';

import type { WorkflowInput } from '@elwood/workflow-types';

export const input = joi
  .object<WorkflowInput>({
    prompt: joi.array().items(
      joi
        .object({
          name: joi.string().required(),
          message: joi.string().optional(),
          type: joi.string().required(),
          default: joi.any().optional(),
          options: joi.array().items(joi.string()).optional(),
          required: joi.boolean().optional(),
        })
        .unknown(false),
    ),
    validate: joi.object({}).unknown(true),
    defaults: joi.object({}).unknown(true),
    required: joi.array().items(joi.string()),
    additional: joi.boolean(),
  })
  .unknown(false);
