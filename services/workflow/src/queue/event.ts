import type { Json, JsonObject } from '@elwood-studio/types';

import type { ServerContext } from '../types';
import { findWorkflow } from '../libs/find-workflow';
import { getConfig } from '../libs/get-config';

const { gatewayUrl } = getConfig();

type EventWorkInput = {
  objectId: string;
  eventType: string;
  previousState: string;
  trackingId: string;
};

export default async function register(context: ServerContext): Promise<void> {
  const { boss, db } = context;

  // respond to any event that comes in
  // event's might trigger other workflows
  await boss.work<EventWorkInput, Json>('event', async (job) => {
    console.log('event:*', job.data);

    const workflows = await findWorkflow();
    const input: JsonObject = {};
    const eventType = job.name.replace('event:', '').trim();
    const context: JsonObject = {
      eventType,
      elwood: {
        sub: '',
        role: '',
        job_id: job.id,
        tracking_id: '',
        gateway_url: gatewayUrl,
        event: {
          type: eventType,
        },
        has_object: false,
      },
    };

    if (job.data.objectId) {
      const rows = await db.executeSql(
        'SELECT * FROM elwood.object WHERE id = $1',
        [job.data.objectId],
      );
      context.elwood.has_object = true;
      context.elwood.object = rows.rows[0];
      context.elwood.object.uri = `elwood://${job.data.objectId}`;
    }

    // send a new job for each insert
    await boss.insert(
      workflows.map((workflow) => ({
        name: 'workflow',
        data: {
          workflow,
          input,
          context,
          source: job.name,
          sourceJobId: job.id,
        },
      })),
    );
  });
}
