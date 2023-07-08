import { invariant } from '@elwood/common';

import type {
  WorkflowRunnerConfiguration,
  WorkflowRunnerRuntimePluginConstructor,
} from '../types';
import { Runtime } from '../runtime/runtime';
import { createCommandServer } from '../command/server';

import { CleanRunStagePlugin } from '../plugins/clean-run-stage';

export async function createRuntime(
  config: WorkflowRunnerConfiguration,
): Promise<Runtime> {
  const context = config.context ?? 'local';
  const commandContext = config.commandContext ?? 'local';
  const plugins = config.plugins ?? [];

  const { dockerSocketPath } = config;

  invariant(
    context !== 'container',
    '@depreciated context "container" is no longer supported',
  );
  invariant(!dockerSocketPath, 'docker is no longer supported');

  // create a new runtime with our normalized configuration
  const runtime = new Runtime({ ...config, context, commandContext });

  plugins.push(CleanRunStagePlugin as WorkflowRunnerRuntimePluginConstructor);

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
