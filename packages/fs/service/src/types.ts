import type { Client } from 'pg';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { JsonObject } from '@elwood/types';

declare module 'fastify' {
  interface FastifyInstance {
    db: Client;
  }
}

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
  id: string | null;
  path: string;
};

export type AuthToken<T extends JsonObject = JsonObject> = T & {
  type?: string;
  sub?: string;
  role?: string;
};

export type PossibleAuthToken<T extends JsonObject = JsonObject> =
  | AuthToken<T>
  | string
  | undefined;

export type ObjectHandlerOptions = {
  db: Client;
  req: FastifyRequest;
  res: FastifyReply;
  params: ObjectRequestPath;
  authToken: AuthToken | undefined;
};

export type RcloneListItem = {
  Path: string;
  Name: string;
  Size: number;
  MimeType: string;
  ModTime: string;
  IsDir: boolean;
  Hashes: {
    md5: string;
    sha1: string;
    sha256: string;
  };
};

export type { Client } from 'pg';
export type { FastifyReply, FastifyRequest } from 'fastify';
