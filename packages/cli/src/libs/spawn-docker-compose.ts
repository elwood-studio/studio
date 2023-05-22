import { spawn } from 'node:child_process';
import { type FileHandle } from 'node:fs/promises';

import type { WorkingDirManager } from '../libs/working-dir-manager.ts';

export type SpawnDockerComposeOptions = {
  command: string;
  workingDir: WorkingDirManager;
  args?: string[];
  stdout?: FileHandle;
  stderr?: FileHandle;
};

export async function spawnDockerCompose(
  options: SpawnDockerComposeOptions,
): Promise<number> {
  const { workingDir, command, stdout, stderr, args = [] } = options;

  return await new Promise<number>((resolve, reject) => {
    const proc = spawn('docker-compose', [
      '--project-name',
      'elwood',
      '-f',
      workingDir.join('local/.build/docker-compose-local.yml'),
      '--env-file',
      workingDir.join('local/.build/.env.local'),
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
