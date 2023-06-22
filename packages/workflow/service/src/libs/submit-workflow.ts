import { normalizeWorkflowToInstructions } from '@elwood/workflow-config';
import { SecretsManager } from '@elwood/workflow-secrets';
import {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimeRun,
  runWorkflow,
} from '@elwood/workflow-runner';
import type { Workflow } from '@elwood/workflow-types';
import type { JsonObject } from '@elwood/types';

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
