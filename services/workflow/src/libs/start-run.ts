import type { ServerContext, WorkflowQueueData } from '../types';

export type StartRunOptions = {
  job_id: string;
  tracking_id: string;
  data: WorkflowQueueData;
};

export async function startRun(
  context: ServerContext,
  options: StartRunOptions,
): Promise<void> {
  const { db } = context;
  const { tracking_id, job_id, data } = options;

  try {
    const currentRun = await db.executeSql(
      `SELECT "id" FROM elwood.run WHERE "id" = $1`,
      [tracking_id],
    );

    if (currentRun.rowCount === 0) {
      const type = data.source === 'event' ? 'EVENT' : 'USER';

      await db.executeSql(
        `INSERT INTO elwood.run ("id","event_id","trigger","name","input", "job_id") VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          tracking_id,
          data.source_id,
          type,
          data.workflow.name,
          data.input,
          [job_id],
        ],
      );
    } else {
      await db.executeSql(
        `UPDATE elwood.run SET job_id = jobs || $2 WHERE id = $1`,
        [tracking_id, [job_id]],
      );
    }
  } catch (err) {
    console.log((err as Error).message);
    console.log((err as Error).stack);

    throw err;
  }
}
