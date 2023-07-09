import { invariant } from '@elwood/common';
import * as FileSystem from 'fs-jetpack';

import {
  WorkflowRunnerJob,
  WorkflowRunnerJobStep,
} from '@elwood/workflow-types';

import type {
  WorkflowRunnerRuntimeRunJob,
  WorkflowRunnerRuntimeRun,
  WorkflowRunnerRuntimeRunJobStepReport,
} from '../types';
import debug from '../libs/debug';
import { RunnerStatus } from '../constants';
import { RuntimeTimer } from './timer';
import { RuntimeRunContext } from './context';
import { RuntimeRunStep } from './step';

export class RuntimeRunJob implements WorkflowRunnerRuntimeRunJob {
  readonly #context = new RuntimeRunContext();
  readonly #steps: Map<string, RuntimeRunStep> = new Map();
  readonly #workingDir: typeof FileSystem;
  // readonly #stageDir: typeof FileSystem;
  readonly #logDir: typeof FileSystem;
  readonly #timer = new RuntimeTimer();

  #status = RunnerStatus.Pending;
  #statusText = '';
  #executionContainer:
    | WorkflowRunnerRuntimeRunJob['executionContainer']
    | null = null;
  #log: ReturnType<typeof debug>;

  constructor(
    public readonly run: WorkflowRunnerRuntimeRun,
    public readonly id: string,
    public readonly def: WorkflowRunnerJob,
  ) {
    this.#workingDir = run.rootDir.dir(id);
    // this.#stageDir = this.#workingDir.dir('stage');
    this.#logDir = this.workingDir.dir('logs');
    this.#log = debug(`runtime:job:${this.id}`);

    for (const step of def.steps) {
      this.addStep(step);
    }
  }

  get name() {
    return this.def.name ?? this.id;
  }

  get context() {
    return this.#context;
  }

  get workingDir() {
    return this.#workingDir;
  }

  get stageDir() {
    // TODO: figure out job specific stage dir
    return this.run.stageDir;

    // return this.#stageDir;
  }

  get logsDir() {
    return this.#logDir;
  }

  get steps() {
    return this.#steps;
  }

  get output() {
    return Array.from(this.#steps.values()).reduce((acc, item) => {
      return {
        ...acc,
        [item.id]: item.output,
      };
    }, {});
  }

  get report() {
    return {
      id: this.id,
      name: this.name,
      time: this.#timer.report(),
      status: { value: this.#status, reason: this.#statusText },
      steps: Array.from(this.#steps.values()).reduce((acc, item) => {
        return [...acc, item.report];
      }, [] as WorkflowRunnerRuntimeRunJobStepReport[]),
    };
  }

  get status() {
    return this.#status;
  }

  set status(status: RunnerStatus) {
    this.#status = status;
  }

  get statusText() {
    return this.#statusText;
  }

  set statusText(value: string) {
    this.#statusText = value;
  }

  get executionContainer() {
    invariant(this.#executionContainer, 'executionContainer is not set');
    return this.#executionContainer;
  }

  async setup(
    executionContainer:
      | WorkflowRunnerRuntimeRunJob['executionContainer']
      | null = null,
  ) {
    this.#executionContainer = executionContainer;
    await this.#executionContainer?.start();
    this.#log('setup');
  }

  async teardown() {
    this.#log('teardown');
    if (this.#executionContainer) {
      await this.#executionContainer.stop();
      await this.#executionContainer.remove();
    }

    // in dev we don't teardown the working dir
    // in case we want to see the results
    // if (process.env.NODE_ENV !== 'development') {
    //   await this.#workingDir.removeAsync();
    // }
  }

  contextValue(skipStepId: string | undefined = undefined) {
    const data = {
      name: this.def.name,
      steps: Array.from(this.steps.values())
        .filter((item) => item.id !== skipStepId)
        .reduce((acc, item) => {
          return {
            ...acc,
            [item.def.name]: {
              output: item.output,
            },
          };
        }, {}),
      matrix: this.context.get('matrix'),
      input: this.run.context.get('input'),
      elwood: this.run.context.get('elwood') ?? {},
    };

    return data;
  }

  addStep(def: WorkflowRunnerJobStep): RuntimeRunStep {
    const id = this.run.runtime.uuid('s');
    const step = new RuntimeRunStep(this, id, def);
    this.#steps.set(id, step);
    this.#log('addStep %s', id);
    return step;
  }

  async start() {
    this.#timer.start();
  }

  async complete(): Promise<void> {
    this.#timer.stop();
  }
}
