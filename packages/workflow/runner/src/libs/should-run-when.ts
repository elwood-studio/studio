import { Json } from '@elwood/types';
import type {
  WorkflowRunnerWhen,
  WorkflowRunnerExpression,
} from '@elwood/workflow-types';

import { isExpressionValueFalseLike } from './expression';

export type ShouldRunWhenGetExpressionValue = (
  expression: WorkflowRunnerExpression,
) => Promise<Json>;

export async function shouldRunWhen(
  when: WorkflowRunnerWhen,
  getExpressionValue: ShouldRunWhenGetExpressionValue,
): Promise<boolean> {
  // will be an array of booleans that are true if the expression
  // returns anything that is not false like
  const all = await Promise.all(
    when.all.map(async (item) => {
      return !isExpressionValueFalseLike(await getExpressionValue(item));
    }),
  );
  const any = await Promise.all(
    when.any.map(async (item) => {
      return !isExpressionValueFalseLike(await getExpressionValue(item));
    }),
  );

  const allResult = all.every((item) => item === true);
  const anyResult = any.some((item) => item === true);

  // if no any are defined, return the all
  if (any.length === 0) {
    return allResult;
  }

  // if there is no all defined, returned any
  if (all.length === 0) {
    return anyResult;
  }

  return allResult && anyResult;
}
