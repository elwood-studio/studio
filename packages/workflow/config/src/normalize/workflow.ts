import type {
  Workflow,
  WorkflowRunnerInstructions,
} from '@elwood-studio/workflow-types';

import { uid } from './utilts';
import { normalizeJob } from './job';
import { normalizeWhen } from './when';
import { normalizeEnv, normalizeTimeout } from './scalar';

export async function normalizeWorkflowToInstructions(
  workflow: Workflow,
): Promise<WorkflowRunnerInstructions> {
  const id = uid('w');
  return {
    meta: workflow.meta ?? undefined,
    id,
    jobs: Object.keys(workflow.jobs).map((name) => {
      return normalizeJob(
        { ...workflow.jobs[name], name },
        workflow.defaults ?? {},
      );
    }),
    when: normalizeWhen(workflow.when),
    timeoutMinutes: normalizeTimeout(workflow.timeout),
    env: normalizeEnv(workflow.env),
  };
}
