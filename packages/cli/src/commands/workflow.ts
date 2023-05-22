import { Argv, Arguments } from 'yargs';

import { CliArguments } from '../types.ts';

export default async function register(cli: Argv) {
  cli.command(
    'workflow run',
    'run a workflow',
    (y) => {},
    async (args: CliArguments) => {},
  );

  cli.command(
    'workflow [tracking-id]',
    'get the status of a workflow',
    (y) => {},
    async (args: CliArguments) => {},
  );
}
