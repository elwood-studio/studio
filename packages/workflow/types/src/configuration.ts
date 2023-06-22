import type { JsonObject, JsonScalar, Json, JsonSchema } from '@elwood/types';

import type { WorkflowMeta } from './meta';

export interface Workflow {
  name: string;
  description?: string;
  extends?: WorkflowExtends;
  when: WorkflowWhen;
  jobs: Record<string, WorkflowJob>;
  defaults?: WorkflowDefaults;
  timeout?: WorkflowTimeout;
  env?: string[];
  meta?: WorkflowMeta;
}

export type WorkflowDefaults = {
  permission?: WorkflowPermission;
  env?: WorkflowEnv;
};

export type WorkflowInput = {
  prompt?: WorkflowInputPrompt[];
  validate?: WorkflowInputValidate;
  defaults?: JsonObject;
  required?: string[];
  additional?: boolean;
};

export type WorkflowInputValidate = JsonSchema;

export type WorkflowCommands = Record<string, WorkflowCommand>;
export type WorkflowCommand = {
  container: WorkflowContainer;
  access?: WorkflowPermission;
  env?: WorkflowEnv;
};

export type WorkflowContainer = {
  image: string;
  cmd?: string[];
  env?: WorkflowEnv;
  args?: string[];
  entrypoint?: string[];
};

export type WorkflowExtends = string | WorkflowExtendsObject;

export type WorkflowExtendsObject = {
  url: string;
  jobs?: string[];
};

export interface WorkflowWhenRunObject {
  run?: string;
  input?: JsonObject;
}

export interface WorkflowWhenObject {
  event?: string | string[];
  all?: Array<string | WorkflowWhenRunObject>;
  any?: Array<string | WorkflowWhenRunObject>;
  operator?: 'and' | 'or' | 'xor';
}

export type WorkflowWhen =
  | boolean
  | string
  | string[]
  | WorkflowWhenObject
  | WorkflowWhenRunObject
  | WorkflowWhenRunObject[];

export type WorkflowEnv = Record<string, JsonScalar>;

export interface WorkflowActionObject {
  action: string;
  args?: string[];
  command?: string[];
}

export type WorkflowAction = string | WorkflowActionObject;
export type WorkflowJobStepVault = Record<string, string>;

export type WorkflowTimeout = {
  minutes: number;
};

export type WorkflowSecrets = Record<string, string>;

export type WorkflowPermissionValue = boolean | string | string[];

export type WorkflowPermission =
  | string
  | boolean
  | Partial<{
      run: WorkflowPermissionValue;
      read: WorkflowPermissionValue;
      write: WorkflowPermissionValue;
      net: WorkflowPermissionValue;
      env: WorkflowPermissionValue;
      sys: WorkflowPermissionValue;
      ffi: WorkflowPermissionValue;
      unstable: boolean;
    }>;

export interface WorkflowJobStepBase {
  name?: string;
  when?: WorkflowWhen;
  input?: JsonObject;
  output?: JsonObject;
  env?: WorkflowEnv;
  permission?: WorkflowPermission;
  timeout?: WorkflowTimeout;
  matrix?: WorkflowMatrix;
}

export interface WorkflowJobStepRun extends WorkflowJobStepBase {
  run: string;
}

export interface WorkflowJobStepAction extends WorkflowJobStepBase {
  action: WorkflowAction;
}

export type WorkflowJobStep = WorkflowJobStepRun | WorkflowJobStepAction;

export type WorkflowMatrix = string | string[];

export interface WorkflowJob {
  description?: string;
  platform?: string;
  steps: WorkflowJobStep[];
  matrix?: WorkflowMatrix;
  timeout?: WorkflowTimeout;
  access?: WorkflowPermission;
  env?: WorkflowEnv;
  when?: WorkflowWhen;
}

export interface WorkflowInputPrompt {
  name: string;
  message?: string;
  type: string;
  default?: Json;
  options?: string[];
  required?: boolean;
}

export interface WorkflowRunner {
  size?: string;
  region?: string;
}
