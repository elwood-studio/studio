import type { AppContext } from './types/index.ts';
import { getEnv } from './libs/get-env.ts';
import { createContext } from './context.ts';
import { startServer } from './server.ts';
import { startWorker } from './worker.ts';

const { launchMode } = getEnv();

let context: AppContext | null = null;

export async function launchWorkflowService() {
  context = await createContext();

  if (['WORKER', 'UNIVERSAL'].includes(launchMode)) {
    await startWorker(context);
  }

  if (['SERVER', 'UNIVERSAL'].includes(launchMode)) {
    await startServer(context);
  }
}

export async function destroyWorkflowService() {
  if (context) {
    context.boss && (await context.boss.stop());
    context.db && (await context.db.close());
    context.runtime && (await context.runtime.teardown());
  }
}
