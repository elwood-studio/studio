import type { JsonObject } from '@elwood-studio/types';
import invariant from 'ts-invariant';

import type {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimeRunStep,
  WorkflowRunnerRuntimeRun,
} from '../types';

import { startRunWorkflow } from './run-workflow';

export async function handleWorkflowCallback(
  runtime: WorkflowRunnerRuntime,
  callbackToken: string,
  payload: JsonObject = {},
): Promise<WorkflowRunnerRuntimeRun> {
  const [runId, callbackTokenId] = Buffer.from(callbackToken, 'base64')
    .toString()
    .split(':');

  const run = runtime.runs.get(runId);

  invariant(run, `Unable to find run for callbackToken`);

  const step = Array.from(run.jobs.values())
    .reduce((acc, item) => {
      return [...acc, ...Array.from(item.steps.values())];
    }, [] as WorkflowRunnerRuntimeRunStep[])
    .find((item) => item.callbackTokenId === callbackTokenId);

  invariant(step, 'Unable to find step for callbackToken');

  step.context.set('callback', {
    payload,
  });

  await startRunWorkflow(run, step.id);

  return run;
}
