import type { AppContext, WorkflowQueueData } from '../types.ts';

export type CreateRunOptions = {
  tracking_id: string;
  data: WorkflowQueueData;
};

export async function createRun(
  context: AppContext,
  options: CreateRunOptions,
): Promise<void> {
  const { db } = context;
  const { tracking_id, data } = options;

  try {
    await db.executeSql(
      `
      INSERT INTO elwood.run 
        ("id", "state", "event_id", "trigger", "name", "input") VALUES 
        ($1, 'created', $2, $3, $4, $5)`,
      [tracking_id, data.source_id, 'EVENT', data.workflow.name, data.input],
    );
  } catch (err) {
    console.log((err as Error).message);
    console.log((err as Error).stack);

    throw err;
  }
}
