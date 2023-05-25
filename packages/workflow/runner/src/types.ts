import type { Duplex, Writable } from 'stream';
import type { FastifyInstance } from 'fastify';
import TypedEmitter from 'typed-emitter';
import Docker, { Container } from 'dockerode';

import * as FSJetpack from 'fs-jetpack';

import type {
  Workflow,
  WorkflowRunnerInstructions,
  WorkflowRunnerJobStep,
  WorkflowRunnerJob,
  WorkflowRunnerInput,
  WorkflowRunnerCommand,
  WorkflowActionRegistry,
  WorkflowRunnerExpression,
} from '@elwood-studio/workflow-types';
import type { WorkflowSecretsManager } from '@elwood-studio/workflow-secrets';
import type { JsonObject, Json } from '@elwood-studio/types';
import yargsParser from 'yargs-parser';

export type WorkflowRunnerConfiguration = {
  dockerSocketPath?: string;
  commandServerPort: number;
  workingDir: string;
  keychainUnlockKey: string;
  stdLibBaseUrl?: string;
  stdLibHeadUrl?: string;
  stdLibDefaultVersion?: string;
  registryUrl?: string;
  commandContext?: 'local' | 'container';
  context?: 'local' | 'container';
  plugins?: Array<
    | WorkflowRunnerRuntimePluginConstructor
    | [WorkflowRunnerRuntimePluginConstructor, JsonObject]
  >;
  staticFiles?: Record<string, string>;
};

export type WorkflowRunnerCliArguments = yargsParser.Arguments & {
  homeDir?: string;
  config?: string;
  report?: boolean;
  reportJson?: boolean;
  dockerSocket?: string;
  commandPort?: number;
  workingDir?: string;
  keychainUnlockKey?: string;
  endpoint?: string;
  stdLibUrl?: string;
  registryUrl?: string;
  commandContext?: 'local' | 'container';
  context?: 'local' | 'container';
  docker?: boolean;
  input?: JsonObject;
  staticFiles?: string[];
};

export interface WorkflowRunnerRuntime {
  readonly config: WorkflowRunnerConfiguration;
  readonly docker: Docker;
  readonly workingDir: typeof FSJetpack;
  readonly runs: Map<string, WorkflowRunnerRuntimeRun>;
  readonly commandExecutionRefs: Map<string, [string, string, string]>;
  readonly commandServer: FastifyInstance;
  readonly stdLibUrl: string;
  readonly stdLibHeadUrl: string;
  readonly registryUrl: string;
  readonly context: WorkflowRunnerRuntimeContext;
  readonly plugins: WorkflowRunnerRuntimePlugin[];

  on: RuntimeEventsEmitter['on'];
  off: RuntimeEventsEmitter['off'];
  setCommandExecutionRef(run: string, job: string, step: string): string;
  uuid(prefix?: string): string;
  getStdLibUrl(name: string, version?: string): string;
  teardown(): Promise<void>;
  cleanup(): Promise<void>;
  getStdLibRegistry(version?: string): Promise<WorkflowActionRegistry>;
  registerPlugin(
    PluginClass: WorkflowRunnerRuntimePluginConstructor,
    options?: JsonObject,
  ): Promise<void>;

  addRun(
    instructions: WorkflowRunnerInstructions,
    secrets?: WorkflowSecretsManager,
  ): WorkflowRunnerRuntimeRun;
  removeRun(id: string): Promise<void>;
}

export interface WorkflowRunnerRuntimeContext {
  set(key: string, value: Json): void;
  get<T = Json>(key: string): T;
  merge(value: Json): void;
  data: JsonObject;
}

export type WorkflowRunnerRuntimeRunReport = {
  time: WorkflowRunnerRuntimeTimerReport;
  status: {
    value: string;
    reason: string;
  };
  jobs: WorkflowRunnerRuntimeRunJobReport[];
};

export type WorkflowRunnerRuntimeRunJobReport = {
  id: string;
  name: string;
  time: WorkflowRunnerRuntimeTimerReport;
  status: {
    value: string;
    reason: string;
  };
  steps: WorkflowRunnerRuntimeRunJobStepReport[];
};

export type WorkflowRunnerRuntimeRunJobStepReport = {
  id: string;
  time: WorkflowRunnerRuntimeTimerReport;
  status: string;
  name: string;
  code: number | null;
  output: JsonObject;
  stdout: string[];
  stderr: string[];
};

export type WorkflowRunnerRuntimeRunSecrets = {
  values: JsonObject;
  publicKey: string;
  secretKey: string;
};

export interface WorkflowRunnerRuntimeTimer {
  readonly startTime: bigint;
  readonly endTime: bigint;

  start(): void;
  stop(): void;
  report(): WorkflowRunnerRuntimeTimerReport;
}

export interface WorkflowRunnerRuntimeTimerReport {
  start: string;
  end: string;
  elapsedNanoseconds: string;
  startTimestamp: string;
  endTimestamp: string;
}

export interface WorkflowRunnerRuntimeRun {
  readonly id: string;
  readonly runtime: WorkflowRunnerRuntime;
  readonly rootDir: typeof FSJetpack;
  readonly stageDir: typeof FSJetpack;
  readonly context: WorkflowRunnerRuntimeContext;
  readonly def: WorkflowRunnerInstructions;
  readonly jobs: Map<string, WorkflowRunnerRuntimeRunJob>;
  readonly output: JsonObject;
  readonly report: WorkflowRunnerRuntimeRunReport;
  readonly secretsManager: WorkflowSecretsManager;
  readonly commandProviders: RunnerCommandProvider[];

  status: string;
  statusText: string;

  on: RuntimeRunEventsEmitter['on'];
  hasCommandProvider(name: string): boolean;
  addCommandProvider(...providers: RunnerCommandProvider[]): Promise<void>;
  contextValue(): JsonObject;
  setup(input: WorkflowRunnerInput, context?: JsonObject): Promise<void>;
  teardown(): Promise<void>;
  start(): Promise<void>;
  complete(status?: string, text?: string): Promise<void>;
  addJob(def: WorkflowRunnerJob): WorkflowRunnerRuntimeRunJob;
}

export interface WorkflowRunnerRuntimeRunJob {
  readonly run: WorkflowRunnerRuntimeRun;
  readonly id: string;
  readonly def: WorkflowRunnerJob;
  readonly steps: Map<string, WorkflowRunnerRuntimeRunStep>;
  readonly workingDir: typeof FSJetpack;
  readonly stageDir: typeof FSJetpack;
  readonly logsDir: typeof FSJetpack;
  readonly context: WorkflowRunnerRuntimeContext;
  readonly output: JsonObject;
  readonly report: WorkflowRunnerRuntimeRunJobReport;
  readonly executionContainer: Container;
  readonly name: string;

  status: string;
  statusText: string;

  setup(executionContainer: Container | null): Promise<void>;
  teardown(): Promise<void>;
  contextValue(skipStepId?: string): JsonObject;
  addStep(def: WorkflowRunnerJobStep): void;
  start(): Promise<void>;
  complete(): Promise<void>;
}

export interface WorkflowRunnerRuntimeRunStep {
  readonly job: WorkflowRunnerRuntimeRunJob;
  readonly id: string;
  readonly def: WorkflowRunnerJobStep;
  readonly context: WorkflowRunnerRuntimeContext;
  readonly output: JsonObject;
  readonly commandExecutionRef: string;
  readonly report: WorkflowRunnerRuntimeRunJobStepReport;
  readonly stageFiles: string[];
  readonly stdout: Logger;
  readonly stderr: Logger;
  readonly callbackTokenId: string;
  readonly name: string;

  status: string;
  exitCode: number | null;
  error: Error | null;

  setOutput(name: string, value: Json): void;
  contextValue(withJob?: boolean): JsonObject;
  attach(to: Duplex): void;
  addFileToStage(...src: string[]): void;
  getExpressionValue<T extends Json = string>(
    expression: string | WorkflowRunnerExpression,
  ): Promise<T | null>;
  getContainerEnvironment(
    additionalInput?: JsonObject,
    additionalEnv?: JsonObject,
    host?: string,
  ): Promise<string[]>;
  start(): Promise<void>;
  complete(): Promise<void>;
}

export type ExecutePostStepCommandInput = {
  runId: string;
  step: WorkflowRunnerJobStep;
};

export type ExecuteStepCommandInput = {
  runtime: WorkflowRunnerRuntime;
  step: WorkflowRunnerRuntimeRunStep;
  name: string;
  args: string[];
};

export type ExecuteStepCommandOutput = {
  code: number | null;
  stdout: string;
  stderr: string;
};

export interface Logger extends Writable {
  getStack(): string[];
}

export type StateStepExecution = {
  id: string;
  step: WorkflowRunnerJobStep;
  stageDir: string;
  logDir: string;
  logger: Logger;
  output: JsonObject;
};

export type StateStepCommand = {
  id: string;
  name: string;
  args: string[];
};

export type RunnerCommandProvider = {
  readonly cmd: WorkflowRunnerCommand;
  name: string;
  container: DockerContainer;
  type: 'service' | 'exec';
  readonly env: string[];

  // canProcessCommand(command: string): boolean;
  // getImage?(command: string, version: string | undefined): string;
  // getContainerEnv?(env: Record<string, string>): Record<string, string>;
  // getContainerArgs?(command: string, args: string[]): string[];
  // execute?(
  //   step: FileSystemRuntimeRunStep,
  //   command: string,
  //   args: string[],
  // ): Promise<ExecuteStepCommandOutput>;
};

declare module 'fastify' {
  export interface FastifyInstance {
    runtime: WorkflowRunnerRuntime;
  }
}

export type WorkflowCliPayload = {
  workflow: Workflow;
  secrets?: Array<
    | string
    | [string, string]
    | [string, string, string]
    | { name: string; value: Json }
  >;
  keychain?: Array<string | [string, string, string]>;
  input?: JsonObject;
  unlockKey?: string;
};

export type DockerContainer = Container;

export type RuntimeEvents = {
  teardown: () => Promise<void>;
  cleanup: () => Promise<void>;
  runStarted: (run: WorkflowRunnerRuntimeRun) => void;
  runCompleted: (run: WorkflowRunnerRuntimeRun) => void;
  runTeardown: (run: WorkflowRunnerRuntimeRun) => void;
  runSetup: (run: WorkflowRunnerRuntimeRun) => void;
};
export type RuntimeEventsEmitter = TypedEmitter<RuntimeEvents>;

export type RuntimeRunEvents = {
  started: (run: WorkflowRunnerRuntimeRun) => void;
  completed: (run: WorkflowRunnerRuntimeRun) => void;
  setup: (run: WorkflowRunnerRuntimeRun) => void;
  teardown: (run: WorkflowRunnerRuntimeRun) => void;
};

export type RuntimeRunEventsEmitter = TypedEmitter<RuntimeRunEvents>;

export interface WorkflowRunnerRuntimePlugin {
  setup(runtime: WorkflowRunnerRuntime): Promise<void>;
  teardown(): Promise<void>;
}

export interface WorkflowRunnerRuntimePluginConstructor {
  new (options?: JsonObject): WorkflowRunnerRuntimePlugin;
}
