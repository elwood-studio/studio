import { Client } from 'pg';

import { createApp } from './app.ts';

let _db: Client;

export async function startFileSystemService() {
  _db = await createApp();
}

export async function stopFileSystemService() {
  if (_db) {
    await _db.end();
  }
}
