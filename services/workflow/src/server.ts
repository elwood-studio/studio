import fastify from 'fastify';

import type { AppContext } from './types';
import { getEnv } from './libs/get-env';

import runHandlerPlugin from './handlers/run';
import eventHandlerPlugin from './handlers/event';
import configHandlerPlugin from './handlers/config';

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
