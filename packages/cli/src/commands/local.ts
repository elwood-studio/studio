import { Argv, Arguments } from 'yargs';
import { invariant } from 'ts-invariant';
import ora from 'ora';

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
      const spin = ora('Starting...').start();

      const workingDir = workingDirManager(args);
      workingDir.require();

      spin.text = 'Building local files...';

      await buildLocal({ workingDir });

      spin.text = 'Setting up logging...';

      const stdout = await workingDir.open('local/stdout.log');
      const stderr = await workingDir.open('local/stderr.log');

      spin.text = 'Starting server on docker-compose...';

      const code = await spawnDockerCompose({
        workingDir,
        command: 'up',
        args: ['-d'],
        stdout,
        stderr,
      });

      await stdout.close();
      await stderr.close();

      spin.succeed('Server started!');
      spin.stop();

      invariant(code === 0, 'Unable to start server. Docker-compose failed.');
    },
  );

  cli.command<Options>(
    'stop',
    'stop the server',
    (y) => {},
    async (args: Arguments<Options>) => {
      const workingDir = workingDirManager(args);
      const spin = ora('Stopping server...').start();
      const code = await spawnDockerCompose({
        workingDir,
        command: 'down',
      });

      spin.text = 'Cleaning build folder...';

      await workingDir.remove('local/.build');

      spin.succeed('Server stopped!');
      spin.stop();

      invariant(code === 0, 'Unable to stop server. Docker-compose failed.');
    },
  );
}
