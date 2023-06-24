import { spawn, type ChildProcess, StdioNull, StdioPipe } from 'child_process';

import { invariant } from 'ts-invariant';
import which from 'which';
import { JsonObject } from '@elwood/types';
import type { WorkflowRunnerPermission } from '@elwood/workflow-types';

export type SpawnDenoOptions = {
  script: string;
  args?: string[];
  cwd: string;
  env?: JsonObject;
  permissions?: WorkflowRunnerPermission;
  stdin?: StdioNull | StdioPipe;
  stdout?: StdioNull | StdioPipe;
  stderr?: StdioNull | StdioPipe;
  onStderr?: (chunk: string) => void;
  onStdout?: (chunk: string) => void;
};

export async function spawnRunDeno(
  options: SpawnDenoOptions,
): Promise<ChildProcess> {
  const {
    script,
    args = [],
    cwd,
    env = {},
    permissions,
    stdin = 'ignore',
    stderr = 'pipe',
    stdout = 'pipe',
  } = options;

  const denoBin = await which('deno');
  invariant(denoBin, 'deno is not installed');

  // don't print anything to stdout
  const _args = ['run', '-q'];

  // if they provide permission, push it onto the args
  if (permissions) {
    _args.push(...getDenoPermissions(permissions, Object.keys(env)));
  }

  // path to script and any other args
  // that were passed in
  _args.push(script, ...args);

  // return the spawn. always pipe stdout/stderr. let
  // the user decide about stdin
  return spawn(denoBin, _args, {
    stdio: [stdin, stdout, stderr],
    cwd,
    env,
  });
}

export async function runDenoInlineScript(
  options: Omit<SpawnDenoOptions, 'stdin'>,
): Promise<[string, number]> {
  const { script } = options;

  const proc = await spawnRunDeno({
    ...options,
    script: '-',
    stdin: 'pipe',
  });

  const scripts = `  
    ${script}
  `;

  const output: string[] = [];

  return await new Promise((resolve) => {
    proc.stdout?.on('data', (chunk) => {
      options.onStdout?.(chunk.toString());
      output.push(chunk.toString().trim());
    });
    proc.stderr?.on('data', (chunk) => {
      options.onStderr?.(chunk.toString());
      console.log(chunk.toString());
    });

    proc.on('error', (err) => {
      console.log(err);
      resolve(['', 1]);
    });

    proc.on('close', (code) => {
      resolve([output.join(''), code ?? 0]);
    });

    scripts.split('\n').forEach((line) => {
      proc.stdin?.write(`${line.trim()}\n`);
    });

    proc.stdin?.end();
  });
}

export function getDenoPermissions(
  permissions: WorkflowRunnerPermission,
  additionalEnv: string[] = [],
): string[] {
  const args: Array<string | boolean> = [];

  for (const [key, value] of Object.entries(permissions)) {
    switch (key) {
      case 'unstable': {
        args.push(value && '--unstable');
        break;
      }
      case 'env': {
        // if env is true, allow all env vars
        if (value === true) {
          args.push('--allow-env');
          break;
        }

        // if env is not true, allow only the env
        // vars that we're passing in
        const _values = additionalEnv;

        if (Array.isArray(value)) {
          _values.push(...value);
        }

        if (_values.length > 0) {
          args.push(`--allow-env=${_values.join(',')}`);
        }

        break;
      }
      default: {
        if (Array.isArray(value)) {
          args.push(`--allow-${key}=${value.join(',')}`);
        } else {
          args.push(value && `--allow-${key}`);
        }
      }
    }
  }

  return args.filter(Boolean) as string[];
}
