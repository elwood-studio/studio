import { Argv, Arguments } from 'yargs';

import {
  workingDirManager,
  WorkingDirManager,
} from '../libs/working-dir-manager';
import { buildDockerCompose } from '../libs/build-docker-compose';

export type Options = {};

export default async function register(cli: Argv) {
  cli.command<Options>(
    'serve',
    'start the server using docker-compose',
    (y) => {},
    async (args: Arguments<Options>) => {
      await handler(workingDirManager(args), {});
    },
  );
}

export async function handler(workingDir: WorkingDirManager, options: Options) {
  await workingDir.writeYaml(
    '.build/docker-compose.yml',
    await buildDockerCompose(),
  );

  await workingDir.writeEnv('.build/.env', {
    a: 'b',
  });
}
