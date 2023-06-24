import { resolve, join } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { config } from 'dotenv';

import type { Arguments } from './types.ts';
import { getVersion } from './libs/get-version.ts';
import { createContext } from './libs/create-context.ts';
import { printErrorMessage } from './libs/print-message.ts';
import { register as registerServe } from './commands/local.ts';
import { register as registerInit } from './commands/init.ts';
import { register as registerWorkflow } from './commands/workflow.ts';
import { register as registerFs } from './commands/fs.ts';
import { register as registerCreate } from './commands/create.ts';

export async function main(argv: string[]) {
  config({
    path: join(process.cwd(), '.env'),
  });

  const rawArgs = hideBin(argv);
  const cli = yargs(rawArgs);

  cli
    .scriptName('elwood')
    .version('version', await getVersion())
    .usage('Usage: $0 <command> [options]')
    .help('help')
    .alias('help', 'h')
    .env('ELWOOD')
    .option('root-dir', {
      alias: 'r',
      type: 'string',
      describe: 'Change the root directory of the project.',
      default: '.',
    })
    .option('local', {
      alias: 'l',
      type: 'boolean',
      describe: 'Run commands against the local instance.',
      default: false,
    })
    .option('api-url', {
      type: 'string',
      describe: 'Base URL for the remote API',
      default: 'https://api.elwood.studio',
    })
    .option('project-id', {
      type: 'string',
      describe: 'ID of the Elwood Studio project',
    })
    .command(
      '$0',
      'Show help',
      () => {
        return;
      },
      (args) => {
        if (args._.length === 0) {
          cli.showHelp();
          return;
        }

        printErrorMessage(`Unknown command: ${args._[0]}`);
      },
    )
    .middleware(async (argv) => {
      argv.rootDir = resolve(argv.rootDir ?? '.');
      argv.context = await createContext(argv as Arguments);
    })
    .fail((msg, err) => {
      printErrorMessage(err ?? msg);
      process.exit(1);
    });

  registerServe(cli);
  registerInit(cli);
  registerFs(cli);
  registerWorkflow(cli);
  registerCreate(cli);

  try {
    cli.parse();
  } catch (err) {
    console.log('fail');
  }
}
