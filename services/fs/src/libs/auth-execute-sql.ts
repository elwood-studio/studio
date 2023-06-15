import invariant from 'ts-invariant';
import { type FastifyRequest } from 'fastify';
import { type Client, QueryResult } from 'pg';

import type { Json } from '@elwood-studio/types';

import { getAuthToken, getAuthTokenFromRequest } from './get-auth-token';

interface AuthExecuteSqlOptionsBase {
  client: Client;
  sql: string;
  params: Json[];
}
interface AuthExecuteSqlOptionsWithToken extends AuthExecuteSqlOptionsBase {
  token: string;
  req?: never;
}
interface AuthExecuteSqlOptionsWithRequest extends AuthExecuteSqlOptionsBase {
  req: FastifyRequest;
  token?: never;
}

export type AuthExecuteSqlOptions =
  | AuthExecuteSqlOptionsWithToken
  | AuthExecuteSqlOptionsWithRequest;

export async function authExecuteSql(
  options: AuthExecuteSqlOptions,
): Promise<QueryResult> {
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
