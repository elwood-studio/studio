import { randomUUID } from 'crypto';

import type { Json, JsonObject } from '@elwood/types';
import { Workflow } from '@elwood/workflow-types';
import { shouldRunWhen, getExpressionValue } from '@elwood/workflow-runner';
import { normalizeWorkflowToInstructions } from '@elwood/workflow-config';

import type { AppContext, WorkflowQueueData } from '../types.ts';
import { findWorkflow } from '../libs/find-workflow.ts';
import { getEnv } from '../libs/get-env.ts';
import { createRun } from '../libs/create-run.ts';

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
        const workflows: Workflow[] = [];

        if (eventType === 'workflow') {
          workflows.push(payload.workflow as Workflow);
        } else {
          workflows.push(...(await findWorkflow()));
        }

        const input: JsonObject = payload.input ?? {};
        const workflowContext: JsonObject = {
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
          workflowContext.elwood.has_object = true;
          workflowContext.elwood.object = rows.rows[0];
          workflowContext.elwood.object.uri = `elwood://${payload.object_id}`;
        }

        for (const workflow of workflows) {
          const tracking_id = randomUUID();
          const instructions = await normalizeWorkflowToInstructions(
            workflow as Workflow,
          );

          const shouldRun = await shouldRunWhen(
            instructions.when,
            (expression) => getExpressionValue(expression, workflowContext),
          );

          // if we shouldn't run, just ignore
          if (!shouldRun) {
            continue;
          }

          const jobData: WorkflowQueueData = {
            workflow,
            instructions,
            input: {
              ...input,
              tracking_id,
            },
            context: {
              ...workflowContext,
              elwood: {
                ...workflowContext.elwood,
                tracking_id,
              },
            },
            source: 'event',
            source_id: job.data.event_id,
            source_name: job.name,
            source_job_id: job.id,
          };

          const jobId = await boss.send('workflow', jobData, {
            expireInSeconds: expireInSeconds ?? 60 * 60 * 2,
            onComplete: true,
          });

          if (!jobId) {
            continue;
          }

          await createRun(context, {
            tracking_id,
            data: jobData,
          });

          jobIds.push(jobId);
        }
      }
    }

    //
    const r = await db.executeSql(
      `UPDATE elwood.event SET has_processed = true, job_ids = $2 WHERE id = $1`,
      [event_id, jobIds],
    );

    return {
      job_ids: jobIds,
    };
  });
}
