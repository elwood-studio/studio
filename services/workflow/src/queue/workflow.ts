import { randomUUID } from 'crypto';
import type { Json } from '@elwood-studio/types';
import {
  RunnerStatus,
  type WorkflowRunnerRuntimeRunReport,
} from '@elwood-studio/workflow-runner';

import type { ServerContext, WorkflowQueueData } from '../types';
import { startRun } from '../libs/start-run';
import { completeRun } from '../libs/complete-run';

export default async function register(context: ServerContext): Promise<void> {
  const { boss, submitWorkflow } = context;

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

    // start the run
    const run = await submitWorkflow(data.workflow, data.input, data.context);

    if (run.status === RunnerStatus.Error) {
      throw new Error(run.statusText);
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
