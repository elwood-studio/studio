import { randomUUID } from 'crypto';
import type { Json } from '@elwood-studio/types';
import {
  type WorkflowRunnerRuntimeRun,
  type WorkflowRunnerRuntimeRunReport,
} from '@elwood-studio/workflow-runner';

import type { AppContext, WorkflowQueueData } from '../types';
import { startRun } from '../libs/start-run';
import { completeRun } from '../libs/complete-run';
import { getEnv } from '../libs/get-env';
import { updateRun } from '../libs/update-run';
import invariant from 'ts-invariant';

const { skipTeardown: skipWorkflowTeardown } = getEnv();

export default async function register(context: AppContext): Promise<void> {
  const { boss, submitWorkflow } = context;

  invariant(submitWorkflow, 'Must provider submitWorkflow()');

  // run a specific workflow
  await boss.work<WorkflowQueueData, Json>('workflow', async (job) => {
    console.log('received workflow job');
    const { data } = job;
    const tracking_id =
      job.data.tracking_id ?? job.data.input.tracking_id ?? randomUUID();

    // send run to the database
    // a run with this tracking_id might already exist
    // if this is a retry.
    await startRun(context, {
      job_id: job.id,
      tracking_id,
      data,
    });

    let lockUpdate = false;
    let run: WorkflowRunnerRuntimeRun | null = null;

    const watcher = setInterval(() => {
      if (run && lockUpdate === false) {
        lockUpdate = true;

        updateRun(context, {
          job_id: job.id,
          output: run.report,
        }).finally(() => {
          lockUpdate = false;
        });
      }
    }, 1000 * 60);

    // start the run
    run = await submitWorkflow(data.workflow, data.input, data.context);

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
    console.log('complete workflow');

    const { request, state, response, completedOn } = job.data;

    await completeRun(context, {
      job_id: request.id,
      state,
      output: response,
      completed_at: completedOn,
    });
  });
}
