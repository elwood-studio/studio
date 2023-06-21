import type { ValidationError } from 'joi';
import { type ErrorObject } from 'ajv';

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

/** @deprecated */
export async function validateWorkflowInput(
  input: JsonObject = {},
  _workflow: Workflow,
): Promise<ValidateWorkflowInputResult> {
  return {
    valid: true,
    errors: null,
    value: input,
  };
}
