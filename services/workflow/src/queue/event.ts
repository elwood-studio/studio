import { randomUUID } from 'crypto';

import type { Json, JsonObject } from '@elwood-studio/types';

import type { ServerContext } from '../types';
import { findWorkflow } from '../libs/find-workflow';
import { getConfig } from '../libs/get-config';

const { gatewayUrl } = getConfig();

type EventWorkInput = {
  event_id: string;
  payload: {
    input?: JsonObject;
    object_id?: string;
    new_state?: string;
    previous_state?: string;
  };
};

export default async function register(context: ServerContext): Promise<void> {
  const { boss, db } = context;

  // respond to any event that comes in
  // event's might trigger other workflows
  await boss.work<EventWorkInput, Json>('event:*', async (job) => {
    console.log('event:*', job.data);

    const { event_id, payload } = job.data;
    const eventType = job.name.replace('event:', '').trim();
    let result: JsonObject = {};

    switch (eventType) {
      case 'ping': {
        result = { value: 'pong' };
        break;
      }
      default: {
        const workflows = await findWorkflow();
        const input: JsonObject = payload.input ?? {};
        const tracking_id = input.tracking_id ?? randomUUID();
        const context: JsonObject = {
          event: eventType,
          elwood: {
            sub: '',
            role: '',
            job_id: job.id,
            tracking_id,
            gateway_url: gatewayUrl,
            event: {
              id: event_id,
              type: eventType,
            },
            has_object: false,
          },
        };

        if (workflows.length === 0) {
          return {
            error: 'Unable to find any workflows',
          };
        }

        if (payload.object_id) {
          const rows = await db.executeSql(
            'SELECT * FROM elwood.object WHERE id = $1',
            [payload.object_id],
          );
          context.elwood.has_object = true;
          context.elwood.object = rows.rows[0];
          context.elwood.object.uri = `elwood://o/${payload.object_id}`;
        }

        // send a new job for each insert
        await boss.insert(
          workflows.map((workflow) => ({
            name: 'workflow',
            singletonKey: tracking_id,
            onComplete: true,
            data: {
              workflow,
              input: {
                ...input,
                tracking_id,
              },
              context,
              source: 'event',
              source_id: job.data.event_id,
              source_name: job.name,
              source_job_id: job.id,
            },
          })),
        );
      }
    }

    //
    await db.executeSql(
      `UPDATE elwood.event SET has_processed = true WHERE id = $1`,
      [event_id],
    );

    return result;
  });
}
