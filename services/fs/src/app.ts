import fastify from 'fastify';
import { Client } from 'pg';
import {} from 'fastify-boom';

import { getEnv } from './libs/get-env';
import { loadConfigFile } from './libs/load-config-file';

import tusPlugin from './handlers/tus';
import proxyPlugin from './handlers/proxy';
import sharePlugin from './handlers/share';
import errorPlugin from './handlers/error';

// config stuff in one place
const { port, host, dbUrl, externalHost } = getEnv();

export async function createApp(): Promise<Client> {
  const app = fastify({ logger: true });
  const db = new Client({
    connectionString: dbUrl,
  });

  const config = await loadConfigFile();

  app.register(errorPlugin);

  // our proxy plugin will connect to the rclone cluster
  app.register(proxyPlugin, { db, config, externalHost });

  // share plugin
  app.register(sharePlugin, {
    db,
  });

  // tus plugin for uploading files
  app.register(tusPlugin, {
    db,
    externalHost,
  });

  // PING!
  app.get('/ping', function (_, res) {
    res.send('pong');
  });

  await db.connect();

  await new Promise((resolve, reject) => {
    app.listen(
      {
        port,
        host,
      },
      function (err) {
        if (err) {
          return reject(err);
        }

        // load the config
        resolve(null);
      },
    );
  });

  return db;
}
