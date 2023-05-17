import type { Json } from '@elwood-studio/types';
import UrlPattern from 'url-pattern';

export interface ServerContext {
  createRoute<Handler extends ServerRouteHandler = ServerRouteHandler>(
    method: string,
    path: string,
    handler: Handler,
  ): ServerRoute;

  addRoute(route: ServerRoute): void;
  routes: ServerRoute[];
}

export interface ServerRequest<
  Context extends ServerContext = ServerContext,
  Params extends any = any,
  Body extends any = any,
> {
  url: string;
  method: string;
  body: Body;
  params: Params;
  context: Context;
}

export type ServerResponse = {
  status: number;
  body: Json;
};

export type ServerRouteHandler<Request extends ServerRequest = ServerRequest> =
  (req: Request) => Promise<ServerResponse>;

export type ServerRoute = {
  pattern: UrlPattern;
  handler: ServerRouteHandler;
};
