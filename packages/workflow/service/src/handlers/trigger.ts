import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood/types';

import { AppContext } from '../types.ts';
import { createEvent } from '../libs/create-event.ts';

export type TriggerHandlerOptions = {
  context: AppContext;
};

export default fp<TriggerHandlerOptions>(async (app, opts): Promise<void> => {
  app.all('/trigger', async (req, res) => {
    // only allow selected http methods
    if (!['GET', 'POST', 'PUT'].includes(req.method.toUpperCase())) {
      res.status(405).send({
        ok: false,
        error: 'Method not allowed',
      });
      return;
    }

    const event_id = await createEvent(opts.context, {
      type: 'trigger',
      payload: {
        trigger: {
          method: req.method,
          body: (req.body as JsonObject) ?? {},
          query: (req.query as JsonObject) ?? {},
          headers: (req.headers as JsonObject) ?? {},
        },
      },
    });

    res.send({
      ok: true,
      event_id,
    });
  });
});
