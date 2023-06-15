import type {
  WorkflowRunnerRuntimeRun,
  WorkflowRunnerRuntime,
} from '@elwood-studio/workflow-runner';
import type { Workflow } from '@elwood-studio/workflow-types';
import type { JsonObject } from '@elwood-studio/types';
import type PgBoss from 'pg-boss';
import type PgDatabase from 'pg-boss/src/db';

export type SubmitWorkflowFn = (
  instructions: Workflow,
  input: JsonObject,
  context?: JsonObject,
) => Promise<WorkflowRunnerRuntimeRun>;

export type AppContext = {
  boss: PgBoss;
  db: PgDatabase;
  submitWorkflow?: SubmitWorkflowFn;
  runtime?: WorkflowRunnerRuntime;
};

export type WorkflowQueueData = {
  workflow: Workflow;
  input: JsonObject;
  context: JsonObject;
  tracking_id?: string;
  source?: 'event';
  source_id?: string;
  source_name?: string;
  source_job_id?: string;
};
