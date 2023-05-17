import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import invariant from 'ts-invariant';

import type { JsonObject } from '@elwood-studio/types';

import type { WorkflowServerOptions, WorkflowHandlerRequest } from '../types';
import * as router from '../libs/router';
import { ServerContext } from '../context';

declare module 'next' {
  interface NextApiRequest {
    workflowContext: ServerContext;
    workflowResult: JsonObject;
  }
}

export function createNextJsWorkflowHandler(
  options: WorkflowServerOptions,
  next?: NextApiHandler,
): NextApiHandler {
  let _ctx: ServerContext | null = null;

  return async function nextJsRouteHandler(
    request: NextApiRequest,
    res: NextApiResponse,
  ) {
    try {
      const ctx = _ctx ?? (await ServerContext.create(options));
      const method = request.method ?? '';
      const url = (
        Array.isArray(request.query.slug)
          ? request.query.slug
          : [request.query.slug]
      ).join('/');

      invariant(request.method, 'Missing method');

      const req: WorkflowHandlerRequest = {
        url,
        method,
        body: request.body as JsonObject,
        params: {},
        context: ctx,
      };

      const { status, body } = await router.route(ctx.routes, req);

      res.status(status);

      if (next) {
        request.workflowContext = ctx;
        request.workflowResult = body;
        await Promise.resolve(next(request, res));
      } else {
        res.send(body);
      }
    } catch (_) {
      res.status(500);
      res.json({ error: true });
    }
  };
}
