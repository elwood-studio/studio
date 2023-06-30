import { randomUUID } from 'crypto';

import type { Json } from '@elwood/types';
import {
  type WorkflowRunnerRuntimeRunReport,
  startRunWorkflow,
} from '@elwood/workflow-runner';

import type { AppContext, WorkflowQueueData } from '../types.ts';
import { startRun } from '../libs/start-run.ts';
import { completeRun } from '../libs/complete-run.ts';
import { getEnv } from '../libs/get-env.ts';
import { updateRun } from '../libs/update-run.ts';
import { invariant } from '../libs/invariant.ts';

const { skipTeardown: skipWorkflowTeardown } = getEnv();

export default async function register(context: AppContext): Promise<void> {
  const { boss, runtime, secretsManager } = context;

  invariant(runtime, 'runtime is required to run workflows');
  invariant(secretsManager, 'secretsManager is required to run workflows');

  // run a specific workflow
  await boss.work<WorkflowQueueData, Json>('workflow', async (job) => {
    console.log('received workflow job', job.data);
    const { data } = job;
    const tracking_id =
      job.data.tracking_id ?? job.data.input.tracking_id ?? randomUUID();
    const instructions = data.instructions;
    const run = runtime.addRun(instructions, secretsManager);

    await run.setup(data.input, data.context);

    // send run to the database
    // a run with this tracking_id might already exist
    // if this is a retry.
    await startRun(context, {
      job_id: job.id,
      tracking_id,
      data,
    });

    let lockUpdate = false;

    const watcher = setInterval(() => {
      if (run && lockUpdate === false) {
        lockUpdate = true;

        console.log('update tick', run.report.status);

        updateRun(context, {
          job_id: job.id,
          output: run.report,
        }).finally(() => {
          lockUpdate = false;
        });
      }
    }, 1000 * 60);

    // start the run
    await startRunWorkflow(run);

    await run.complete();

    clearInterval(watcher);

    // teardown only if they haven't said skip
    if (skipWorkflowTeardown !== true) {
      await run.teardown();
    }

    // it's tempting to update the run as complete here
    // but don't do that. wait for the onComplete event
    // to handle run updates
    return run.report;
  });

  type Job = {
    data: {
      state: string;
      response: WorkflowRunnerRuntimeRunReport;
      request: {
        id: string;
      };
      completedOn: string;
    };
  };

  // when the job is done
  boss.onComplete('workflow', async (job: Job) => {
    console.log('complete workflow', job.data);

    const { request, state, response, completedOn } = job.data;

    await completeRun(context, {
      job_id: request.id,
      state,
      report: response,
      completed_at: completedOn,
    });
  });
}
