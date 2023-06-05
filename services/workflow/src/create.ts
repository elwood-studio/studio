import fastify from 'fastify';
import { stat } from 'node:fs/promises';
import PgBoss from 'pg-boss';

import PgDatabase from './libs/db';
import type { ServerContext, WorkflowService } from './types';
import { createWorkflowRuntime } from './libs/create-runtime';
import { submitWorkflow } from './libs/submit-workflow';
import { getConfig } from './libs/get-config';

import registerWorkflowQueue from './queue/workflow';
import registerEventQueue from './queue/event';
import runHandlerPlugin from './handlers/run';
import eventHandlerPlugin from './handlers/event';

const { dataDir, dbUrl, workingDir, actionsDir, host, port } = getConfig();
const app = fastify({ logger: true });

export async function createService(): Promise<WorkflowService> {
  console.log('checking for dirs...');

  // make sure both dirs exist
  await stat(workingDir);
  await stat(dataDir);

  console.log('starting boss...');

  // create our own db connection so we can
  // pass it down to event handlers
  const db = new PgDatabase({ connectionString: dbUrl });

  await db.open();

  // lets get boss going
  const boss = new PgBoss({
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

  const context: ServerContext = {
    boss,
    db,
    submitWorkflow(workflow, input, context) {
      return submitWorkflow({
        runtime,
        secretsManager,
        workflow,
        input,
        context,
      });
    },
  };

  console.log('registering queues...');

  await registerWorkflowQueue(context);
  await registerEventQueue(context);

  app.register(runHandlerPlugin, {
    context,
  });

  app.register(eventHandlerPlugin, {
    context,
  });

  await new Promise((resolve, reject) => {
    app.listen(
      {
        port,
        host,
      },
      function (err) {
        if (err) {
          reject(err);
          return;
        }

        console.log('server started');

        resolve(null);
      },
    );
  });

  return {
    async teardown() {
      runtime && (await runtime.teardown());
      db && (await db.close());
    },
  };
}
