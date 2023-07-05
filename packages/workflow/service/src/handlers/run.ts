import { randomUUID } from 'node:crypto';
import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood/types';
import { createWorkflowInput, resolveWorkflow } from '@elwood/workflow-config';

import type { AppContext } from '../types.ts';
import { createEvent } from '../libs/create-event.ts';
import { cancelRun } from '../libs/cancel-run.ts';
import { invariant } from '@/libs/invariant.ts';

export type RunHandlerOptions = {
  context: AppContext;
};

export default fp<RunHandlerOptions>(async (app, opts): Promise<void> => {
  app.post('/run', async (req, res) => {
    const {
      workflow,
      instructions,
      input = {},
      tracking_id,
    } = req.body as {
      workflow: string;
      input: JsonObject;
      instructions?: JsonObject;
      tracking_id?: string;
    };
    const trackingId = tracking_id ?? input.tracking_id ?? randomUUID();

    await createEvent(opts.context, {
      type: 'workflow',
      payload: {
        input: createWorkflowInput(input, { trackingId }),
        workflow: workflow && (await resolveWorkflow(workflow)),
        instructions,
      },
    });

    res.send({
      ok: true,
      tracking_id: trackingId,
    });
  });

  app.delete('/run/:tracking_id', async (req, res) => {
    const { tracking_id } = req.params as { tracking_id?: string };
    invariant(tracking_id, 'Missing tracking_id');
    await cancelRun(opts.context, tracking_id);

    res.send({
      ok: true,
    });
  });
});
