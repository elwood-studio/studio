import { randomUUID } from 'node:crypto';
import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood-studio/types';
import {
  createWorkflowInput,
  resolveWorkflow,
} from '@elwood-studio/workflow-config';

import { ServerContext } from '../types';

export type JobHandlerOptions = {
  context: ServerContext;
};

export default fp<JobHandlerOptions>(async (app, opts) => {
  const { boss } = opts.context;

  app.post('*', async (req, res) => {
    const { workflow, input, tracking_id } = req.body as {
      workflow: string;
      input: JsonObject;
      tracking_id?: string;
    };

    const trackingId = tracking_id ?? input.tracking_id ?? randomUUID();

    await boss.send('workflow', {
      input: createWorkflowInput(input, { trackingId }),
      workflow: await resolveWorkflow(workflow),
    });

    res.send({
      ok: true,
      tracking_id: trackingId,
    });
  });
});
