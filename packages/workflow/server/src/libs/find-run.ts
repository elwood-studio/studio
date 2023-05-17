import {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimeRun,
} from '@elwood-studio/workflow-runner';

export function findRunByTrackingId(
  runtime: WorkflowRunnerRuntime,
  id: string,
): WorkflowRunnerRuntimeRun | undefined {
  return Array.from(runtime.runs.values()).find((item) => {
    return item.context.get('trackingId') === id;
  });
}

export function findRunByIdOrTrackingId(
  runtime: WorkflowRunnerRuntime,
  id: string,
): WorkflowRunnerRuntimeRun | undefined {
  return id.startsWith('id:')
    ? runtime.runs.get(id.slice(3))
    : findRunByTrackingId(runtime, id);
}
