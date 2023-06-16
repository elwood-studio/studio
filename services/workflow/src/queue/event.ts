import { randomUUID } from 'crypto';

import type { Json, JsonObject } from '@elwood-studio/types';

import type { AppContext } from '../types';
import { findWorkflow } from '../libs/find-workflow';
import { getEnv } from '../libs/get-env';

const { gatewayBaseUrl } = getEnv();

type EventWorkInput = {
  event_id: string;
  payload: {
    input?: JsonObject;
    object_id?: string;
    context: JsonObject;
    trigger?: JsonObject;
  };
  expireInSeconds?: number;
};

export default async function register(context: AppContext): Promise<void> {
  const { boss, db } = context;

  // respond to any event that comes in
  // event's might trigger other workflows
  await boss.work<EventWorkInput, Json>('event:*', async (job) => {
    console.log('event:*', job.data);

    const { event_id, payload, expireInSeconds } = job.data;
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
        const context: JsonObject = {
          ...(payload.context ?? {}),
          event: eventType,
          elwood: {
            sub: '',
            role: '',
            job_id: job.id,
            gateway_url: gatewayBaseUrl,
            event: {
              id: event_id,
              type: eventType,
              trigger: payload.trigger ?? {},
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
          context.elwood.object.uri = `elwood://${payload.object_id}`;
        }

        await boss.insert(
          workflows.map((workflow) => {
            const tracking_id = input.tracking_id ?? randomUUID();

            return {
              name: 'workflow',
              singletonKey: randomUUID(),
              expireInSeconds: expireInSeconds ?? 60 * 60 * 2,
              onComplete: true,
              data: {
                workflow,
                input: {
                  ...input,
                  tracking_id,
                },
                context: {
                  ...context,
                  elwood: {
                    ...context.elwood,
                    tracking_id,
                  },
                },
                source: 'event',
                source_id: job.data.event_id,
                source_name: job.name,
                source_job_id: job.id,
              },
            };
          }),
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
