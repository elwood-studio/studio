import { invariant } from 'ts-invariant';

export type Config = {
  dbUrl: string;
  workingDir: string;
  dataDir: string;
  workflowsDir?: string;
};

export function getConfig(): Config {
  try {
    const { DATABASE_URL, WORKING_DIR, DATA_DIR, WORKFLOWS_DIR } =
      process.env ?? {};

    invariant(DATABASE_URL, 'DATABASE_URL is required');
    invariant(WORKING_DIR, 'WORKING_DIR is required');
    invariant(DATA_DIR, 'DATA_DIR is required');
    invariant(WORKFLOWS_DIR, 'WORKFLOWS_DIR is required');

    return {
      dbUrl: DATABASE_URL,
      workingDir: WORKING_DIR,
      dataDir: DATA_DIR,
      workflowsDir: WORKFLOWS_DIR,
    };
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
