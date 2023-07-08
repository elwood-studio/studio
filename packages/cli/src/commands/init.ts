import { invariant } from '@elwood/common';

import type { Arguments, Argv, Context } from '../types.ts';
import { printSuccessMessage } from '../libs/print-message.ts';
import { buildWorkingDir } from '../builder/working.ts';

export type Options = {
  force?: boolean;
};

export async function register(cli: Argv) {
  cli.command<Options>(
    'init',
    'initialize a new project in the current directory',
    (y) => {
      y.option('force', {
        type: 'boolean',
        default: false,
      });
    },
    async (args: Arguments<Options>) => {
      const context = args.context as Context;
      const { workingDir: wd } = context;

      if (args.force) {
        await wd.remove();
      }

      invariant(
        wd.exists() === false,
        `Directory ${wd.join('')} already exists.`,
      );

      await buildWorkingDir({ context });

      printSuccessMessage(`Initialized new project in ${wd.join('')}`);
    },
  );
}
