import fp from 'fastify-plugin';
import * as uuid from 'uuid';

import { getAuthTokenFromRequest } from '@/libs/get-auth-token.ts';
import type {
  Client,
  ObjectRequestPath,
  ObjectHandlerOptions,
  FastifyRequest,
  FastifyReply,
  PgBoss,
} from '@/types.ts';
import * as schemas from '@/schemas/index.ts';

import { tree } from './tree.ts';
import { raw } from './raw.ts';
import { blob } from './blob.ts';
import { share } from './share.ts';
import { track } from './track.ts';
import { RouteOptions } from 'fastify';

type Handler = (options: ObjectHandlerOptions) => Promise<void>;

export type ObjectOptions = {
  db: Client;
  boss: PgBoss;
};

export default fp<ObjectOptions>(async (app, opts) => {
  const _treeHandler = withHandlerOptions(tree, opts);
  const _shareHandler = withHandlerOptions(share, opts);
  const _blobHandler = withHandlerOptions(blob, opts);
  const _rawHandler = withHandlerOptions(raw, opts);
  const _trackHandler = withHandlerOptions(track, opts);

  const routes: RouteOptions[] = [
    // tree
    {
      method: 'GET',
      url: '/tree',
      handler: _treeHandler,
    },
    {
      method: 'GET',
      url: '/tree/*',
      handler: _treeHandler,
    },
    {
      method: 'POST',
      url: '/tree/*',
      handler: _treeHandler,
    },
    {
      method: 'DELETE',
      url: '/tree/*',
      handler: _treeHandler,
    },

    // share
    {
      method: 'GET',
      url: '/share/*',
      handler: _shareHandler,
    },
    {
      method: 'POST',
      url: '/share/*',
      handler: _shareHandler,
    },
    {
      method: 'DELETE',
      url: '/share/*',
      handler: _shareHandler,
    },

    // blob
    {
      method: 'GET',
      url: '/blob/*',
      handler: _blobHandler,
    },
    {
      method: 'POST',
      url: '/blob/*',
      handler: _blobHandler,
      schema: schemas.blob.post,
    },
    {
      method: 'DELETE',
      url: '/blob/*',
      handler: _blobHandler,
    },

    // raw
    {
      method: 'GET',
      url: '/raw/*',
      handler: _rawHandler,
    },

    // track
    {
      method: 'GET',
      url: '/track/*',
      handler: _trackHandler,
    },
  ];

  routes.forEach((opts: RouteOptions) => {
    app.route(opts);
  });
});

function withHandlerOptions(callback: Handler, options: ObjectOptions) {
  const { db, boss } = options;

  return async (req: FastifyRequest, res: FastifyReply) => {
    const { '*': wildcard } = req.params as { '*'?: string };

    return await callback({
      db,
      boss,
      req,
      res,
      params: normalizeRequestPath(wildcard ?? ''),
      authToken: getAuthTokenFromRequest(req),
    });
  };
}

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
