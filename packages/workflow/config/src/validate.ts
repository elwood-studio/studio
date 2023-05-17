import type { ValidationError } from 'joi';
import Ajv, { type ErrorObject } from 'ajv';

import type { JsonObject } from '@elwood-studio/types';
import type { Workflow } from '@elwood-studio/workflow-types';

import { schema } from './schema';

export async function validateWorkflow(
  workflow: Workflow,
): Promise<[boolean, ValidationError | undefined]> {
  const { error } = schema.workflow.validate(workflow);
  return [error === undefined, error];
}

type ValidateWorkflowInputResult = {
  valid: boolean;
  errors: ErrorObject[] | null;
  value: JsonObject;
};

export async function validateWorkflowInput(
  input: JsonObject = {},
  workflow: Workflow,
): Promise<ValidateWorkflowInputResult> {
  const {
    defaults = {},
    validate,
    required = [],
    additional = false,
  } = workflow.input ?? {};

  const inputWithDefaults = {
    ...defaults,
    ...input,
  };

  if (validate) {
    const ajv = new Ajv();
    const schema = {
      type: 'object',
      properties: validate,
      required,
      additionalProperties: additional,
    };

    const validator = ajv.compile(schema);
    const valid = validator(inputWithDefaults);

    return {
      valid,
      errors: validator.errors ?? null,
      value: inputWithDefaults,
    };
  }

  return {
    valid: true,
    errors: null,
    value: inputWithDefaults,
  };
}
