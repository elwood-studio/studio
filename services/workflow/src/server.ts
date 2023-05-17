import { equal } from 'node:assert';
import { stat } from 'node:fs/promises';
import PgBoss from 'pg-boss';
import {
  WorkflowRunnerRuntime,
  createRuntime,
  runWorkflow,
} from '@elwood-studio/workflow-runner';
import {
  SecretsManager,
  createUnlockKey,
} from '@elwood-studio/workflow-secrets';
import {
  normalizeWorkflowToInstructions,
  createWorkflowInput,
} from '@elwood-studio/workflow-config';
import type { Workflow, WorkflowInput } from '@elwood-studio/workflow-types';

let boss: PgBoss | null = null;

const { DATABASE_URL, WORKING_DIR, DATA_DIR } = process.env || {};

async function main() {
  if (boss) {
    return;
  }

  // make sure we have all the required env vars
  // even though we could assume /tmp for the dirs
  // it's better to be explicit
  equal(!!DATABASE_URL, true, 'DATABASE_URL is required');
  equal(!!WORKING_DIR, true, 'WORKING_DIR is required');
  equal(!!DATA_DIR, true, 'DATA_DIR is required');

  // make sure both dirs exist
  await stat(WORKING_DIR);
  await stat(DATA_DIR);

  // lets get boss going
  boss = new PgBoss({
    connectionString: DATABASE_URL,
    max: 5,
    deleteAfterDays: 7,
    archiveCompletedAfterSeconds: 14_400,
    retentionDays: 7,
    retryBackoff: true,
    retryLimit: 20,
    expireInHours: 48,
    monitorStateIntervalSeconds: 30,
  });

  boss.on('error', (error) => {
    console.error('Workflow watcher error');
    console.error(error);
    process.exit(1);
  });

  await boss.start();

  const [runtime, secretsManager] = await setupWorkflowRuntime();

  // respond to an event
  await boss.work('event*', async (job) => {
    console.log('received job', job.data);

    // look for the workflows
  });

  type WorkflowInput = {
    helloWorld?: boolean;
    workflow: Workflow;
    input: WorkflowInput;
  };

  // run a specific workflow
  await boss.work<WorkflowInput, any>('workflow*', async (job) => {
    console.log('received job', job.data);
    const data = job.data;

    if (data.helloWorld === true) {
      return data;
    }

    const run = await runWorkflow({
      runtime,
      secretsManager,
      instructions: await normalizeWorkflowToInstructions(data.workflow),
      input: createWorkflowInput(data.input, {
        secrets: await secretsManager.sealAllSecrets(),
        keychain: await secretsManager.sealAllKeys(),
      }),
    });

    return run.report;
  });
}

async function setupWorkflowRuntime(): Promise<
  [WorkflowRunnerRuntime, SecretsManager]
> {
  const workingDir = WORKING_DIR;
  const keychainUnlockKey = (await createUnlockKey()).toString('base64');
  const runtime = await createRuntime({
    commandServerPort: 4001,
    workingDir,
    keychainUnlockKey,
    commandContext: 'local',
    context: 'local',
    staticFiles: {
      data: DATA_DIR,
    },
    plugins: [],
  });
  const secretsManager = new SecretsManager(
    Buffer.from(keychainUnlockKey, 'base64'),
  );

  return [runtime, secretsManager];
}

main()
  .then(() => {
    console.log('Workflow watcher started');
  })
  .catch((err) => {
    console.log(`Error: ${err.message}`);
    console.log(err.stack);
    process.exit(1);
  });

process.on('SIGINT', () => {
  if (boss) {
    boss.stop().then(() => {
      process.exit();
    });
  }
});
