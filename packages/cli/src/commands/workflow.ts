import { EOL } from 'node:os';
import { extname, join } from 'node:path';
import ora from 'ora';
import { invariant } from 'ts-invariant';
import fs from 'fs-jetpack';
import Table from 'cli-table';
import * as yaml from 'yaml';
import chalk from 'chalk';

import { normalizeWorkflowToInstructions } from '@elwood-studio/workflow-config';
import type { JsonObject } from '@elwood-studio/types';
import type { Workflow } from '@elwood-studio/workflow-types';
import { resolveWorkflow } from '@elwood-studio/workflow-config';
import {
  createUnlockKey,
  createKeyPair,
  SecretsManager,
} from '@elwood-studio/workflow-secrets';
import { createRuntime, runWorkflow } from '@elwood-studio/workflow-runner';

import type { Argv, Arguments, Context } from '../types.ts';
import { printErrorMessage, printMessage } from '../libs/print-message.ts';

type TopOptions = RunOptions &
  ReportOptions &
  ExecuteOptions &
  SecretOptions & {
    command?: 'run' | 'report' | 'generate-unlock-key' | 'secret' | 'execute';
    arguments: string[];
  };

type RunOptions = {
  workflow?: string;
  input?: string[];
  force?: boolean;
  event?: string;
};

type ReportOptions = {
  trackingId?: string;
  output: 'table' | 'json' | 'json-pretty' | 'yaml';
};

type SecretOptions = {
  unlockKey?: string;
  keyName?: string;
  name?: string;
  value?: string;
};

type ExecuteOptions = {
  wait?: boolean;
  input?: string[];
  workflow?: string;
  output?: ReportOptions['output'];
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
        case 'generate-unlock-key': {
          await generateUnlockKey(args);
          break;
        }
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

  cli.command<RunOptions>(
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

  cli.command<JsonObject>(
    'workflow:generate-unlock-key',
    'Generate a Workflow Unlock Key',
    () => {
      return;
    },
    generateUnlockKey,
  );

  cli.command<SecretOptions>(
    'workflow:secret <name> [value]',
    'Seal or unseal a secret',
    (y) => {
      y.option('unlock-key', {
        alias: 'u',
        type: 'string',
        describe: 'Unlock key',
        demandOption: true,
      });
      y.option('key-name', {
        alias: 'n',
        type: 'string',
        describe: 'Key Name',
      });
    },
    secret,
  );

  cli.command<ExecuteOptions>(
    'workflow:execute <workflow>',
    'Execute a workflow directly, without the local or remote API',
    (y) => {
      y.option('input', {
        alias: 'i',
        type: 'string',
        array: true,
      });
    },
    execute,
  );

  cli.hide('workflow');
}

export async function run(args: Arguments<RunOptions>) {
  const context = args.context as Required<Context>;
  const spin = ora('Sending workflow...').start();

  try {
    const input = getInput(args.input ?? []);
    let result: { tracking_id?: string; event_id?: string } = {};

    invariant(args.workflow || args.event, 'Must provide workflow or event');

    if (args.event) {
      result = await context.client.workflow.event(args.event, input);
    } else if (args.workflow) {
      const workflow = await getWorkflow(
        args.workflow,
        context.workingDir.join(''),
      );

      // force the workflow
      if (args.force !== false) {
        workflow.when = true;
      }
      result = await context.client.workflow.run(workflow, input);
    } else {
      throw new Error('Unable to run workflow or submit event');
    }

    invariant(
      result.tracking_id || result.event_id,
      'Unable to find Tracking ID or Event ID in response',
    );

    spin.succeed(`Send complete!`);
    spin.stop();
    spin.clear();

    if (result.event_id) {
      printMessage({
        type: 'success',
        title: 'Workflow Event Sent!',
        message: `Your workflow event has been submitted. Event id: ${result.event_id}`,
        body: [
          'Check the status of any workflows trigger by this event using running:',
          `elwood-studio workflow:report --event-id=${result.event_id}`,
        ],
      });
    } else {
      printMessage({
        type: 'success',
        title: 'Workflow Sent!',
        message: `Your workflow has been submitted. Tracking id: ${result.tracking_id}`,
        body: [
          'Check the status of the workflow by running:',
          `elwood-studio workflow:report ${result.tracking_id}`,
        ],
      });
    }
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

  outputReport(args.output, result);
}

export function outputReport(
  output: ReportOptions['output'],
  result: JsonObject,
): void {
  switch (output) {
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

export async function generateUnlockKey(
  _args: Arguments<JsonObject>,
): Promise<void> {
  process.stdout.write((await createUnlockKey()).toString('base64') + EOL);
}

export async function secret(args: Arguments<SecretOptions>): Promise<void> {
  invariant(args.unlockKey, 'Unlock key is required');
  invariant(args.name, 'Secret name is required');

  const sm = new SecretsManager(Buffer.from(args.unlockKey, 'base64'));
  const [pub, priv] = await createKeyPair();
  const key = sm.createKey('root', pub, priv);

  if (args.value) {
    const sealedValue = await sm
      .createSecret(key, args.name, args.value)
      .seal();
    const sealedKey = await key.seal();

    return printMessage({
      type: 'success',
      message: 'Sealed secret',
      body: [`Secret: ${sealedValue}`, ` Key: ${sealedKey}`],
    });
  }
}

export async function execute(args: Arguments<ExecuteOptions>): Promise<void> {
  const context = args.context as Required<Context>;
  const spin = ora('Executing workflow...').start();

  invariant(args.workflow, 'Unlock key is required');

  const unlockKey = context.localEnv.UNLOCK_KEY;
  const input = getInput(args.input ?? []);

  const workflow = await getWorkflow(
    args.workflow,
    context.workingDir.join(''),
  );

  const runtime = await createRuntime({
    commandServerPort: 4001,
    workingDir: context.workingDir.join('runs'),
    keychainUnlockKey: unlockKey,
    commandContext: 'local',
    context: 'local',
    staticFiles: {
      data: context.workingDir.join('data'),
      actions: context.workingDir.join('actions'),
    },
    plugins: [],
  });
  const secretsManager = new SecretsManager(Buffer.from(unlockKey, 'base64'));
  const instructions = await normalizeWorkflowToInstructions(workflow);

  spin.text = 'Starting...';

  runtime.on('runStarted', (o) => {
    spin.text = `Step: ${o.def.id}`;
  });

  const run = await runWorkflow({
    runtime,
    secretsManager,
    instructions,
    input,
  });

  spin.succeed(`Execution complete!`);

  outputReport(args.output ?? 'table', run.report);

  await run.teardown();
  await runtime.teardown();
}
