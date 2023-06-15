import fp from 'fastify-plugin';
import { Client } from 'pg';

import { getAuthTokenFromRequest } from '../../libs/get-auth-token';
import type {
  ObjectRequestPath,
  ObjectHandlerOptions,
  FastifyRequest,
  FastifyReply,
} from '../../types';

import treeHandler from './tree';
import rawHandler from './raw';
import blobHandler from './blob';
import shareHandler from './share';

type Handler = (options: ObjectHandlerOptions) => Promise<void>;

export type ObjectOptions = {
  db: Client;
};

export default fp<ObjectOptions>(async (app, opts) => {
  const { db } = opts;

  function withHandlerOptions(callback: Handler) {
    return async (req: FastifyRequest, res: FastifyReply) =>
      await callback({
        db,
        req,
        res,
        params: normalizeRequestPath(req.params['*']),
        authToken: getAuthTokenFromRequest(req),
      });
  }

  app.get('/tree/*', withHandlerOptions(treeHandler));
  app.get('/blob/*', withHandlerOptions(blobHandler));
  app.get('/share/*', withHandlerOptions(shareHandler));
  app.get('/raw/*', withHandlerOptions(rawHandler));
});

export function normalizeRequestPath(raw: string): ObjectRequestPath {
  const pathParts = raw.split('/');
  const path = pathParts.slice(1).join('/');

  if (pathParts[0].startsWith(':')) {
    return {
      type: 'remote',
      id: pathParts[0],
      path,
    };
  }

  return {
    type: 'oid',
    id: pathParts[0],
    path,
  };
}
