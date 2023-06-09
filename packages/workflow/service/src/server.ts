import fastify from 'fastify';

import type { AppContext } from './types.ts';
import { getEnv } from './libs/get-env.ts';

import runHandlerPlugin from './handlers/run.ts';
import eventHandlerPlugin from './handlers/event.ts';
import configHandlerPlugin from './handlers/config.ts';
import triggerHandlerPlugin from './handlers/trigger.ts';

const { port, host } = getEnv();

export async function startServer(context: AppContext) {
  const app = fastify({ logger: true });

  app.register(runHandlerPlugin, {
    context,
  });

  app.register(eventHandlerPlugin, {
    context,
  });

  app.register(configHandlerPlugin, {
    context,
  });

  app.register(triggerHandlerPlugin, {
    context,
  });

  await new Promise((resolve, reject) => {
    app.listen(
      {
        port,
        host,
      },
      function (err) {
        if (err) {
          reject(err);
          return;
        }

        console.log('server started');

        resolve(null);
      },
    );
  });
}
