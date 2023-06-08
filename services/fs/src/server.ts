import { Client } from 'pg';

import { createApp } from './app';

let _db: Client;

createApp()
  .then((db) => {
    _db = db;
    console.log('server started');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// catch sigint and exit cleanly
// since docker doesn't like it when we don't
process.on('SIGINT', async function () {
  if (_db) {
    await _db.end();
  }

  process.exit();
});
