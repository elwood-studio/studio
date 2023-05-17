import invariant from 'ts-invariant';

import type {
  WorkflowRunnerRuntime,
  WorkflowRunnerConfiguration,
} from '../types';
import { Runtime } from '../runtime/runtime';
import { createCommandServer } from '../command/server';
import { createDocker } from './docker';

export async function createRuntime(
  config: WorkflowRunnerConfiguration,
): Promise<Runtime> {
  const context = config.context ?? 'local';
  const commandContext = config.commandContext ?? 'local';
  const plugins = config.plugins ?? [];

  const { dockerSocketPath } = config;
  let docker: WorkflowRunnerRuntime['docker'] | null = null;

  if (dockerSocketPath) {
    docker = await createDocker({
      socketPath: dockerSocketPath,
    });

    // docker must be initiated successfully before
    // we can continue. error out if docker == null
    // which will happen if the docker socket is not open
    invariant(docker, 'docker must be defined');
  }

  // if either of the context providers is container
  // we need docker to be setup
  invariant(
    !((context === 'container' || commandContext === 'container') && !docker),
    'Docker must be defined when context or commandContext is "container"',
  );

  // create a new runtime with our normalized configuration
  const runtime = new Runtime(
    { ...config, context, commandContext },
    docker ?? undefined,
  );

  // register all the plugins
  for (const plugin of plugins) {
    const [newable, options = {}] = Array.isArray(plugin) ? plugin : [plugin];
    await runtime.registerPlugin(newable, options);
  }

  // the command server is what containers use
  // to comminute with the runtime
  runtime.commandServer = await createCommandServer(runtime);

  return runtime;
}
