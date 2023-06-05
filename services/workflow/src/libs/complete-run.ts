import type { JsonObject } from '@elwood-studio/types';
import type { ServerContext } from '../types';

type CompleteRunOptions = {
  job_id: string;
  state: string;
  output: JsonObject;
  completed_at: string;
};

export async function completeRun(
  context: ServerContext,
  options: CompleteRunOptions,
): Promise<void> {
  const { db } = context;
  const { job_id, state, output, completed_at } = options;

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
