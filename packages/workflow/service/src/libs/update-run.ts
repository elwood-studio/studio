import { type WorkflowRunnerRuntimeRunReport } from '@elwood/workflow-runner';

import type { AppContext } from '../types.ts';

type UpdateRunOptions = {
  job_id: string;
  report: WorkflowRunnerRuntimeRunReport;
};

export async function updateRun(
  context: AppContext,
  options: UpdateRunOptions,
): Promise<void> {
  const { db } = context;
  const { job_id, report } = options;

  // merge in output and reset report to latest provided
  await db.executeSql(
    `
      UPDATE elwood.run 
      SET 
        "report" = $2
      WHERE 
        $1 IN("job_id")`,
    [[job_id], report],
  );
}
