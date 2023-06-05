import { Database } from './database';

export type ObjectModel = Database['elwood']['Tables']['object']['Row'];
export type AccessModel = Database['elwood']['Tables']['access']['Row'];
export type EventModel = Database['elwood']['Tables']['event']['Row'];
export type WorkflowRunModel =
  Database['elwood']['Tables']['workflow_run']['Row'];
