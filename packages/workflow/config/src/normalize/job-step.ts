import type {
  WorkflowRunnerJobStep,
  WorkflowJobStep,
  WorkflowJobStepAction,
  WorkflowJobStepRun,
  WorkflowDefaults,
} from '@elwood-studio/workflow-types';

import { uid } from './utilts';
import { normalizeEnv, normalizeTimeout, normalizeMatrix } from './scalar';
import { normalizePermission } from './permission';
import { normalizeWhen } from './when';
import { normalizeJobStepAction } from './job-step-action';

export function normalizeJobStep(
  step: WorkflowJobStep,
  defaults: WorkflowDefaults = {},
): WorkflowRunnerJobStep {
  const id = uid('s');
  const shared = {
    id,
    name: step.name ?? id,
    input: step.input ?? {},
    output: step.output ?? {},
    env: normalizeEnv(step.env),
    timeoutMinutes: normalizeTimeout(step.timeout),
    permission: normalizePermission(
      step.permission,
      normalizePermission(defaults.permission),
    ),
    when: normalizeWhen(step.when ?? []),
    matrix: normalizeMatrix(step.matrix),
  };

  if ((step as WorkflowJobStepRun).run) {
    return {
      ...shared,
      action: normalizeJobStepAction('run/script'),
      input: {
        ...shared.input,
        script: (step as WorkflowJobStepRun).run,
      },
    };
  }

  return {
    ...shared,
    action: normalizeJobStepAction((step as WorkflowJobStepAction).action),
  };
}
