import type { Argv, Arguments } from '../types.ts';

export default async function register(cli: Argv) {
  cli.command(
    'fs copy',
    'copy a file to/from the server',
    (y) => {},
    async (args: Arguments) => {},
  );

  cli.command(
    'fs sync',
    'sync a folder to/from the server',
    (y) => {},
    async (args: Arguments) => {},
  );

  cli.command(
    'fs share',
    'share a file',
    (y) => {},
    async (args: Arguments) => {},
  );
}
