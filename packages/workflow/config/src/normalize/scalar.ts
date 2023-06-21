import type {
  WorkflowRunnerEnv,
  WorkflowEnv,
  WorkflowTimeout,
  WorkflowMatrix,
  WorkflowRunnerJobMatrix,
} from '@elwood-studio/workflow-types';

export function normalizeEnv(env: WorkflowEnv | undefined): WorkflowRunnerEnv {
  return env ?? {};
}

export function normalizeTimeout(
  timeout: WorkflowTimeout | undefined,
): number | null {
  return timeout?.minutes ?? null;
}

export function normalizeMatrix(
  matrix: WorkflowMatrix | undefined = undefined,
): WorkflowRunnerJobMatrix {
  if (!matrix) {
    return [];
  }

  if (typeof matrix === 'string') {
    return {
      run: 'expression',
      input: {
        expression: matrix,
      },
    };
  }

  if (Array.isArray(matrix)) {
    return matrix.map((expression) => ({
      run: 'expression',
      input: {
        expression,
      },
    }));
  }

  return [];
}