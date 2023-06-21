import {
  WorkflowRunnerWhen,
  WorkflowWhenObject,
  WorkflowWhen,
  WorkflowRunnerExpression,
  WorkflowWhenRunObject,
} from '@elwood-studio/workflow-types';
import { invariant } from 'ts-invariant';

export function normalizeWhen(
  when: WorkflowWhen | null | undefined,
): WorkflowRunnerWhen {
  // if they don't tell us when, we assume we always run
  if (when === null || when === undefined) {
    return normalizeWhen(true);
  }

  // if it's true or false,
  if (when === true || when === false) {
    return {
      operator: 'and',
      any: [],
      all: [normalizeWhenToExpression(when)],
    };
  }

  // if they provide a string, we assume it's an expression
  if (typeof when === 'string') {
    if (when === '*') {
      return normalizeWhen(true);
    }

    return {
      operator: 'and',
      any: [],
      all: [normalizeWhenToExpression(when)],
    };
  }

  if (Array.isArray(when)) {
    return {
      operator: 'and',
      any: [],
      all: when.map(normalizeWhenToExpression),
    };
  }

  if (typeof when === 'object') {
    const w = when as WorkflowWhenObject;
    const o: WorkflowRunnerWhen = {
      operator: w.operator ?? 'and',
      any: (w.any ?? []).map(normalizeWhenToExpression),
      all: (w.all ?? []).map(normalizeWhenToExpression),
    };

    if (w.event) {
      o.all.push(
        ...(Array.isArray(w.event) ? w.event : [w.event]).map((e) =>
          normalizeWhenToExpression(`{%= event === "${e}" %}`),
        ),
      );
    }

    return o;
  }

  throw new Error(`Invalid when: ${when}`);
}

export function normalizeWhenToExpression(
  item: string | boolean | WorkflowWhenRunObject,
): WorkflowRunnerExpression {
  if (typeof item === 'string') {
    return normalizeWhenToExpression({
      run: 'expression',
      input: {
        expression: item,
      },
    });
  }

  if (typeof item === 'boolean') {
    return normalizeWhenToExpression({
      run: 'expression',
      input: {
        expression: `{%= ${Boolean(item)} %}`,
      },
    });
  }

  invariant(typeof item === 'object', `Invalid when type "${typeof item}"`);
  invariant(
    typeof item.run === 'string',
    `Invalid when.run type "${typeof item.run}"`,
  );

  return {
    run: String(item.run),
    input: item.input ?? {},
  };
}
