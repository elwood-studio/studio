import { dir } from 'fs-jetpack';

import { JsonObject } from '@elwood/types';

import type {
  WorkflowRunnerRuntime,
  WorkflowRunnerRuntimePlugin,
  WorkflowRunnerRuntimeRun,
} from '../types';

export class FileReporterPlugin implements WorkflowRunnerRuntimePlugin {
  #runtime: WorkflowRunnerRuntime | null = null;

  constructor(protected readonly options: JsonObject) {}

  async setup(runtime: WorkflowRunnerRuntime) {
    this.#runtime = runtime;
    runtime.on('runCompleted', this.writeRunReport);
  }

  async teardown(): Promise<void> {
    this.#runtime?.off('runCompleted', this.writeRunReport);
  }

  writeRunReport = (run: WorkflowRunnerRuntimeRun) => {
    const outDir = this.options.outDir ?? this.#runtime?.config.workingDir;
    dir(outDir).write(`${run.id}.json`, run.report);
  };
}
