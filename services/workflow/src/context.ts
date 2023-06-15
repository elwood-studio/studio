import PgBoss from 'pg-boss';

import PgDatabase from './libs/db';
import type { AppContext } from './types';
import { getEnv } from './libs/get-env';

const { dbUrl } = getEnv();

export async function createContext(): Promise<AppContext> {
  console.log('starting boss...');

  // create our own db connection so we can
  // pass it down to event handlers
  const db = new PgDatabase({ connectionString: dbUrl });

  await db.open();

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
