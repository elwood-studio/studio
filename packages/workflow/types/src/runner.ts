import type { JsonObject, Json, JsonScalar } from '@elwood-studio/types';

import type { WorkflowMeta } from './meta';

export type WorkflowRunnerConfiguration = JsonObject;

export interface WorkflowRunnerInstructions {
  meta?: WorkflowMeta;
  id: string;
  jobs: WorkflowRunnerJob[];
  when: WorkflowRunnerWhen;
  timeoutMinutes: number | null;
  env: WorkflowRunnerEnv;
}

export type WorkflowRunnerWhen = {
  operator: 'and' | 'or' | 'xor';
  any: WorkflowRunnerExpression[];
  all: WorkflowRunnerExpression[];
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

  env: WorkflowRunnerEnv;
};

export type WorkflowRunnerAction = {
  action: string;
  args: string[];
  command: string[];
  version: string | undefined;
};

export type WorkflowRunnerPermissionValue = boolean | string[];

export type WorkflowRunnerPermission = {
  run: WorkflowRunnerPermissionValue;
  read: WorkflowRunnerPermissionValue;
  write: WorkflowRunnerPermissionValue;
  net: WorkflowRunnerPermissionValue;
  env: WorkflowRunnerPermissionValue;
  sys: WorkflowRunnerPermissionValue;
  ffi: WorkflowRunnerPermissionValue;
  unstable: boolean;
};

export interface WorkflowRunnerJobStep {
  id: string;
  name: string;
  action: WorkflowRunnerAction;
  input: JsonObject;
  output: JsonObject;
  permission: WorkflowRunnerPermission;
  env: WorkflowRunnerEnv;
  timeoutMinutes: number | null;
  when: WorkflowRunnerWhen;
}

export type WorkflowRunnerJobMatrix =
  | WorkflowRunnerExpression
  | WorkflowRunnerExpression[];

export interface WorkflowRunnerJob {
  id: string;
  name: string;
  steps: WorkflowRunnerJobStep[];
  when: WorkflowRunnerWhen;
  matrix: WorkflowRunnerJobMatrix;
  env: WorkflowRunnerEnv;
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
