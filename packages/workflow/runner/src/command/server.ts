import fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from 'fastify';

import { invariant } from '@elwood/common';

import type { WorkflowRunnerRuntime } from '../types';
import debug from '../libs/debug';
import { executeCommand } from './execute/execute';

const log = debug('command:server');

export async function createCommandServer(
  runtime: WorkflowRunnerRuntime,
): Promise<FastifyInstance> {
  log('creating ');

  const app = fastify({
    ignoreTrailingSlash: true,
    logger: false,
  });

  // default error handler to print to console
  app.setErrorHandler(function (error, _request, reply) {
    console.error(error);
    reply.status(reply.statusCode ?? 500).send({ ok: false });
  });

  // pass along our existing decorations
  // to make it easier for the bridge to
  // use the same decorations as the worker
  app.decorate('runtime', runtime);

  // static
  const { staticFiles = {} } = runtime.config;

  if (staticFiles) {
    Object.keys(staticFiles).forEach((prefix) => {
      const dir = staticFiles[prefix];
      app.register(require('@fastify/static'), {
        root: dir,
        prefix: `/${prefix}`,
        decorateReply: false,
      });
    });
  }

  // handlers
  app.route({
    method: 'POST',
    url: '/',
    handler: commandHandler,
    schema: {
      body: {
        type: 'object',
        properties: {
          execution_id: { type: 'string' },
          name: { type: 'string' },
          args: { type: 'array' },
        },
      },
    },
  });

  await app.listen({
    port: runtime.config.commandServerPort ?? 4000,
    host: '0.0.0.0',
  });

  return app;
}

// the command handler allows step containers to run
// commands against other docker containers, without
// having to let them have access to docker processes
//
// commands should be standardized and carefully consider
// user input
async function commandHandler(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  log(' request(%o)', req.body);

  try {
    const { runtime } = req.server;
    const input = req.body as {
      name: string;
      args: string[];
      execution_id: string;
    };

    const executionRef = runtime.commandExecutionRefs.get(input.execution_id);

    invariant(executionRef, 'execution_id must be defined');

    const step = runtime.runs
      .get(executionRef[0])
      ?.jobs.get(executionRef[1])
      ?.steps.get(executionRef[2]);

    invariant(step, 'step not found');

    const output = await executeCommand({
      runtime,
      step,
      name: input.name,
      args: input.args,
    });

    reply.send(output);
  } catch (err) {
    log(' err(%o)', err);

    reply.send({
      code: 1,
      data: '',
    });
  }
}
