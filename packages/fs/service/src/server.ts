import type { FastifyInstance } from 'fastify';

import { getEnv } from './libs/get-env.ts';
import { createApp } from './app.ts';

let _app: FastifyInstance | null = null;

const { port, host } = getEnv();

export async function startFileSystemService() {
  if (_app) {
    return;
  }

  _app = await createApp();

  await new Promise((resolve, reject) => {
    if (!_app) {
      return reject(new Error('App not initialized'));
    }

    _app.listen(
      {
        port,
        host,
      },
      function (err) {
        if (err) {
          return reject(err);
        }

        resolve(null);
      },
    );
  });
}

export async function stopFileSystemService() {
  if (_app) {
    _app.db && (await _app.db.close());
    await _app.close();
    _app = null;
  }
}
