import type { Argv, Arguments } from '../types.ts';

export type Options = {
  force?: boolean;
};

export async function register(cli: Argv) {
  cli.command<Options>(
    'create',
    'create a new project',
    (y) => {
      y.option('force', {
        type: 'boolean',
        default: false,
      });
    },
    async (_args: Arguments<Options>) => {
      return;
    },
  );
}
