import type {
  WorkflowRunnerJob,
  WorkflowRunnerExpression,
} from '@elwood-studio/workflow-types';
import type { JsonObject, Json } from '@elwood-studio/types';
import invariant from 'ts-invariant';

import type { WorkflowRunnerRuntimeRun, WorkflowRunnerRuntime } from '../types';
import { getExpressionValue } from './expression';
import debug from './debug';

const log = debug('matrix');

export async function expandJobMatrixAndAddToRun(
  runtime: WorkflowRunnerRuntime,
  run: WorkflowRunnerRuntimeRun,
  job: WorkflowRunnerJob,
): Promise<void> {
  let matrixValue: unknown = job.matrix;

  log('matrixValue=%o', matrixValue);
  log('context=', run.contextValue());

  // if
  if (typeof (matrixValue as WorkflowRunnerExpression).run !== 'undefined') {
    matrixValue = await getExpressionValue(
      runtime,
      matrixValue as WorkflowRunnerExpression,
      run.contextValue(),
    );
  }

  log('matrixValue=%o', matrixValue);

  invariant(
    Array.isArray(matrixValue),
    `Matrix value for "${
      job.name
    }.matrix" must be an array. "${typeof matrixValue}" returned.`,
  );

  for (const exp of matrixValue) {
    const value = await getExpressionValue(runtime, exp, run.contextValue());

    if (value) {
      run.addJob(job).context.set('matrix', value);
    }
  }
}

export function expandMatrixValues(
  matrix: Record<string, Json[]>,
): JsonObject[] {
  function recurse(keys: string[]): JsonObject[] {
    if (!keys.length) return [{}];
    let result = recurse(keys.slice(1));
    return matrix[keys[0]].reduce(
      (acc, value) =>
        acc.concat(
          result.map((item) => Object.assign({}, item, { [keys[0]]: value })),
        ),
      [],
    );
  }

  return recurse(Object.keys(matrix));
}
