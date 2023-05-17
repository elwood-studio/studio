import type { JsonObject } from '@elwood-studio/types';
import UrlPattern from 'url-pattern';

import type {
  WorkflowHandlerResponse,
  WorkflowHandlerRequest,
  WorkflowServerRoute,
  WorkflowServerRouteHandler,
} from '../types';

function normalizePath(path: string): string {
  return path.trim().replace(/^\//, '');
}

export async function route(
  routes: WorkflowServerRoute[],
  req: Omit<WorkflowHandlerRequest, 'params'>,
): Promise<WorkflowHandlerResponse> {
  for (const { pattern, handler } of routes) {
    const match = pattern.match(
      [req.method.toLowerCase(), normalizePath(req.url)].join('/'),
    );
    if (match) {
      return await handler({
        ...req,
        params: match as JsonObject,
      });
    }
  }

  return {
    status: 404,
    body: { error: true },
  };
}

export function createRoute(
  method: string,
  path: string,
  handler: WorkflowServerRouteHandler,
): WorkflowServerRoute {
  return {
    pattern: new UrlPattern(
      [method.toLowerCase(), normalizePath(path)].join('/'),
    ),
    handler,
  };
}
