import { invariant } from 'ts-invariant';
import { Writable } from 'node:stream';
import ora from 'ora';

import type { Argv, Arguments } from '../types.ts';
import { spawnDockerCompose } from '../libs/spawn-docker-compose.ts';
import { buildLocal } from '../builder/local.ts';
import { FilePaths } from '../constants.ts';

type StartOptions = {
  dryRun?: boolean;
};

type StopOptions = {};

export default async function register(cli: Argv) {
  const files = [FilePaths.LocalBuildDockerCompose];
  const env = [FilePaths.LocalDotEnv, FilePaths.LocalBuildDotEnv];

  cli.command<StartOptions>(
    'start',
    'start the server using docker-compose',
    (y) => {
      y.option('dry-run', {
        type: 'boolean',
        default: false,
      });
    },
    async (args: Arguments<StartOptions>) => {
      const spin = ora('Starting...').start();

      const workingDir = args.context!.workingDir;
      workingDir.require();

      spin.text = 'Building local files...';

      await buildLocal({ context: args.context! });

      if (args.dryRun) {
        spin.succeed('Dry run complete!');
        spin.stop();
        return;
      }

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

  cli.command<StopOptions>(
    'stop',
    'stop the server',
    (y) => {},
    async (args: Arguments<StopOptions>) => {
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
