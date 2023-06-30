import { AppContext } from '@/types.ts';
import { invariant } from './invariant.ts';

export async function cancelRun(context: AppContext, id: string) {
  const { db, boss } = context;

  const { rows } = await db.executeSql(
    `SELECT * FROM elwood.run WHERE id = $1`,
    [id],
  );

  invariant(rows.length === 1, 'Run not found');

  const run = rows[0];

  for (const jobId of run.job_id) {
    await boss.cancel(jobId);
  }
}
