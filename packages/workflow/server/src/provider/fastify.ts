import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { JsonObject } from '@elwood-studio/types';
import type { WorkflowRunnerRuntime } from '@elwood-studio/workflow-runner';

import type { WorkflowServerOptions, WorkflowHandlerRequest } from '../types';
import * as router from '../libs/router';
import { ServerContext } from '../context';

declare module 'fastify' {
  interface FastifyInstance {
    runtime: WorkflowRunnerRuntime;
  }
}

const plugin: FastifyPluginAsync<WorkflowServerOptions> =
  async function workflowServerPlugin(app, options) {
    const ctx = await ServerContext.create(options);
    const runtime = ctx.runtime;

    app.decorate('runtime', runtime);

    // support prefix that is broken by fp
    app.register(
      async (a) => {
        a.route({
          method: ['GET', 'POST', 'PUT', 'DELETE'],
          url: '/*',
          handler: async (request, reply) => {
            const req: WorkflowHandlerRequest = {
              url: request.url,
              method: request.method,
              body: request.body as JsonObject,
              params: {},
              context: ctx,
            };

            const { status, body } = await router.route(ctx.routes, req);

            reply.status(status).send(body);
          },
        });

        a.addContentTypeParser('*', function (_request, payload, done) {
          var data = '';
          payload.on('data', (chunk) => {
            data += chunk;
          });
          payload.on('end', () => {
            done(null, data);
          });
        });
      },
      { prefix: options.prefix },
    );
  };

export default fp<WorkflowServerOptions>(plugin, {
  fastify: '4.x',
});
