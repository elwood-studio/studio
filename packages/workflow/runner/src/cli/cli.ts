import { join } from 'path';
import { EOL, homedir } from 'os';

import yargs from 'yargs-parser';
import invariant from 'ts-invariant';
import { config as dotenv } from 'dotenv';

import { SecretsManager } from '@elwood/workflow-secrets';
import {
  normalizeWorkflowToInstructions,
  createWorkflowInput,
  validateWorkflow,
  validateWorkflowInput,
} from '@elwood/workflow-config';

import type { WorkflowRunnerCliArguments } from '../types';
import { createRuntime } from '../libs/create-runtime';
import { runWorkflow } from '../libs/run-workflow';
import debug from '../libs/debug';

import { resolveWorkflowPayload } from './payload';
import { printResult } from './print';
import { resolveConfig } from './config';

const log = debug('cli');

export async function cli(proc: NodeJS.Process): Promise<void> {
  const args = proc.argv.slice(2);
  const envFile = join(process.cwd(), '.env');

  log(`loading env file ${envFile}`);

  dotenv({
    path: envFile,
  });

  const argv = yargs(args) as WorkflowRunnerCliArguments;

  if (args.length === 0) {
    log('no args. printing help');
    [
      'Usage: workflow-runner <workflow> [options]',
      '',
      ' workflow:',
      '  path to a local workflow file. (ts, js, json) or',
      '  url to a remote workflow file. (json)',
      ' options:',
      '  --report print report to stdout',
    ].forEach((ln) => {
      process.stdout.write(ln);
      process.stdout.write(EOL);
    });
    process.exit(0);
  }

  try {
    const payload = await resolveWorkflowPayload(String(argv._[0]));
    const { workflow, secrets = [], keychain = [], unlockKey } = payload;

    invariant(workflow, 'workflow is required');

    const [isWorkflowValid, workflowError] = await validateWorkflow(workflow);

    invariant(
      isWorkflowValid,
      `Workflow is invalid: ${workflowError?.message}`,
    );

    const {
      valid: isWorkflowInputValid,
      value: input,
      errors: workflowInputErrors,
    } = await validateWorkflowInput(
      { ...(payload.input ?? {}), ...(argv.input ?? {}) },
      workflow,
    );

    invariant(
      isWorkflowInputValid,
      `Workflow input is invalid: ${workflowInputErrors
        ?.map((item) => item.message)
        .join(', ')}`,
    );

    let config = await resolveConfig(argv, {
      homeDir: join(argv.homeDir ?? homedir(), '.elwood-studio'),
      unlockKey,
    });

    if (argv.docker === true) {
      config.commandContext = 'container';
      config.context = 'container';
    }

    const runtime = await createRuntime(config);
    const secretsManager = new SecretsManager(
      Buffer.from(config.keychainUnlockKey, 'base64'),
    );

    const rootKey = await secretsManager.createKeyPair('root');

    await secretsManager.addKey(rootKey);

    for (const key of keychain) {
      if (typeof key === 'string') {
        await secretsManager.addKey(key);
        continue;
      }

      const k = secretsManager.createKey(...key);
      await secretsManager.addKey(k);
    }

    for (const secret of secrets) {
      if (typeof secret === 'string') {
        await secretsManager.addSecret(secret);
        continue;
      }

      if (Array.isArray(secret)) {
        if (secret.length === 3) {
          const s = secretsManager.createSecret(
            secretsManager.getKey(secret[0]),
            secret[1],
            secret[2],
          );
          await secretsManager.addSecret(s);
        } else {
          const s = secretsManager.createSecret(rootKey, secret[0], secret[1]);
          await secretsManager.addSecret(s);
        }
        continue;
      }

      const s = secretsManager.createSecret(rootKey, secret.name, secret.value);
      await secretsManager.addSecret(s);
    }

    const run = await runWorkflow({
      runtime,
      secretsManager,
      instructions: await normalizeWorkflowToInstructions(workflow),
      input: createWorkflowInput(input, {
        secrets: await secretsManager.sealAllSecrets(),
        keychain: await secretsManager.sealAllKeys(),
      }),
    });

    await runtime.teardown();

    printResult(run, argv);
  } catch (err) {
    console.log('Unable to execute workflow');
    console.log((err as Error).message);
    console.log((err as Error).stack);
    process.exit(1);
  }
}
