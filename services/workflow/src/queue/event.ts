import type { Json, JsonObject } from '@elwood-studio/types';

import type { QueueRegisterContext } from '../types';
import { findWorkflow } from '../libs/find-workflow';

type EventWorkInput = {
  objectId: string;
  eventType: string;
  previousState: string;
};

export default async function register(
  context: QueueRegisterContext,
): Promise<void> {
  const { boss, db } = context;

  // respond to any event that comes in
  // event's might trigger other workflows
  await boss.work<EventWorkInput, Json>('event', async (job) => {
    console.log('event:*', job.data);

    const workflows = await findWorkflow();
    const input: JsonObject = job.data;

    if (job.data.objectId) {
      const rows = await db.executeSql(
        'SELECT * FROM elwood.object WHERE id = $1',
        [job.data.objectId],
      );
      input.object = rows.rows[0];
    }

    // send a new job for each insert
    await boss.insert(
      workflows.map((workflow) => ({
        name: 'workflow',
        data: {
          workflow,
          input,
          source: job.name,
          sourceJobId: job.id,
        },
      })),
    );
  });
}
