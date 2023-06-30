import { WorkflowSecretsManager } from '@elwood/workflow-secrets';
import type {
  WorkflowRunnerRuntimeRun,
  WorkflowRunnerRuntime,
} from '@elwood/workflow-runner';
import type {
  Workflow,
  WorkflowRunnerInstructions,
} from '@elwood/workflow-types';
import type { JsonObject, Json } from '@elwood/types';
import type PgBoss from 'pg-boss';

export type SubmitWorkflowFn = (
  instructions: Workflow,
  input: JsonObject,
  context?: JsonObject,
) => Promise<WorkflowRunnerRuntimeRun>;

export type AppContext = {
  boss: PgBoss;
  db: Db;
  submitWorkflow?: SubmitWorkflowFn;
  runtime?: WorkflowRunnerRuntime;
  secretsManager?: WorkflowSecretsManager;
};

export type WorkflowQueueData = {
  workflow: Workflow;
  instructions: WorkflowRunnerInstructions;
  input: JsonObject;
  context: JsonObject;
  tracking_id?: string;
  source?: 'event';
  source_id?: string;
  source_name?: string;
  source_job_id?: string;
};

interface Db {
  executeSql(
    text: string,
    values: Json[],
  ): Promise<{ rows: Json[]; rowCount: number }>;
  close(): Promise<void>;
}
