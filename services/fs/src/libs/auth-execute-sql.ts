import { type Client, QueryResult } from 'pg';

import type { Json } from '@elwood-studio/types';

import { getAuthToken } from './get-auth-token';

export type AuthExecuteSqlOptions = {
  client: Client;
  token: string;
  sql: string;
  params: Json[];
};

export async function authExecuteSql(
  options: AuthExecuteSqlOptions,
): Promise<QueryResult> {
  const { client, sql, params, token } = options;

  console.log('authExecuteSql');

  const jwt = getAuthToken(token);

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
