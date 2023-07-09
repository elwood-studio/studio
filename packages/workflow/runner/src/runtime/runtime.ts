import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';

import { v4 as randomUUID } from 'uuid';
import { invariant } from '@elwood/common';
import FileSystem from 'fs-jetpack';
import axios from 'axios';
import type { FastifyInstance } from 'fastify';

import type { JsonObject } from '@elwood/types';
import type {
  WorkflowRunnerInstructions,
  WorkflowActionRegistry,
} from '@elwood/workflow-types';
import type { WorkflowSecretsManager } from '@elwood/workflow-secrets';

import type {
  RuntimeEventsEmitter,
  WorkflowRunnerConfiguration,
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimePlugin,
  WorkflowRunnerRuntimePluginConstructor,
  WorkflowRunnerRuntimeRun,
} from '../types';
import { EnvName } from '../constants';
import debug from '../libs/debug';
import { RuntimeRun } from './run';
import { RuntimeRunContext } from './context';

const log = debug('runtime');

export class Runtime implements WorkflowRunnerRuntime {
  readonly #context = new RuntimeRunContext();
  readonly #runs: Map<string, WorkflowRunnerRuntimeRun> = new Map();
  readonly #workingDir: typeof FileSystem;
  readonly #commandExecutionRefs: Map<string, [string, string, string]> =
    new Map();
  readonly #emitter = new EventEmitter() as RuntimeEventsEmitter;
  readonly #plugins: WorkflowRunnerRuntimePlugin[] = [];

  #commandServer: FastifyInstance | null = null;
  #actionRegistry: Record<string, WorkflowActionRegistry> = {};

  constructor(public readonly config: WorkflowRunnerConfiguration) {
    this.#workingDir = FileSystem.cwd(config.workingDir);
    this.#workingDir.remove();
    this.#workingDir.dir('.');
  }

  async teardown() {
    this.#emitter.emit('teardown');
    await this.commandServer.close();
    for (const plugin of this.#plugins) {
      await plugin.teardown();
    }
  }

  async cleanup() {
    this.#emitter.emit('cleanup');
    await this.workingDir.removeAsync();
  }

  get plugins() {
    return this.#plugins;
  }

  get context() {
    return this.#context;
  }

  get workingDir() {
    return this.#workingDir;
  }

  get runs() {
    return this.#runs;
  }

  get commandExecutionRefs() {
    return this.#commandExecutionRefs;
  }

  get commandServer() {
    invariant(this.#commandServer, 'Command server not initialized');
    return this.#commandServer;
  }

  set commandServer(value: FastifyInstance) {
    invariant(
      this.#commandServer === null,
      'Command server already initialized',
    );
    this.#commandServer = value;
  }

  on = ((...args) => {
    this.#emitter.on(...args);
  }) as RuntimeEventsEmitter['on'];
  off = ((...args) => {
    this.#emitter.off(...args);
  }) as RuntimeEventsEmitter['off'];

  async registerPlugin(
    PluginClass: WorkflowRunnerRuntimePluginConstructor,
    options: JsonObject = {},
  ) {
    const plugin = new PluginClass(options);
    await plugin.setup(this);
    this.#plugins.push(plugin);
  }

  setCommandExecutionRef(run: string, job: string, step: string) {
    const ref = this.uuid('ce');
    this.#commandExecutionRefs.set(ref, [run, job, step]);
    return ref;
  }

  uuid(prefix = '') {
    return `${prefix}${randomUUID()}${randomBytes(5).toString('hex')}`
      .replace(/-/g, '')
      .toUpperCase()
      .slice(0, 32);
  }

  addRun(
    instructions: WorkflowRunnerInstructions,
    secretsManager: WorkflowSecretsManager,
  ): WorkflowRunnerRuntimeRun {
    invariant(instructions, 'Must provide "instructions" to runtime.addRun()');
    invariant(
      secretsManager,
      'Must provide "secretsManager" to runtime.addRun()',
    );

    const id = randomUUID();
    const run = new RuntimeRun(this, id, instructions, secretsManager);
    this.#runs.set(run.id, run);

    // proxy the run events. that's important
    run.on('setup', (run) => {
      this.#emitter.emit('runSetup', run);
    });
    run.on('started', (run) => {
      this.#emitter.emit('runStarted', run);
    });
    run.on('completed', (run) => {
      this.#emitter.emit('runCompleted', run);
    });
    run.on('teardown', (run) => {
      this.#emitter.emit('runTeardown', run);
    });

    log('run %s added', id);

    return run;
  }

  async removeRun(id: string) {
    this.getRun(id);
    this.#runs.delete(id);

    log('run %s removed', id);
  }

  getRun(id: string) {
    log(
      'get run %s. available: %s',
      id,
      Array.from(this.#runs.keys()).join(', '),
    );

    invariant(this.#runs.has(id), `Run ${id} does not exist`);
    return this.#runs.get(id);
  }

  get stdLibUrl() {
    const {
      [EnvName.StdLibBaseUrl]: stdLibBaseUrl = 'https://x.elwood.studio/a',
    } = process.env;

    return this.config.stdLibBaseUrl ?? stdLibBaseUrl;
  }

  get stdLibHeadUrl() {
    const {
      [EnvName.StdLibHeadBaseUrl]:
        stdHeadLibBaseUrl = 'https://x.elwood.studio/a',
    } = process.env;

    return this.config.stdLibHeadUrl ?? stdHeadLibBaseUrl;
  }

  get registryUrl() {
    return this.config.registryUrl ?? this.stdLibUrl;
  }

  getStdLibUrl(
    name: string,
    version = this.config.stdLibDefaultVersion ?? 'main',
  ): string {
    return version
      ? `${this.stdLibUrl}@${version}/${name}.ts`
      : `${this.stdLibUrl}/${name}.ts`;
  }

  async getStdLibRegistry(version = 'main'): Promise<WorkflowActionRegistry> {
    if (!this.#actionRegistry[version]) {
      const registryUrl = `${this.registryUrl}/registry.json`;

      log('getStdLibRegistry url %s', registryUrl);
      const response = await axios.get(registryUrl);

      if (response.status === 200) {
        const data =
          typeof response.data === 'string'
            ? JSON.parse(response.data)
            : response.data;

        this.#actionRegistry[version] = data as WorkflowActionRegistry;
      }

      log('getStdLibRegistry -> %o', this.#actionRegistry);
    }

    return this.#actionRegistry[version];
  }
}
