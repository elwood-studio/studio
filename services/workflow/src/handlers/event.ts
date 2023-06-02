import { randomUUID } from 'node:crypto';
import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood-studio/types';
import { createWorkflowInput } from '@elwood-studio/workflow-config';

import { ServerContext } from '../types';

export type EventHandlerOptions = {
  context: ServerContext;
};

export default fp(async (app, opts): Promise<void> => {
  const { boss } = opts.context;

  app.post('/event/:type', async (req, res) => {
    const { type: eventType } = req.params as { type: string };
    const { input, tracking_id } = req.body as {
      workflow: string;
      input: JsonObject;
      tracking_id?: string;
    };

    const trackingId = tracking_id ?? input.tracking_id ?? randomUUID();

    await boss.send(
      `event:${eventType}`,
      {
        input: createWorkflowInput(input, { trackingId }),
      },
      { singletonKey: trackingId },
    );

    res.send({
      ok: true,
      tracking_id: trackingId,
    });
  });
});
