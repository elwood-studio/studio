import * as path from 'path';

import { render as interpolate } from 'ejs';
import { invariant } from 'ts-invariant';
import lodashGet from 'lodash.get';

import type { Json, JsonObject } from '@elwood/types';
import type { WorkflowRunnerExpression } from '@elwood/workflow-types';
import type { WorkflowSecretsManager } from '@elwood/workflow-secrets';

import type { WorkflowRunnerRuntime } from '../types';
import { spawnRunDeno } from '../libs/spawn-deno';

export type ExpressionOptions = {
  secrets?: WorkflowSecretsManager;
};

export async function getExpressionValue<T extends Json = string>(
  expression: WorkflowRunnerExpression | string,
  data: JsonObject,
  options: ExpressionOptions = {},
): Promise<T | null> {
  if (!expression) {
    return null;
  }

  if (typeof expression === 'string' || Array.isArray(expression)) {
    return getExpressionValue(
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

  return (await runExpressionValue(expression, data, options)) as T;
}

export async function runExpressionValue(
  expr: WorkflowRunnerExpression,
  data: JsonObject,
  options: ExpressionOptions,
): Promise<string> {
  const { run, input = {} } = expr;
  const env: JsonObject = {};

  for (const [key, value] of Object.entries(input)) {
    env[`INPUT_${key.toUpperCase()}`] = await getExpressionValue(
      value,
      data,
      options,
    );
  }

  const proc = await spawnRunDeno({
    script: '-',
    args: [] as string[],
    cwd: process.cwd(),
    env,
    stdin: 'pipe',
    permissions: {
      net: false,
      read: false,
      write: false,
      run: false,
      ffi: false,
      unstable: false,
      sys: false,
      env: Object.keys(env),
    },
  });

  const scripts = `  
    import {getArgsInput,getInput,getInputWithJson,getBooleanInput} from 'https://x.elwood.studio/a/core/input.ts';
    function returnValue(value:any) {
      Deno.stdout.write(new TextEncoder().encode(value));
    }
    ${run}
  `;

  const output: string[] = [];

  return await new Promise((resolve) => {
    proc.stdout?.on('data', (chunk) => {
      output.push(chunk.toString().trim());
    });
    proc.stderr?.on('data', (chunk) => {
      console.log(chunk.toString());
    });

    proc.on('error', (err) => {
      console.log(err);
      resolve('');
    });

    proc.on('close', (code) => {
      resolve(output.join(''));
    });

    scripts.split('\n').forEach((line) => {
      proc.stdin?.write(`${line.trim()}\n`);
    });

    proc.stdin?.end();
  });
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

    const _str = str.replace(/\{%=/g, '{%').replace(/\{%/g, '{%=');

    return await interpolate(_str, ctx, {
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
