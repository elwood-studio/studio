import UrlPattern from 'url-pattern';
import { JsonObject } from '@elwood-studio/types';
import type {
  ServerContext,
  ServerRequest,
  ServerResponse,
  ServerRoute,
  ServerRouteHandler,
} from './types';

export abstract class AbstractServerContext<
  Request extends ServerRequest = ServerRequest,
> implements ServerContext
{
  #routes: ServerRoute[] = [];

  get routes() {
    return this.#routes;
  }

  createRoute(
    method: string,
    path: string,
    handler: ServerRouteHandler<Request>,
  ): ServerRoute {
    const patternOptions = {
      segmentValueCharset: 'a-zA-Z0-9-_~%.',
    };

    return {
      pattern: new UrlPattern(
        [method.toLowerCase(), normalizePath(path)].join('/'),
        patternOptions,
      ),
      handler: handler as ServerRouteHandler,
    };
  }

  async route(req: Omit<Request, 'context'>): Promise<ServerResponse> {
    for (const { pattern, handler } of this.#routes) {
      const match = pattern.match(
        [req.method.toLowerCase(), normalizePath(req.url)].join('/'),
      );
      if (match) {
        try {
          return await handler({
            ...req,
            context: this,
            params: {
              ...req.params,
              ...(match as JsonObject),
            },
          });
        } catch (err) {
          console.log(err);

          return {
            status: 500,
            body: { code: 500, error: true },
          };
        }
      }
    }

    return {
      status: 404,
      body: { code: 404, error: true },
    };
  }

  addRoute(...route: ServerRoute[]): void {
    this.#routes.push(...route);
  }
}

export function normalizePath(path: string): string {
  return path.trim().replace(/^\//, '');
}
