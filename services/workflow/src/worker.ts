import { stat } from 'node:fs/promises';

import type { AppContext } from './types';
import { createWorkflowRuntime } from './libs/create-runtime';
import { submitWorkflow } from './libs/submit-workflow';
import { getEnv } from './libs/get-env';

import registerWorkflowQueue from './queue/workflow';
import registerEventQueue from './queue/event';

const { dataDir, workingDir, actionsDir, unlockKey } = getEnv();

export async function startWorker(context: AppContext) {
  console.log('checking for dirs...');

  // make sure both dirs exist
  await stat(workingDir);
  await stat(dataDir);

  // setup the workflow runtime
  const [runtime, secretsManager] = await createWorkflowRuntime({
    workingDir,
    dataDir,
    actionsDir,
    unlockKey,
  });

  context.runtime = runtime;
  context.submitWorkflow = function _submitWorkflow(workflow, input, context) {
    return submitWorkflow({
      runtime,
      secretsManager,
      workflow,
      input,
      context,
    });
  };

  console.log('registering queues...');

  await registerWorkflowQueue(context);
  await registerEventQueue(context);

  console.log('boss started...');
}
