import * as path from 'path';

import { render as interpolate } from 'ejs';
import invariant from 'ts-invariant';
import lodashGet from 'lodash.get';

import type { Json, JsonObject } from '@elwood-studio/types';
import type { WorkflowRunnerExpression } from '@elwood-studio/workflow-types';
import type { WorkflowSecretsManager } from '@elwood-studio/workflow-secrets';

import type { WorkflowRunnerRuntime } from '../types';

export type ExpressionOptions = {
  secrets?: WorkflowSecretsManager;
};

export async function getExpressionValue<T extends Json = string>(
  runtime: WorkflowRunnerRuntime,
  expression: WorkflowRunnerExpression | string,
  data: JsonObject,
  options: ExpressionOptions = {},
): Promise<T | null> {
  if (!expression) {
    return null;
  }

  if (typeof expression === 'string' || Array.isArray(expression)) {
    return getExpressionValue(
      runtime,
      { run: 'expression', input: { expression } },
      data,
      options,
    );
  }

  const { run, input } = expression;

  invariant(run, 'expression.run must be defined');

  if (run === 'expression') {
    return await getNativeExpressionValue(input.expression, data, options);
  }

  throw new Error(`Invalid expression: ${run}`);

  // // write the script to a local file
  // const eid = runtime.uuid('e');
  // const localRunFile = runtime.workingDir.path(`expression/${eid}.js`);
  // await runtime.workingDir.writeAsync(
  //   `expression/${eid}.js`,
  //   `globalThis.context = ${JSON.stringify(data)}; ${run}`,
  // );

  // const logger = new Logger(null);
  // const [result, container] = await runDocker(
  //   runtime.docker,
  //   'denoland/deno:alpine',
  //   ['deno', 'run', '-A', '-q', '/var/run/script.js'],
  //   [logger, logger],
  //   {
  //     Env: ['NO_COLOR='],
  //     AttachStderr: true,
  //     AttachStdout: true,
  //     Tty: false,
  //     Volumes: {
  //       '/var/run': {},
  //     },
  //     HostConfig: {
  //       Binds: [`${localRunFile}:/var/run/script.js`],
  //     },
  //   },
  // );

  // await container.remove({ force: true });

  // if (result.StatusCode !== 0) {
  //   return null;
  // }

  // return JSON.parse(logger.getStack().join('')) as T;
}

export async function getNativeExpressionValue<T extends Json = string>(
  value: WorkflowRunnerExpression['input']['expression'],
  data: JsonObject,
  options: ExpressionOptions,
): Promise<T> {
  if (value === true || value === false) {
    return value as T;
  }

  if (!value) {
    return null as T;
  }

  if (Array.isArray(value)) {
    const values = [];

    for (const item of value) {
      values.push(await getNativeExpressionValue<T>(item, data, options));
    }

    return `json:${JSON.stringify(values)}` as T;
  }

  if (
    typeof value === 'string' &&
    value.startsWith('${') &&
    value.endsWith('}')
  ) {
    return lodashGet(data, value.slice(2, -1).trim()) as T;
  }

  return (await replaceExpressionTokens(value, data, options)) as T;
}

export async function replaceExpressionTokens(
  str: string,
  data: JsonObject,
  options: ExpressionOptions,
): Promise<string> {
  const { secrets } = options;

  try {
    const ctx = {
      ...data,
      secret(name: string) {
        invariant(secrets, 'secrets not provided');
        return secrets.getSecret(name).value;
      },

      // string to json
      toJson: function toJson(src: JsonObject) {
        invariant(
          typeof src === 'object',
          `toJson: src must be an object (got ${typeof src})`,
        );
        return JSON.stringify(src);
      },
      fromJson: function fromJson(src: string) {
        invariant(
          typeof src === 'string',
          `fromJson: src must be a string (${typeof src} given)`,
        );
        return JSON.parse(src);
      },
      toJsonInput: function toJsonInput(src: JsonObject) {
        return `json:${JSON.stringify(src)}`;
      },
      getStepOutput: function getStepOutput(
        step: string,
        name: string,
        defaultValue: unknown = null,
      ) {
        return data?.job?.steps[step]?.output[name] ?? defaultValue;
      },
      basename: function basename(src: string) {
        return path.basename(src);
      },
      extname: function extname(src: string) {
        return path.extname(src);
      },
      dirname: function dirname(src: string) {
        return path.dirname(src);
      },
    };

    return await interpolate(str, ctx, {
      async: true,
      openDelimiter: '{',
      closeDelimiter: '}',
      escape(str: string) {
        return str;
      },
      includer() {
        throw new Error('includer not available');
      },
    });
  } catch (err) {
    console.log(`Unable to interpolate expression: ${str}`);
    console.log(`Error: ${(err as Error).message}`);
    return '';
  }
}

export function isExpressionValueFalseLike(
  value: string | number | null | boolean,
): boolean {
  return (
    value === false ||
    value === 'false' ||
    value === 0 ||
    value === '0' ||
    value === ''
  );
}
