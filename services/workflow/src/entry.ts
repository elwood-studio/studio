import { getEnv } from './libs/get-env';
import { createContext } from './context';
import { startServer } from './server';
import { startWorker } from './worker';
import type { AppContext } from './types';

const { launchType } = getEnv();

let context: AppContext | null = null;

export async function main() {
  context = await createContext();

  if (['WORKER', 'UNIVERSAL'].includes(launchType)) {
    await startWorker(context);
  }

  if (['SERVER', 'UNIVERSAL'].includes(launchType)) {
    await startServer(context);
  }
}

async function end() {
  if (context) {
    context.boss && (await context.boss.stop());
    context.db && (await context.db.close());
    context.runtime && (await context.runtime.teardown());
  }
}

main().catch(async (err) => {
  console.error(err);
  await end();
  process.exit(1);
});

// catch sigint and exit cleanly
// since docker doesn't like it when we don't
process.on('SIGINT', async function () {
  await end();
  process.exit();
});
