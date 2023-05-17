import { spawn } from 'child_process';
import which from 'which';

import type {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimeRunStep,
  ExecuteStepCommandOutput,
} from '../../types';
import debug from '../../libs/debug';
import invariant from 'ts-invariant';

export type CommandExecuteLocalOptions = {
  runtime: WorkflowRunnerRuntime;
  step: WorkflowRunnerRuntimeRunStep;
  name: string;
  args: string[];
};

const log = debug('command:local');

export async function commandExecuteLocal(
  options: CommandExecuteLocalOptions,
): Promise<ExecuteStepCommandOutput> {
  const { name, args, step } = options;
  const env = await step.getContainerEnvironment({}, {}, 'localhost');

  log('commandExecuteLocal(%o)', { step: step.def.name, name, args });

  const bin = await which(name);

  invariant(bin, `Unable to locate ${bin} in $PATH`);

  return await new Promise((resolve) => {
    log(' running %s %o', bin, args);

    const stdout: string[] = [];
    const stderr: string[] = [];
    const proc = spawn(bin, args, {
      cwd: step.job.stageDir.path(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: env.reduce((acc, value) => {
        const [key, val] = value.split('=');
        return {
          ...acc,
          [key]: val,
        };
      }, {}),
    });

    proc.stdout.on('data', (chunk) => {
      log(' stdout: %o', chunk.toString());
      stdout.push(String(chunk));
    });

    proc.stderr.on('data', (chunk) => {
      log(' stderr: %o', chunk.toString());
      stderr.push(String(chunk));
    });

    proc.on('error', (err) => {
      log(' err: %o', err);
      resolve({
        code: 1,
        stdout: stdout.join('\n'),
        stderr: stderr.join('\n'),
      });
    });

    proc.on('close', (code) => {
      log(' close: %o', code);

      resolve({
        code,
        stdout: stdout.join('\n'),
        stderr: stderr.join('\n'),
      });
    });
  });
}
