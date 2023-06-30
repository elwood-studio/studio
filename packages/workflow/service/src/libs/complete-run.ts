import {
  RunnerStatus,
  type WorkflowRunnerRuntimeRunReport,
} from '@elwood/workflow-runner';

import type { AppContext } from '../types.ts';
import { JsonObject } from '@elwood/types';

type CompleteRunOptions = {
  job_id: string;
  state: string;
  report: WorkflowRunnerRuntimeRunReport;
  completed_at: string;
};

export async function completeRun(
  context: AppContext,
  options: CompleteRunOptions,
): Promise<void> {
  const { db } = context;
  const { job_id, report, completed_at } = options;
  const output = getOutputFromReport(report);
  let state = options.state;

  switch (report.status.value) {
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
        "report" = $4,
        "completed_at" = $5 
      WHERE 
        $1 IN("job_id")`,
    [[job_id], state, output, report, completed_at],
  );
}

export function getOutputFromReport(
  report: WorkflowRunnerRuntimeRunReport | undefined,
): JsonObject {
  if (!report) {
    return {};
  }

  return report.jobs.reduce((acc, job) => {
    return {
      ...acc,
      [job.name]: Object.values(job.steps).reduce((acc, step) => {
        return {
          ...acc,
          [step.name]: step.output ?? {},
        };
      }, {} as JsonObject),
    };
  }, {} as JsonObject);
}
