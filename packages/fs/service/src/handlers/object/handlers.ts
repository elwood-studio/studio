import fp from 'fastify-plugin';
import { Client } from 'pg';

import { getAuthTokenFromRequest } from '@/libs/get-auth-token.ts';
import type {
  ObjectRequestPath,
  ObjectHandlerOptions,
  FastifyRequest,
  FastifyReply,
} from '@/types.ts';

import treeHandler from './tree.ts';
import rawHandler from './raw.ts';
import blobHandler from './blob.ts';
import shareHandler from './share.ts';
import trackHandler from './track.ts';

type Handler = (options: ObjectHandlerOptions) => Promise<void>;

export type ObjectOptions = {
  db: Client;
};

export default fp<ObjectOptions>(async (app, opts) => {
  const { db } = opts;

  function withHandlerOptions(callback: Handler) {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const { '*': wildcard } = req.params as { '*'?: string };

      return await callback({
        db,
        req,
        res,
        params: normalizeRequestPath(wildcard ?? ''),
        authToken: getAuthTokenFromRequest(req),
      });
    };
  }

  app.get('/tree', withHandlerOptions(treeHandler));
  app.get('/tree/*', withHandlerOptions(treeHandler));
  app.get('/blob/*', withHandlerOptions(blobHandler));
  app.get('/share/*', withHandlerOptions(shareHandler));
  app.get('/raw/*', withHandlerOptions(rawHandler));
  app.get('/track/*', withHandlerOptions(trackHandler));
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
    id: pathParts[0].length > 0 ? pathParts[0] : null,
    path,
  };
}
