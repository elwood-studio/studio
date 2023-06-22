import type { Duplex } from 'stream';

import invariant from 'ts-invariant';

import type { Json, JsonObject } from '@elwood/types';
import type {
  WorkflowRunnerExpression,
  WorkflowRunnerJobStep,
} from '@elwood/workflow-types';

import type {
  WorkflowRunnerRuntimeRunJob,
  WorkflowRunnerRuntimeRunStep,
} from '../types';
import { Logger } from '../libs/logger';
import { RunStepInputPrefix, RunnerStatus } from '../constants';
import { getExpressionValue } from '../libs/expression';
import { nativeCommands } from '../command/native';
import debug from '../libs/debug';
import { RuntimeRunContext } from './context';
import { RuntimeTimer } from './timer';

// JOB STEP
export class RuntimeRunStep implements WorkflowRunnerRuntimeRunStep {
  readonly #context = new RuntimeRunContext();
  readonly #stdout = new Logger(null);
  readonly #stderr = new Logger(null);
  readonly #stageFiles: string[] = [];
  readonly commandExecutionRef: string;
  readonly callbackTokenId: string;
  readonly #timer = new RuntimeTimer();

  #output: JsonObject = {};
  #status = RunnerStatus.Pending;
  #exitCode: number | null = null;
  #error: Error | null = null;
  #log: ReturnType<typeof debug>;

  constructor(
    public readonly job: WorkflowRunnerRuntimeRunJob,
    public readonly id: string,
    public readonly def: WorkflowRunnerJobStep,
  ) {
    this.commandExecutionRef = this.job.run.runtime.setCommandExecutionRef(
      job.run.id,
      job.id,
      id,
    );
    this.#stdout.name = `${id}.stdout`;
    this.#stderr.name = `${id}.stderr`;
    this.callbackTokenId = job.run.runtime.uuid('CB');
    this.#log = debug(`runtime:step:${id}`);
  }

  get name() {
    return this.def.name ?? this.id;
  }

  get context() {
    return this.#context;
  }

  get status() {
    return this.#status;
  }

  set status(value: RunnerStatus) {
    this.#status = value;
  }

  set exitCode(value: number | null) {
    invariant(this.#exitCode === null, 'Exit code already set');
    this.#exitCode = value;
  }

  get exitCode() {
    return this.#exitCode;
  }

  get output() {
    return this.#output;
  }

  get stdout() {
    return this.#stdout;
  }

  get stderr() {
    return this.#stderr;
  }

  get report() {
    return {
      id: this.id,
      name: this.name,
      time: this.#timer.report(),
      status: this.status,
      code: this.#exitCode,
      output: this.output,
      stdout: this.#stdout.getStack(),
      stderr: this.#stderr.getStack(),
    };
  }

  get stageFiles() {
    return this.#stageFiles;
  }

  get error() {
    return this.#error;
  }

  set error(err: Error | null) {
    invariant(this.#error === null, 'Error already set');
    this.#error = err;
  }

  contextValue(_withJob = true) {
    const data = {
      input: this.job.run.context.get('input'),
      jobs: Array.from(this.job.run.jobs.values())
        .filter((item) => item.id !== this.job.id)
        .reduce((acc, item) => {
          return {
            ...acc,
            [item.def.name]: item.contextValue(),
          };
        }, {}),
      job: this.job.contextValue(this.id),
      step: {
        ...this.context.data,
        status: this.status,
        name: this.def.name,
      },
      output: this.#output,
      env: this.job.run.context.get('env') ?? {},
      elwood: this.job.run.context.get('elwood') ?? {},
    };

    return data;
  }

  attach(to: Duplex) {
    this.#log('attached');
    this.job.executionContainer.modem.demuxStream(
      to,
      this.#stdout,
      this.#stderr,
    );
  }

  setOutput(name: string, value: Json): void {
    if (String(value).startsWith('json:')) {
      this.#output[name] = JSON.parse(String(value).slice(5));
      return;
    }

    this.#output[name] = value;
  }

  addFileToStage(...src: string[]) {
    this.#stageFiles.push(...src);
  }

  async getExpressionValue<T extends Json = string>(
    expression: string | WorkflowRunnerExpression,
  ): Promise<T | null> {
    return await getExpressionValue<T>(
      this.job.run.runtime,
      expression,
      this.contextValue(),
      {
        secrets: this.job.run.secretsManager,
      },
    );
  }
  async getContainerEnvironment(
    additionalInput: JsonObject = {},
    additionalEnv: JsonObject = {},
    host = 'runner',
  ): Promise<string[]> {
    const values: string[] = [
      `__COMMAND_SERVER_EXECUTION_ID=${this.commandExecutionRef}`,
      `__COMMAND_SERVER_URL=http://${host}:${this.job.run.runtime.config.commandServerPort}/`,
      `__COMMAND_SERVER_CMD_LIST=${nativeCommands.join(',')}`,
    ];
    const input = { ...additionalInput, ...(this.def.input ?? {}) };
    const env = {
      ...additionalEnv,
      ...(this.job.run.def.env ?? {}),
      ...(this.job.def.env ?? {}),
      ...(this.def.env ?? {}),
    };

    for (const key of Object.keys(input)) {
      const value = await this.getExpressionValue(input[key]);
      values.push(`${RunStepInputPrefix}${key.toUpperCase()}=${value}`);
    }

    for (const key of Object.keys(env)) {
      if (!key.startsWith('__')) {
        const value = await this.getExpressionValue(env[key]);
        values.push(`${key.toUpperCase()}=${value}`);
      }
    }

    return values;
  }

  async start() {
    this.#timer.start();
  }

  async complete() {
    this.#timer.stop();
  }
}
