import { type WorkflowRunnerRuntimeRunReport } from '@elwood/workflow-runner';

import type { AppContext, WorkflowQueueData } from '../types.ts';

export type StartRunOptions = {
  job_id: string;
  tracking_id: string;
  data: WorkflowQueueData;
  report?: WorkflowRunnerRuntimeRunReport;
};

export async function startRun(
  context: AppContext,
  options: StartRunOptions,
): Promise<void> {
  const { db } = context;
  const { tracking_id, job_id, data, report } = options;

  try {
    const currentRun = await db.executeSql(
      `SELECT "id" FROM elwood.run WHERE "id" = $1`,
      [tracking_id],
    );

    if (currentRun.rowCount === 0) {
      const type = data.source === 'event' ? 'EVENT' : 'USER';

      await db.executeSql(
        `INSERT INTO elwood.run ("id", "state", "event_id", "trigger", "name", "input", "job_id", "output") VALUES ($1,'active',$2,$3,$4,$5,$6,$7)`,
        [
          tracking_id,
          data.source_id,
          type,
          data.instructions.name,
          data.input,
          [job_id],
          report ?? {},
        ],
      );
    } else {
      await db.executeSql(
        `UPDATE elwood.run SET job_id = job_id || $2, state = 'active', output = $3 WHERE id = $1`,
        [tracking_id, [job_id], report ?? {}],
      );
    }
  } catch (err) {
    console.log((err as Error).message);
    console.log((err as Error).stack);

    throw err;
  }
}
