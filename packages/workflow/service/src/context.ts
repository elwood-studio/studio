import PgBoss from 'pg-boss';

import type { AppContext } from './types.ts';
import PgDatabase from './libs/db.ts';
import { getEnv } from './libs/get-env.ts';

const { dbUrl } = getEnv();

export async function createContext(): Promise<AppContext> {
  console.log('starting pg...');

  // create our own db connection so we can
  // pass it down to event handlers
  const db = new PgDatabase({ connectionString: dbUrl });
  await db.open();

  console.log('starting boss...');

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
    console.error('Workflow watcher stopped');
  });

  boss.on('error', (error) => {
    console.error('Workflow watcher error');
    console.error(error);
    process.exit(1);
  });

  await boss.start();

  const context: AppContext = {
    boss,
    db,
  };

  return context;
}
