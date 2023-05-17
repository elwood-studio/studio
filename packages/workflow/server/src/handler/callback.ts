import type { FastifyRequest, FastifyReply } from 'fastify';
import { invariant } from 'ts-invariant';

import { handleWorkflowCallback } from '@elwood-studio/workflow-runner';

import type { WorkflowServerCallbackInput } from '../types';

export default async function handler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  console.log('request.callback(%o)', req.body);
  const { token, payload } = req.body as WorkflowServerCallbackInput;

  try {
    invariant(token, 'Missing token');

    // always process in the next tick so we
    // don't wait for the callback to complete
    process.nextTick(async () => {
      await handleWorkflowCallback(req.server.runtime, token, payload);
    });

    reply.send({
      ok: true,
    });
  } catch (err) {
    reply.status(400);
    reply.send({
      req_error: true,
    });
  }
}
