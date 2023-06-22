import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood/types';

import { AppContext } from '../types.ts';
import { createEvent } from '../libs/create-event.ts';

export type EventHandlerOptions = {
  context: AppContext;
};

export default fp<EventHandlerOptions>(async (app, opts): Promise<void> => {
  app.post('/event/:type', async (req, res) => {
    const { type } = req.params as { type: string };
    const payload = (req.body as JsonObject) ?? {};

    const event_id = await createEvent(opts.context, {
      type,
      payload,
    });

    res.send({
      ok: true,
      event_id,
    });
  });
});
