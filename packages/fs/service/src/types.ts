import type { Pool, QueryResult, QueryResultRow } from 'pg';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { JsonObject, Json } from '@elwood/types';
import type PgBoss from 'pg-boss';

declare module 'fastify' {
  interface FastifyInstance {
    db: Client;
    boss: PgBoss;
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
  boss: PgBoss;
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

export interface DatabaseOptions {
  application_name?: string;
  database?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  schema?: string;
  ssl?: Json;
  connectionString?: string;
  max?: number;
  db?: Client;
}

export interface Client {
  opened: boolean;
  pool: Pool;

  open(): Promise<void>;
  close(): Promise<void>;
  executeSql(text: string, values: Json[]): Promise<QueryResult<Json>>;
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: Json[],
  ): Promise<QueryResult<T>>;
}

export type { FastifyReply, FastifyRequest } from 'fastify';
export type { default as PgBoss } from 'pg-boss';
