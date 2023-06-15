import { invariant } from 'ts-invariant';

export type Env = {
  dbUrl: string;
  actionsDir: string;
  workingDir: string;
  dataDir: string;
  workflowsDir?: string;
  port: number;
  host: string;
  unlockKey: string;
  skipTeardown: boolean;
  launchMode: 'SERVER' | 'WORKER' | 'UNIVERSAL';
};

export function getEnv(): Env {
  try {
    const {
      DATABASE_URL,
      WORKING_DIR,
      DATA_DIR,
      WORKFLOWS_DIR,
      ACTIONS_DIR,
      UNLOCK_KEY,
      PORT,
      HOST,
      SKIP_TEARDOWN,
      LAUNCH_MODE,
    } = process.env ?? {};

    invariant(DATABASE_URL, 'DATABASE_URL is required');
    invariant(WORKING_DIR, 'WORKING_DIR is required');
    invariant(DATA_DIR, 'DATA_DIR is required');
    invariant(WORKFLOWS_DIR, 'WORKFLOWS_DIR is required');
    invariant(ACTIONS_DIR, 'ACTIONS_DIR is required');
    invariant(UNLOCK_KEY, 'UNLOCK_KEY is required');
    invariant(LAUNCH_MODE, 'LAUNCH_MODE is required');

    const port = parseInt(`${PORT ?? 3000}`, 10);
    const host = HOST ?? '0.0.0.0';

    return {
      dbUrl: DATABASE_URL,
      workingDir: WORKING_DIR,
      dataDir: DATA_DIR,
      workflowsDir: WORKFLOWS_DIR,
      actionsDir: ACTIONS_DIR,
      unlockKey: UNLOCK_KEY,
      port,
      host,
      skipTeardown: SKIP_TEARDOWN === 'true',
      launchMode: LAUNCH_MODE.toUpperCase() as Env['launchMode'],
    };
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
