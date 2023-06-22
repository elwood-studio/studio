import type {
  WorkflowRunnerJob,
  WorkflowJob,
  WorkflowDefaults,
} from '@elwood/workflow-types';

import { uid } from './utilts';
import { normalizeJobStep } from './job-step';
import { normalizeEnv, normalizeMatrix, normalizeTimeout } from './scalar';
import { normalizeWhen } from './when';

export function normalizeJob(
  job: WorkflowJob & { name: string },
  defaults: WorkflowDefaults = {},
): WorkflowRunnerJob {
  const id = uid('j');

  return {
    id,
    name: job.name ?? id,
    steps: job.steps.map((item) => normalizeJobStep(item, defaults)),
    matrix: normalizeMatrix(job.matrix),
    env: normalizeEnv(job.env),
    timeoutMinutes: normalizeTimeout(job.timeout),
    when: normalizeWhen(job.when ?? true),
  };
}
