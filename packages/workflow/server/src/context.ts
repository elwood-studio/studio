import {
  type WorkflowRunnerRuntime,
  createRuntime,
} from '@elwood-studio/workflow-runner';
import type {
  WorkflowServerOptions,
  WorkflowServerOptionsPlugin,
  WorkflowServerRoute,
  WorkflowServerContext,
} from './types';
import { createRoute } from './libs/router';

import { default as reportHandler } from './handler/report';
import { default as runHandler } from './handler/run';
import { default as listHandler } from './handler/list';

export class ServerContext implements WorkflowServerContext {
  #routes: WorkflowServerRoute[] = [
    createRoute('get', '/', listHandler),
    createRoute('get', '/:id/report', reportHandler),
    createRoute('post', '/', runHandler),
    createRoute('put', '/:id', runHandler),
    createRoute('get', '/ping', async () => {
      return {
        status: 200,
        body: 'pong',
      };
    }),
  ];

  static async create(options: WorkflowServerOptions) {
    const ctx = new ServerContext(
      options,
      await createRuntime(options.runtime),
    );

    if (Array.isArray(options.plugins)) {
      for (const plugin of options.plugins) {
        await ctx.registerPlugin(plugin);
      }
    }

    return ctx;
  }

  constructor(
    public readonly options: WorkflowServerOptions,
    public readonly runtime: WorkflowRunnerRuntime,
  ) {}

  get routes() {
    return this.#routes;
  }

  async registerPlugin(plugin: WorkflowServerOptionsPlugin): Promise<void> {
    if (!Array.isArray(plugin)) {
      return await this.registerPlugin([plugin, {}]);
    }

    const [plg, options] = plugin;

    if (typeof plg === 'string') {
      const mod = require(plg);
      const PluginClass = mod.default || mod;
      return await this.registerPlugin([new PluginClass[plg](), options]);
    }

    await plg.register(options, this);
  }

  addRoute(route: WorkflowServerRoute): void {
    this.#routes.push(route);
  }
}
