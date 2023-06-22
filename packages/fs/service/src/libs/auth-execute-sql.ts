import { type FastifyRequest } from 'fastify';
import { type Client, QueryResult, QueryResultRow } from 'pg';

import type { Json } from '@elwood/types';

import { invariant } from './invariant.ts';
import { getAuthToken, getAuthTokenFromRequest } from './get-auth-token.ts';

interface AuthExecuteSqlOptionsBase {
  client: Client;
  sql: string;
  params: Json[];
}
interface AuthExecuteSqlOptionsWithToken extends AuthExecuteSqlOptionsBase {
  token: string | undefined;
  req?: never;
}
interface AuthExecuteSqlOptionsWithRequest extends AuthExecuteSqlOptionsBase {
  req: FastifyRequest;
  token?: never;
}

export type AuthExecuteSqlOptions =
  | AuthExecuteSqlOptionsWithToken
  | AuthExecuteSqlOptionsWithRequest;

export async function authExecuteSql<T extends QueryResultRow = Json>(
  options: AuthExecuteSqlOptions,
): Promise<QueryResult<T>> {
  const { client, sql, params, req, token } = options;
  const jwt = req ? getAuthTokenFromRequest(req) : getAuthToken(token);

  invariant(jwt, 'jwt is required');

  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
      jwt,
    ]);

    const result = await client.query(sql, params);

    await client.query(`SELECT set_config('request.jwt', NULL, true)`, []);
    await client.query('COMMIT');

    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}
