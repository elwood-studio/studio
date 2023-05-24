import { type Client, QueryResult } from 'pg';
import { decode, verify } from 'jsonwebtoken';

import { getConfig } from './get-config';

const { jwtSecret } = getConfig();

export type AuthExecuteSqlOptions = {
  client: Client;
  token: string;
  sql: string;
  params: any[];
};

export async function authExecuteSql(
  options: AuthExecuteSqlOptions,
): Promise<QueryResult> {
  const { client, sql, params, token } = options;

  console.log('authExecuteSql');

  const jwt = verify(token.replace('Bearer ', ''), jwtSecret);

  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('request.jwt', $1, true)`, [
      {
        jwt,
      },
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
