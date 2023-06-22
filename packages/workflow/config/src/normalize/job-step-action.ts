import type {
  WorkflowAction,
  WorkflowRunnerAction,
} from '@elwood/workflow-types';

export function normalizeJobStepAction(
  action: WorkflowAction,
): WorkflowRunnerAction {
  function getVersion(str: string): [string, string[], string | undefined] {
    const [name, version] = str.split('@');
    const [actionName, ...args] = name.split(':');
    return [actionName, args, version];
  }

  if (typeof action === 'string') {
    const [a, args, version] = getVersion(action);
    return {
      action: a,
      version,
      args,
      command: [],
    };
  }

  const [a, args, version] = getVersion(action.action);

  return {
    action: a,
    args: [...args, ...(action.args ?? [])],
    command: action.command ?? [],
    version: version,
  };
}
