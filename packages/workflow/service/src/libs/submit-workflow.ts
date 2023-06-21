import { normalizeWorkflowToInstructions } from '@elwood-studio/workflow-config';
import { SecretsManager } from '@elwood-studio/workflow-secrets';
import {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimeRun,
  runWorkflow,
} from '@elwood-studio/workflow-runner';
import type { Workflow } from '@elwood-studio/workflow-types';
import type { JsonObject } from '@elwood-studio/types';

export type RunWorkflowOptions = {
  runtime: WorkflowRunnerRuntime;
  secretsManager: SecretsManager;
  workflow: Workflow;
  input: JsonObject;
  context?: JsonObject;
};

export async function submitWorkflow(
  options: RunWorkflowOptions,
): Promise<WorkflowRunnerRuntimeRun> {
  const { runtime, secretsManager, workflow, input, context = {} } = options;
  const instructions = await normalizeWorkflowToInstructions(workflow);

  return await runWorkflow({
    runtime,
    secretsManager,
    instructions,
    input,
    context: {
      ...context,
      env: process.env ?? {},
    },
  });
}
