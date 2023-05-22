import { Argv, Arguments } from 'yargs';
import { invariant } from 'ts-invariant';

import { workingDirManager } from '../libs/working-dir-manager.ts';
import { spawnDockerCompose } from '../libs/spawn-docker-compose.ts';
import { buildLocal } from '../builder/local.ts';

export type Options = {};

export default async function register(cli: Argv) {
  cli.command<Options>(
    'start',
    'start the server using docker-compose',
    (y) => {},
    async (args: Arguments<Options>) => {
      const workingDir = workingDirManager(args);
      workingDir.require();

      await buildLocal({ workingDir });

      const stdout = await workingDir.open('local/stdout.log');
      const stderr = await workingDir.open('local/stderr.log');

      const code = await spawnDockerCompose({
        workingDir,
        command: 'up',
        args: ['-d'],
        stdout,
        stderr,
      });

      await stdout.close();
      await stderr.close();

      invariant(code === 0, 'Unable to start server. Docker-compose failed.');
    },
  );

  cli.command<Options>(
    'stop',
    'stop the server',
    (y) => {},
    async (args: Arguments<Options>) => {
      const code = await spawnDockerCompose({
        workingDir: workingDirManager(args),
        command: 'down',
      });

      invariant(code === 0, 'Unable to stop server. Docker-compose failed.');
    },
  );
}
