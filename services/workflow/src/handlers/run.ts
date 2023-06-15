import { randomUUID } from 'node:crypto';
import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood-studio/types';
import {
  createWorkflowInput,
  resolveWorkflow,
} from '@elwood-studio/workflow-config';

import type { AppContext } from '../types';
import { createEvent } from '../libs/create-event';

export type RunHandlerOptions = {
  context: AppContext;
};

export default fp<RunHandlerOptions>(async (app, opts): Promise<void> => {
  app.post('/run', async (req, res) => {
    const { workflow, input, tracking_id } = req.body as {
      workflow: string;
      input: JsonObject;
      tracking_id?: string;
    };
    const trackingId = tracking_id ?? input.tracking_id ?? randomUUID();

    await createEvent(opts.context, {
      type: 'workflow',
      payload: {
        input: createWorkflowInput(input, { trackingId }),
        workflow: await resolveWorkflow(workflow),
      },
    });

    res.send({
      ok: true,
      tracking_id: trackingId,
    });
  });
});
