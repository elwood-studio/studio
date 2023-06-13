import { EventEmitter } from 'events';

import * as FileSystem from 'fs-jetpack';

import type {
  WorkflowRunnerJob,
  WorkflowRunnerInstructions,
  WorkflowRunnerInput,
} from '@elwood-studio/workflow-types';
import type { WorkflowSecretsManager } from '@elwood-studio/workflow-secrets';
import {
  getWorkflowKeychainFromInput,
  getWorkflowSecretsFromInput,
  normalizeWorkflowInput,
  getTrackingIdFromInput,
} from '@elwood-studio/workflow-config';

import type {
  WorkflowRunnerRuntimeRunJob,
  WorkflowRunnerRuntimeRun,
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimeRunJobReport,
  RunnerCommandProvider,
  RuntimeRunEventsEmitter,
} from '../types';
import { RunnerStatus } from '../constants';
import { createCommandContainer } from '../libs/docker';
import debug from '../libs/debug';
import { RuntimeRunContext } from './context';
import { RuntimeRunJob } from './job';
import { RuntimeTimer } from './timer';
import { JsonObject } from '@elwood-studio/types';

export class RuntimeRun implements WorkflowRunnerRuntimeRun {
  readonly #context = new RuntimeRunContext();
  readonly #jobs: Map<string, WorkflowRunnerRuntimeRunJob> = new Map();
  readonly #rootDir: typeof FileSystem;
  readonly #stageDir: typeof FileSystem;
  readonly #commandProviders: RunnerCommandProvider[] = [];
  readonly #emitter = new EventEmitter() as RuntimeRunEventsEmitter;
  readonly #timer = new RuntimeTimer();

  #status: string = RunnerStatus.Pending;
  #statusText = '';

  #log: ReturnType<typeof debug>;

  constructor(
    public readonly runtime: WorkflowRunnerRuntime,
    public readonly id: string,
    public readonly def: WorkflowRunnerInstructions,
    public readonly secretsManager: WorkflowSecretsManager,
  ) {
    this.#rootDir = runtime.workingDir.dir(id);
    this.#stageDir = this.#rootDir.dir('stage');
    this.#log = debug(`runtime:run:${id}`);
    this.#log('run created');
  }

  get rootDir() {
    return this.#rootDir;
  }

  get stageDir() {
    return this.#stageDir;
  }

  get context() {
    return this.#context;
  }

  get jobs() {
    return this.#jobs;
  }

  get commandProviders() {
    return this.#commandProviders;
  }

  get output() {
    return Array.from(this.#jobs.values()).reduce((acc, item) => {
      return {
        ...acc,
        [item.id]: item.output,
      };
    }, {});
  }

  get report() {
    return {
      time: this.#timer.report(),
      status: { value: this.#status, reason: this.#statusText },
      jobs: Array.from(this.#jobs.values()).reduce((acc, item) => {
        return [...acc, item.report];
      }, [] as WorkflowRunnerRuntimeRunJobReport[]),
    };
  }

  get status() {
    return this.#status;
  }

  set status(value: string) {
    this.#status = value;
  }

  get statusText() {
    return this.#statusText;
  }

  set statusText(text: string) {
    this.#statusText = text;
  }

  hasCommandProvider(name: string) {
    return (
      this.commandProviders.find((provider) => provider.name === name) !==
      undefined
    );
  }

  on = ((...args) => {
    this.#emitter.on(...args);
  }) as RuntimeRunEventsEmitter['on'];

  async addCommandProvider(...providers: RunnerCommandProvider[]) {
    for (const provider of providers) {
      this.#log('adding provider %s', provider.name);

      try {
        provider.container = await createCommandContainer(
          this.runtime.docker,
          this,
          provider.cmd['container'],
        );
        await provider.container.start();
        this.commandProviders.push(provider);
      } catch (err) {
        throw new Error(
          `Failed to start command provider "${provider.name}": ${
            (err as Error).message
          }`,
        );
      }
    }
  }

  contextValue() {
    return this.#context.data;
  }

  async setup(input: WorkflowRunnerInput, context: JsonObject = {}) {
    this.#log('setup');

    if (context && typeof context === 'object') {
      Object.entries(context).forEach(([key, value]) => {
        this.#context.set(key, value);
      });
    }

    const keychain = getWorkflowKeychainFromInput(input);
    const secrets = getWorkflowSecretsFromInput(input);
    const trackingId = getTrackingIdFromInput(input);

    if (Array.isArray(keychain)) {
      await Promise.all(
        keychain.map(async (key) => {
          await this.secretsManager.addKey(key);
        }),
      );
    }

    if (Array.isArray(secrets)) {
      await Promise.all(
        secrets.map(async (secret) => {
          await this.secretsManager.addSecret(secret);
        }),
      );
    }

    this.#context.set('trackingId', trackingId);
    this.#context.set('input', normalizeWorkflowInput(input));
    this.#emitter.emit('setup', this);
  }

  async teardown() {
    this.#log('teardown');
    this.#emitter.emit('teardown', this);
  }

  addJob(def: WorkflowRunnerJob): WorkflowRunnerRuntimeRunJob {
    const id = this.runtime.uuid('j');
    const job = new RuntimeRunJob(this, id, def);
    this.#jobs.set(id, job);
    this.#log('added job %s', id);
    return job;
  }

  async start() {
    this.#timer.start();
    this.#log('started');
    this.#emitter.emit('started', this);
  }

  async complete(
    status: string | undefined = undefined,
    text: string | undefined = undefined,
  ) {
    status && (this.#status = status);
    text && (this.#statusText = text);
    this.#emitter.emit('completed', this);
    this.#log('complete');
    this.#timer.stop();
  }
}
