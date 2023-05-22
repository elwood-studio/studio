import fastify from 'fastify';
import { stat } from 'node:fs/promises';
import PgBoss from 'pg-boss';
import PgDatabase from 'pg-boss/src/db';
import { WorkflowRunnerRuntime } from '@elwood-studio/workflow-runner';

import type { ServerContext } from './types';
import { createWorkflowRuntime } from './libs/create-runtime';
import { submitWorkflow } from './libs/submit-workflow';
import { getConfig } from './libs/get-config';

import registerWorkflowQueue from './queue/workflow';
import registerEventQueue from './queue/event';

import jobHandlerPlugin from './handlers/job';

let db: PgDatabase | null = null;
let boss: PgBoss | null = null;
let workflowRuntime: WorkflowRunnerRuntime | null = null;

const { dataDir, dbUrl, workingDir, actionsDir, host, port } = getConfig();
const app = fastify({ logger: true });

async function main() {
  console.log('checking for dirs...');

  // make sure both dirs exist
  await stat(workingDir);
  await stat(dataDir);

  console.log('starting boss...');

  // create our own db connection so we can
  // pass it down to event handlers
  db = new PgDatabase({ connectionString: dbUrl });

  await db.open();

  // lets get boss going
  boss = new PgBoss({
    db,
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

  console.log('boss started...');
  console.log('creating runtime...');

  // setup the workflow runtime
  const [runtime, secretsManager] = await createWorkflowRuntime({
    workingDir,
    dataDir,
    actionsDir,
  });

  console.log('runtime started...');

  workflowRuntime = runtime;

  const context: ServerContext = {
    boss,
    db,
    submitWorkflow(workflow, input) {
      return submitWorkflow({
        runtime,
        secretsManager,
        workflow,
        input,
      });
    },
  };

  console.log('registering queues...');

  await registerWorkflowQueue(context);
  await registerEventQueue(context);

  app.register(jobHandlerPlugin, {
    prefix: '/job',
    context,
  });

  app.listen(
    {
      port,
      host,
    },
    function (err) {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
    },
  );
}

main()
  .then(() => {
    console.log('Workflow watcher started successfully');
  })
  .catch((err) => {
    console.log(`Error: ${err.message}`);
    console.log(err.stack);
    process.exit(1);
  });

// catch a sigint and stop boss before
// exiting
process.on('SIGINT', async () => {
  // stop
  db && (await db.close());
  boss && (await boss.stop());
  workflowRuntime && (await workflowRuntime.teardown());
  app && (await app.close());

  // null out
  boss = null;
  workflowRuntime = null;

  process.exit();
});
