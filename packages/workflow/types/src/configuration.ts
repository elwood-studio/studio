import type {
  JsonObject,
  JsonScalar,
  Json,
  JsonSchema,
} from '@elwood-studio/types';

import type { WorkflowMeta } from './meta';

export interface Workflow {
  name: string;
  description?: string;
  extends?: WorkflowExtends;
  when: WorkflowWhen;
  jobs: Record<string, WorkflowJob>;
  env?: WorkflowEnv;
  input?: WorkflowInput;
  runner?: WorkflowRunner;
  commands?: WorkflowCommands;
  services?: {};
  timeout?: WorkflowTimeout;
  meta?: WorkflowMeta;
}

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
  access?: WorkflowAccess;
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

export interface WorkflowWhenObject {
  run?: string;
  input?: JsonObject;
}

export type WorkflowWhen =
  | boolean
  | string
  | string[]
  | WorkflowWhenObject
  | WorkflowWhenObject[];

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

export type WorkflowAccess = {
  env?: boolean | string | Record<string, boolean>;
  secrets?: boolean | string | Record<string, boolean>;
  stage?: boolean | string | string[];
};

export interface WorkflowJobStepBase {
  name?: string;
  when?: WorkflowWhen;
  input?: JsonObject;
  output?: JsonObject;
  env?: WorkflowEnv;
  access?: WorkflowAccess;
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
  access?: WorkflowAccess;
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
