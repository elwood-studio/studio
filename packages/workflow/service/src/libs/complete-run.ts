import {
  RunnerStatus,
  type WorkflowRunnerRuntimeRunReport,
} from '@elwood-studio/workflow-runner';

import type { AppContext } from '../types/index.ts';

type CompleteRunOptions = {
  job_id: string;
  state: string;
  output: WorkflowRunnerRuntimeRunReport;
  completed_at: string;
};

export async function completeRun(
  context: AppContext,
  options: CompleteRunOptions,
): Promise<void> {
  const { db } = context;
  const { job_id, output, completed_at } = options;
  let state = options.state;

  switch (output.status.value) {
    case RunnerStatus.Error: {
      state = 'failed';
      break;
    }
    case RunnerStatus.Skipped: {
      state = 'skipped';
      break;
    }
    default: {
      state = 'completed';
    }
  }

  await db.executeSql(
    `
      UPDATE elwood.run 
      SET 
        "state" = $2, 
        "output" = $3,
        "completed_at" = $4 
      WHERE 
        $1 IN("job_id")`,
    [[job_id], state, output, completed_at],
  );
}
