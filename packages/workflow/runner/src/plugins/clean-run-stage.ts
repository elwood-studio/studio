import { JsonObject } from '@elwood-studio/types';

import type {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimePlugin,
  WorkflowRunnerRuntimeRun,
} from '../types';

export class CleanRunStagePlugin implements WorkflowRunnerRuntimePlugin {
  #runtime: WorkflowRunnerRuntime | null = null;

  constructor(protected readonly options: JsonObject) {}

  async setup(runtime: WorkflowRunnerRuntime) {
    this.#runtime = runtime;
    runtime.on('runTeardown', this.cleanup);
  }

  async teardown(): Promise<void> {
    this.#runtime?.off('runTeardown', this.cleanup);
  }

  cleanup = (run: WorkflowRunnerRuntimeRun) => {
    run.rootDir.remove();
  };
}
