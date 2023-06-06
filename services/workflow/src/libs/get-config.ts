import { invariant } from 'ts-invariant';

export type Config = {
  dbUrl: string;
  actionsDir: string;
  workingDir: string;
  dataDir: string;
  workflowsDir?: string;
  port: number;
  host: string;
};

export function getConfig(): Config {
  try {
    const {
      DATABASE_URL,
      WORKING_DIR,
      DATA_DIR,
      WORKFLOWS_DIR,
      ACTIONS_DIR,
      PORT,
      HOST,
    } = process.env ?? {};

    invariant(DATABASE_URL, 'DATABASE_URL is required');
    invariant(WORKING_DIR, 'WORKING_DIR is required');
    invariant(DATA_DIR, 'DATA_DIR is required');
    invariant(WORKFLOWS_DIR, 'WORKFLOWS_DIR is required');
    invariant(ACTIONS_DIR, 'ACTIONS_DIR is required');

    const port = parseInt(`${PORT ?? 3000}`, 10);
    const host = HOST ?? '0.0.0.0';

    return {
      dbUrl: DATABASE_URL,
      workingDir: WORKING_DIR,
      dataDir: DATA_DIR,
      workflowsDir: WORKFLOWS_DIR,
      actionsDir: ACTIONS_DIR,
      port,
      host,
    };
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
