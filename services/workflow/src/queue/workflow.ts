import type { Workflow } from '@elwood-studio/workflow-types';
import type { JsonObject, Json } from '@elwood-studio/types';
import { RunnerStatus } from '@elwood-studio/workflow-runner';

import type { ServerContext } from '../types';

type WorkflowInput = {
  helloWorld?: boolean;
  workflow: Workflow;
  input: JsonObject;
};

export default async function register(context: ServerContext): Promise<void> {
  const { boss, submitWorkflow } = context;

  // run a specific workflow
  await boss.work<WorkflowInput, Json>('workflow', async (job) => {
    console.log('received job', job.data);
    const { data } = job;

    if (data.helloWorld === true) {
      return data;
    }

    const run = await submitWorkflow(data.workflow, data.input);

    if (run.status === RunnerStatus.Error) {
      throw new Error(run.statusText);
    }

    return run.report;
  });
}
