import { extname, join } from 'node:path';
import ora from 'ora';
import { invariant } from 'ts-invariant';
import fs from 'fs-jetpack';
import Table from 'cli-table';
import * as yaml from 'yaml';
import chalk from 'chalk';

import type { JsonObject } from '@elwood-studio/types';
import type { Workflow } from '@elwood-studio/workflow-types';
import { resolveWorkflow } from '@elwood-studio/workflow-config';

import type { Argv, Arguments, Context } from '../types.ts';
import { printErrorMessage, printMessage } from '../libs/print-message.ts';

type TopOptions = RunOptions &
  ReportOptions & {
    command?: 'run' | 'report';
    arguments: string[];
  };

type RunOptions = {
  workflow?: string;
  input?: string[];
};

type ReportOptions = {
  trackingId?: string;
  output: 'table' | 'json' | 'json-pretty' | 'yaml';
};

export async function register(cli: Argv) {
  cli.command<TopOptions>(
    'workflow <command> [...arguments]',
    false,
    () => {
      return;
    },
    async (args: Arguments<TopOptions>) => {
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

  cli.command(
    'workflow:run <workflow>',
    'run a workflow',
    (y) => {
      y.option('input', {
        alias: 'i',
        type: 'string',
        array: true,
      }).option('wait', {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'Wait for the workflow to complete and return the result',
      });
    },
    run,
  );

  cli.command<ReportOptions>(
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

  cli.hide('workflow');
}

export async function run(args: Arguments<RunOptions>) {
  invariant(args.workflow, 'Workflow is required');

  const context = args.context as Required<Context>;
  const spin = ora('Sending workflow...').start();

  try {
    const input = getInput(args.input ?? []);
    const workflow = await getWorkflow(
      args.workflow,
      context.workingDir.join(''),
    );

    let result: { tracking_id?: string } = {};

    if (args.local) {
      result = await context.localClient.workflow.run(workflow, input);
    }

    if (!args.local) {
      result = { tracking_id: undefined };
    }

    invariant(result.tracking_id, 'Unable to find Tracking ID in response');

    spin.succeed(`Workflow send complete!`);
    spin.stop();
    spin.clear();

    printMessage({
      type: 'success',
      title: 'Workflow Sent!',
      message: `Your workflow has been submitted. Tracking id: ${result.tracking_id}`,
      body: [
        'Check the status of the workflow by running:',
        `elwood-studio workflow:report ${result.tracking_id}`,
      ],
    });
  } catch (e) {
    spin.stop();
    printErrorMessage(e as Error);
  }
}

export async function report(args: Arguments<ReportOptions>) {
  invariant(args.trackingId, 'Tracking ID is required');
  const context = args.context as Required<Context>;
  const result = await context.localClient.workflow.report(args.trackingId);

  invariant(result, 'Unable to find workflow report');

  switch (args.output) {
    case 'json-pretty': {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      break;
    }
    case 'json': {
      process.stdout.write(JSON.stringify(result));
      break;
    }
    case 'yaml': {
      process.stdout.write(yaml.stringify(result));
      break;
    }
    default: {
      for (const job of result.jobs) {
        process.stdout.write(`${chalk.bold(job.name)}\n`);
        process.stdout.write(
          `Result: ${job.status.value} ${job.status.reason}\n`,
        );

        const tbl = new Table({
          head: ['Step', 'Status', 'Output'],
        });

        for (const step of job.steps) {
          tbl.push([
            step.name,
            step.status,
            JSON.stringify(
              {
                output: step.output,
                stdout: step.stdout,
                stderr: step.stderr,
              },
              null,
              2,
            ) ?? '',
          ]);
        }

        console.log(tbl.toString());
      }
    }
  }
}

export function getInput(raw: string[]): JsonObject {
  return raw.reduce((acc, cur) => {
    const [key, ...value] = cur.split('=');

    return {
      ...acc,
      [key]: value.join('='),
    };
  }, {} as JsonObject);
}

export async function getWorkflow(
  value: string,
  workingDir: string,
): Promise<Workflow> {
  if (await fs.existsAsync(value)) {
    return resolveWorkflow(await fs.readAsync(value), {
      parseAs: extname(value) as '.yml' | '.yaml' | '.json',
    });
  }

  const possibleFileLocations = [
    join(process.cwd(), value),
    join(workingDir, 'workflows', value),
    join(workingDir, value),
  ];

  for (const file of possibleFileLocations) {
    if (await fs.existsAsync(file)) {
      return await getWorkflow(file, workingDir);
    }
  }

  // assume it's a yaml blob
  return resolveWorkflow(value);
}
