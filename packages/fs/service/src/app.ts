import fastify from 'fastify';
import { Client } from 'pg';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { getEnv } from '@/libs/get-env.ts';
import { loadConfigFile } from '@/libs/load-config-file.ts';

import tusPlugin from '@/handlers/tus.ts';
import proxyPlugin from '@/handlers/proxy.ts';
import objectPlugin from '@/handlers/object/handlers.ts';
import errorPlugin from '@/handlers/error.ts';
import remotePlugin from '@/handlers/remote.ts';

// config stuff in one place
const { port, host, dbUrl, externalHost } = getEnv();

export async function createApp(): Promise<Client> {
  const app = fastify({ logger: true });
  const db = new Client({
    connectionString: dbUrl,
  });

  const config = await loadConfigFile();

  app.register(swagger, {
    mode: 'dynamic',
    stripBasePath: false,
    openapi: {
      info: {
        title: 'Elwood File System API',
        description: 'API documentation for Elwood File System',
        version: '0.0.1',
      },
      externalDocs: {
        url: 'https://elwood.studio/docs',
        description: 'Full documentation',
      },
      tags: [],
    },
  });
  app.register(swaggerUi, {
    routePrefix: '/docs',
    logo: {
      type: 'image/svg+xml',
      content: '',
    },
  });
  app.register(errorPlugin);

  // our proxy plugin will connect to the rclone cluster
  app.register(proxyPlugin, { db, config, externalHost });

  // share plugin
  app.register(objectPlugin, {
    db,
  });

  // tus plugin for uploading files
  app.register(tusPlugin, {
    db,
    externalHost,
  });

  app.register(remotePlugin, {
    db,
    config,
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
          console.log(err);
          return reject(err);
        }

        resolve(null);
      },
    );
  });

  return db;
}
