import fastify from 'fastify';
import { Client } from 'pg';
import {} from 'fastify-boom';

import { getConfig } from './libs/get-config';
import { connectDb } from './libs/connect-db';
import { loadRcConfig } from './libs/load-rc-config';

import tusPlugin from './handlers/tus';
import proxyPlugin from './handlers/proxy';
import sharePlugin from './handlers/share';
import errorPlugin from './handlers/error';

// config stuff in one place
const { port, host, dbUrl, externalHost, rcloneHost } = getConfig();

const app = fastify({ logger: true });
const db = new Client({
  connectionString: dbUrl,
});

app.register(errorPlugin);

// our proxy plugin will connect to the rclone cluster
app.register(proxyPlugin, { db, rcloneHost, externalHost });

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

// connect up to our database
// and then start the server
connectDb(db, function (state) {
  if (!state) {
    console.error('could not connect to database');
    process.exit(1);
  }

  app.listen(
    {
      port,
      host,
    },
    function (err) {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }

      // load the config
      loadRcConfig().then();

      console.log('server listening on port', port);
    },
  );
});

// catch sigint and exit cleanly
// since docker doesn't like it when we don't
process.on('SIGINT', async function () {
  if (db) {
    await db.end();
  }

  process.exit();
});
