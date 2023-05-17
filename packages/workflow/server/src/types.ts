import yargs from 'yargs-parser';
import UrlPattern from 'url-pattern';
import type {
  Workflow,
  WorkflowRunnerInstructions,
} from '@elwood-studio/workflow-types';
import type {
  WorkflowRunnerRuntime,
  WorkflowRunnerConfiguration,
} from '@elwood-studio/workflow-runner';
import type { Json, JsonObject } from '@elwood-studio/types';

export interface WorkflowServerContext {
  readonly runtime: WorkflowRunnerRuntime;
  readonly options: WorkflowServerOptions;

  readonly routes: WorkflowServerRoute[];
  registerPlugin(plugin: WorkflowServerOptionsPlugin): Promise<void>;
  addRoute(route: WorkflowServerRoute): void;
}

export interface WorkflowServerPlugin {
  register(options: unknown, context: WorkflowServerContext): Promise<void>;
}

export type WorkflowServerRunInput = {
  instructions?: WorkflowRunnerInstructions;
  workflow?: Workflow | string;
  input?: JsonObject;
  secrets?: JsonObject;
  parse_workflow_as?: string;
};

export type WorkflowServerReportInput = {
  id: string;
};

export type WorkflowServerCallbackInput = {
  token: string;
  payload?: JsonObject;
};

export type WorkflowServerOptionsPlugin =
  | string
  | [string | WorkflowServerPlugin, JsonObject]
  | WorkflowServerPlugin;

export type WorkflowServerOptions = {
  prefix?: string;
  runtime: WorkflowRunnerConfiguration;
  plugins?: WorkflowServerOptionsPlugin[];
  maxConcurrentRuns?: number;
};

export type WorkflowServerCliArguments = yargs.Arguments & {
  name?: string;
  port?: number;
  host?: string;
  env?: string;
  workingDir?: string;
  unlockKey?: string;
  commandPort?: number;
  dockerPath?: string;
  detach?: boolean;
  data?: string;
  watch?: boolean;
};

export type WorkflowServerCliState = {
  args: string[];
  port: number;
  name: string;
  homeDir: string;
  pidFile: string;
  configFile: string;
  logFile: string;
};

export type WorkflowHandlerRequest = {
  url: string;
  method: string;
  body: JsonObject;
  params: JsonObject;
  context: WorkflowServerContext;
};

export type WorkflowHandlerResponse = {
  status: number;
  body: Json;
};

export type WorkflowServerRouteHandler = (
  req: WorkflowHandlerRequest,
) => Promise<WorkflowHandlerResponse>;

export type WorkflowServerRoute = {
  pattern: UrlPattern;
  handler: WorkflowServerRouteHandler;
};
