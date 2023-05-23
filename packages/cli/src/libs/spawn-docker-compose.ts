import { spawn } from 'node:child_process';

import type { Context } from '../types.ts';

export type SpawnDockerComposeOptions = {
  command: string;
  env?: string[];
  files?: string[];
  context: Context;
  args?: string[];
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
};

export async function spawnDockerCompose(
  options: SpawnDockerComposeOptions,
): Promise<number> {
  const {
    context,
    command,
    stdout,
    stderr,
    env = [],
    files = [],
    args = [],
  } = options;
  const { workingDir } = context;

  return await new Promise<number>((resolve, reject) => {
    const proc = spawn('docker-compose', [
      '--project-name',
      'elwood',
      ...files.reduce((acc, file) => {
        return ['-f', workingDir.join(file).toString(), ...acc];
      }, [] as string[]),
      ...env.reduce((acc, file) => {
        return ['--env-file', workingDir.join(file).toString(), ...acc];
      }, [] as string[]),
      command,
      ...args,
    ]);

    if (stdout && proc.stdout) {
      proc.stdout.on('data', (chunk) => {
        stdout.write(chunk);
      });
    }

    if (stderr && proc.stderr) {
      proc.stderr.on('data', (chunk) => {
        stderr.write(chunk);
      });
    }

    proc.on('exit', (code) => {
      setTimeout(() => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(code);
        }
      }, 500);
    });
  });
}
