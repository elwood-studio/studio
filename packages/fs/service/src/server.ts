import type { FastifyInstance } from 'fastify';

import { getEnv } from './libs/get-env.ts';
import { createApp } from './app.ts';

let _app: FastifyInstance;

const { port, host } = getEnv();

export async function startFileSystemService() {
  _app = await createApp();

  await _app.db.connect();

  await new Promise((resolve, reject) => {
    _app.listen(
      {
        port,
        host,
      },
      function (err) {
        if (err) {
          console.log(err);
          return reject(err);
        }

        resolve(null);
      },
    );
  });
}

export async function stopFileSystemService() {
  if (_app) {
    _app.db && (await _app.db.end());
    await _app.close();
  }
}
