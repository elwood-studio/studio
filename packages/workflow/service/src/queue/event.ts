import { randomUUID } from 'crypto';

import type { Json, JsonObject } from '@elwood/types';

import type { AppContext } from '../types.ts';
import { findWorkflow } from '../libs/find-workflow.ts';
import { getEnv } from '../libs/get-env.ts';

const { gatewayBaseUrl } = getEnv();

type EventWorkInput = {
  event_id: string;
  payload: {
    workflow?: JsonObject;
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

    const jobIds: Array<string | null> = [];
    const { event_id, payload, expireInSeconds } = job.data;
    const eventType = job.name.replace('event:', '').trim();

    switch (eventType) {
      case 'ping': {
        break;
      }
      default: {
        const workflows = [];

        if (eventType === 'workflow') {
          workflows.push(payload.workflow);
        } else {
          workflows.push(...(await findWorkflow()));
        }

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

        for (const workflow of workflows) {
          const tracking_id = randomUUID();

          jobIds.push(
            await boss.send(
              'workflow',
              {
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
              {
                singletonKey: randomUUID(),
                expireInSeconds: expireInSeconds ?? 60 * 60 * 2,
                onComplete: true,
              },
            ),
          );
        }
      }
    }

    //
    const r = await db.executeSql(
      `UPDATE elwood.event SET has_processed = true, job_ids = $2 WHERE id = $1`,
      [event_id, jobIds],
    );

    console.log(r);

    return {
      job_ids: jobIds,
    };
  });
}
