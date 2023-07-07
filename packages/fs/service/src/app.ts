import fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import PgBoss from 'pg-boss';

import { getEnv } from '@/libs/get-env.ts';
import { loadConfigFile } from '@/libs/load-config-file.ts';
import PgDatabase from '@/libs/db.ts';

import tusPlugin from '@/handlers/tus.ts';
import proxyPlugin from '@/handlers/proxy.ts';
import objectPlugin from '@/handlers/object/handlers.ts';
import errorPlugin from '@/handlers/error.ts';
import remotePlugin from '@/handlers/remote.ts';
import registerUploadQueue from '@/queue/upload.ts';
import registerCopyQueue from '@/queue/copy.ts';

// config stuff in one place
const { dbUrl, externalHost } = getEnv();

export async function createApp(): Promise<fastify.FastifyInstance> {
  console.log('Creating app...');

  const app = fastify({ logger: true });
  const db = new PgDatabase({
    connectionString: dbUrl,
  });

  const config = await loadConfigFile();

  await db.open();

  console.log('database open...');

  // lets get boss going
  const boss = new PgBoss({
    db,
    max: 5,
    deleteAfterDays: 7,
    archiveCompletedAfterSeconds: 14_400,
    retentionDays: 7,
    retryBackoff: true,
    retryLimit: 20,
    monitorStateIntervalSeconds: 30,
    schema: 'elwood_boss',
  });

  boss.on('stopped', () => {
    console.error('Job watcher stopped');
  });

  boss.on('error', (error) => {
    console.error('Job watcher error');
    console.error(error);
    process.exit(1);
  });

  // register our queues
  await registerCopyQueue(boss, db);
  await registerUploadQueue(boss, db);

  // swagger stuff, because we love docs
  app.register(swagger, {
    prefix: '/docs',
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

  // error plugin to fail correctly
  app.register(errorPlugin);

  // our proxy plugin will connect to the rclone cluster
  app.register(proxyPlugin, { db, config, externalHost });

  // share plugin
  app.register(objectPlugin, {
    db,
    boss,
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

  await boss.start();

  // decorate the app with our stuff
  app.decorate('db', db);
  app.decorate('boss', boss);

  return app;
}
