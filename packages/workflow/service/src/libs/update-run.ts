import { type WorkflowRunnerRuntimeRunReport } from '@elwood-studio/workflow-runner';

import type { AppContext } from '../types.ts';

type UpdateRunOptions = {
  job_id: string;
  output: WorkflowRunnerRuntimeRunReport;
};

export async function updateRun(
  context: AppContext,
  options: UpdateRunOptions,
): Promise<void> {
  const { db } = context;
  const { job_id, output } = options;

  await db.executeSql(
    `
      UPDATE elwood.run 
      SET 
        "output" = $2,    
      WHERE 
        $1 IN("job_id")`,
    [[job_id], output],
  );
}
