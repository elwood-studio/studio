import type {
  Argv,
  Arguments,
  WorkflowOptions,
  WorkflowRunOptions,
  WorkflowExecuteOptions,
  WorkflowReportOptions,
} from '../../types.ts';

import { run } from './run.ts';
import { execute } from './execute.ts';
import { report } from './report.ts';
import { config } from './config.ts';

export async function register(cli: Argv) {
  cli.command<WorkflowOptions>(
    'workflow <command> [...arguments]',
    false,
    () => {
      return;
    },
    async (args: Arguments<WorkflowOptions>) => {
      const commandArguments = args.arguments ?? [];

      switch (args.command) {
        case 'run': {
          await run({
            ...args,
            workflow: commandArguments[0],
          });
          break;
        }
        case 'report': {
          await report({
            ...args,
            trackingId: commandArguments[0],
          });
          break;
        }
      }
    },
  );

  cli.command<WorkflowRunOptions>(
    'workflow:run [workflow]',
    'run a workflow',
    (y) => {
      y.option('input', {
        alias: 'i',
        type: 'string',
        array: true,
      });
      y.option('wait', {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'Wait for the workflow to complete and return the result',
      });
      y.option('force', {
        alias: 'f',
        type: 'boolean',
        default: true,
        describe: 'Override the "when" of the workflow with "*"',
      });
      y.option('event', {
        alias: 'e',
        type: 'string',
        describe: 'Name of the event that triggered the workflow',
      });
    },
    run,
  );

  cli.command<WorkflowReportOptions>(
    'workflow:report <tracking-id>',
    'Get the report of a workflow',
    (y) => {
      y.option('output', {
        alias: 'o',
        type: 'string',
        describe: 'Output format',
        choices: ['json', 'json-pretty', 'yaml', 'table'],
        default: 'table',
      });
    },
    report,
  );

  cli.command<WorkflowExecuteOptions>(
    'workflow:execute <workflow>',
    'Execute a workflow directly, without the local or remote API',
    (y) => {
      y.option('input', {
        alias: 'i',
        type: 'string',
        array: true,
      });
      y.option('force', {
        alias: 'f',
        type: 'boolean',
        default: true,
      });
      y.option('event', {
        alias: 'e',
        type: 'string',
        describe: 'Name of the event that triggered the workflow',
      });
    },
    execute,
  );

  cli.command<WorkflowExecuteOptions>(
    'workflow:config [workflow]',
    'List all workflow configurations registered with the server',
    () => {
      return;
    },
    config,
  );

  cli.hide('workflow');
}
