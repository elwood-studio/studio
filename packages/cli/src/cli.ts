import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import registerServe from './commands/local.ts';
import registerInit from './commands/init.ts';
import registerWorkflow from './commands/workflow.ts';
import registerFs from './commands/fs.ts';

import { renderMessage } from './components/message.tsx';

export async function main(argv: string[]) {
  const rawArgs = hideBin(process.argv);
  const cli = yargs(rawArgs);

  cli
    .scriptName('elwood-studio')
    .help('help')
    .alias('help', 'h')
    .env('ELWOOD')
    .option('root-dir', {
      alias: 'r',
      type: 'string',
      describe: 'Change the root directory of the project.',
      default: process.cwd(),
    })
    .middleware(() => {});

  registerServe(cli);
  registerInit(cli);
  registerFs(cli);
  registerWorkflow(cli);

  cli.fail((msg, err) => {
    console.log(msg, err.stack);
    renderMessage({
      type: 'error',
      text: msg ?? (err as Error).message,
    });
    process.exit(1);
  });

  try {
    cli.parse();
  } catch (err) {
    console.log('fail');
  }

  if (rawArgs.length === 0) {
    cli.showHelp();
  }
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});
