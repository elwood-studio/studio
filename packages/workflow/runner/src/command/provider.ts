import type { WorkflowRunnerCommand } from '@elwood-studio/workflow-types';
import invariant from 'ts-invariant';

import type { RunnerCommandProvider, DockerContainer } from '../types';

export class CommandProvider implements RunnerCommandProvider {
  #container: DockerContainer | null = null;
  #name: string;
  #type: RunnerCommandProvider['type'] = 'exec';

  constructor(
    public readonly cmd: WorkflowRunnerCommand,
    public readonly env: string[] = [],
  ) {
    this.#name = cmd.name;
  }

  get name() {
    return this.#name;
  }

  protected setName(name: string) {
    this.#name = name;
  }

  set container(container: DockerContainer) {
    this.#container = container;
  }

  get container() {
    invariant(this.#container, 'container is not set');
    return this.#container;
  }

  get type() {
    return this.#type;
  }
}
