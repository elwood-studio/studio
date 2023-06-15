import type { Client } from 'pg';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { JsonObject } from '@elwood-studio/types';

export type Config = {
  remotes?: Record<
    string,
    {
      type: string;
      params: JsonObject;
    }
  >;
};

export type ObjectRequestPath = {
  type: 'oid' | 'name' | 'remote';
  id: string;
  path: string;
};

export type AuthToken = {
  sub?: string;
  role?: string;
};

export type ObjectHandlerOptions = {
  db: Client;
  req: FastifyRequest;
  res: FastifyReply;
  params: ObjectRequestPath;
  authToken: AuthToken;
};

export type { Client } from 'pg';
export type { FastifyReply, FastifyRequest } from 'fastify';
