import fp from 'fastify-plugin';
import { Client } from 'pg';
import * as uuid from 'uuid';

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
  app.route({
    method: ['GET', 'POST', 'DELETE'],
    url: '/tree/*',
    handler: withHandlerOptions(treeHandler),
  });

  app.route({
    method: ['GET', 'POST', 'DELETE'],
    url: '/share/*',
    handler: withHandlerOptions(shareHandler),
  });

  app.get('/blob/*', withHandlerOptions(blobHandler));
  app.get('/raw/*', withHandlerOptions(rawHandler));
  app.get('/track/*', withHandlerOptions(trackHandler));
});

function normalizeRequestPath(raw: string): ObjectRequestPath {
  const pathParts = raw.split('/');
  const path = pathParts.slice(1).join('/');

  if (pathParts[0].startsWith(':')) {
    return {
      type: 'remote',
      id: pathParts[0].substring(1),
      path: path.length === 0 ? '/' : path,
    };
  }

  if (uuid.validate(pathParts[0])) {
    return {
      type: 'oid',
      id: pathParts[0].length > 0 ? pathParts[0] : null,
      path,
    };
  }

  return {
    type: 'name',
    id: null,
    path: pathParts.join('/'),
  };
}
