import type { JsonObject, Json, JsonScalar } from '@elwood-studio/types';

import type { WorkflowMeta } from './meta';

export type WorkflowRunnerConfiguration = {};

export interface WorkflowRunnerInstructions {
  meta?: WorkflowMeta;
  id: string;
  jobs: WorkflowRunnerJob[];
  when: WorkflowRunnerExpression[];
  instance: WorkflowRunnerInstance;
  commands: WorkflowRunnerCommand[];
  timeoutMinutes: number | null;
  env: WorkflowRunnerEnv;
}

export type WorkflowRunnerAccess = {
  stage: string[];
  env: Record<string, boolean>;
  secrets: Record<string, boolean>;
};

export type WorkflowRunnerEnv = Record<string, JsonScalar>;

export type WorkflowRunnerContainer = {
  image: string;
  cmd: string[] | null;
  entrypoint: string[] | null;
  args: string[] | null;
};

export type WorkflowRunnerCommand = {
  name: string;
  container: WorkflowRunnerContainer;
  access: WorkflowRunnerAccess;
  env: WorkflowRunnerEnv;
};

export type WorkflowRunnerAction = {
  action: string;
  args: string[];
  command: string[];
  version: string | undefined;
};

export interface WorkflowRunnerJobStep {
  id: string;
  name: string;
  action: WorkflowRunnerAction;
  input: JsonObject;
  output: JsonObject;
  access: WorkflowRunnerAccess;
  env: WorkflowRunnerEnv;
  timeoutMinutes: number | null;
  when: WorkflowRunnerExpression[];
}

export type WorkflowRunnerJobMatrix =
  | WorkflowRunnerExpression
  | WorkflowRunnerExpression[];

export interface WorkflowRunnerJob {
  id: string;
  name: string;
  steps: WorkflowRunnerJobStep[];
  when: WorkflowRunnerExpression[];
  matrix: WorkflowRunnerJobMatrix;
  env: WorkflowRunnerEnv;
  access: WorkflowRunnerAccess;
  timeoutMinutes: number | null;
}

export type WorkflowRunnerKeychain = string[];
export type WorkflowRunnerSecrets = string[];

export type WorkflowRunnerInput = {
  __secrets?: WorkflowRunnerSecrets;
  __keychain?: WorkflowRunnerKeychain;
  __tracking_id?: string;
  [key: string]: Json;
};

export type WorkflowRunnerExpression = {
  run: string;
  input: JsonObject & {
    expression?: string | string[] | boolean;
    with?: string;
  };
};

export type WorkflowRunnerInstance = {
  size: string | null;
  region: string | null;
};
