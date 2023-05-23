import type { Argv, Arguments } from '../types.ts';

export type Options = {
  force?: boolean;
};

export default async function register(cli: Argv) {
  cli.command<Options>(
    'create',
    'create a new project',
    (y) => {
      y.option('force', {
        type: 'boolean',
        default: false,
      });
    },
    async (args: Arguments<Options>) => {},
  );
}
