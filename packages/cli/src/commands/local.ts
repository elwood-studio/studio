import { invariant } from 'ts-invariant';
import { Writable } from 'node:stream';
import ora from 'ora';

import type { Argv, Arguments } from '../types.ts';
import { spawnDockerCompose } from '../libs/spawn-docker-compose.ts';
import { buildLocal } from '../builder/local.ts';
import { FilePaths } from '../constants.ts';

export type Options = {};

export default async function register(cli: Argv) {
  const files = [FilePaths.LocalBuildDockerCompose];
  const env = [FilePaths.LocalDotEnv, FilePaths.LocalBuildDotEnv];

  cli.command<Options>(
    'start',
    'start the server using docker-compose',
    (y) => {},
    async (args: Arguments<Options>) => {
      const spin = ora('Starting...').start();

      const workingDir = args.context!.workingDir;
      workingDir.require();

      spin.text = 'Building local files...';

      await buildLocal({ context: args.context! });

      spin.text = 'Starting server on docker-compose...';

      class SpinStream extends Writable {
        _write(chunk: any): void {
          spin.text = chunk.toString();
        }
      }

      const stream = new SpinStream();
      const code = await spawnDockerCompose({
        context: args.context!,
        command: 'up',
        args: ['-d'],
        stdout: stream,
        stderr: stream,
        env,
        files,
      });

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
      const spin = ora('Stopping server...').start();
      const code = await spawnDockerCompose({
        context: args.context!,
        command: 'down',
        env,
        files,
      });

      spin.text = 'Cleaning build folder...';

      await args.context!.workingDir.remove('local/.build');

      spin.succeed('Server stopped!');
      spin.stop();

      invariant(code === 0, 'Unable to stop server. Docker-compose failed.');
    },
  );
}
