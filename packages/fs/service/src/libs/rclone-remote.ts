import { invariant } from './invariant.ts';
import type { AuthToken, Client } from '../types.ts';
import { authExecuteSql } from './auth-execute-sql.ts';

export async function getRemoteConfig(
  db: Client,
  idOrName: string,
  token: string | AuthToken,
): Promise<string> {
  if (idOrName === 'local') {
    return '';
  }

  const remote = await authExecuteSql<{
    type: string;
    parameters: Record<string, unknown>;
  }>({
    client: db,
    token,
    sql: `SELECT * FROM elwood.remote WHERE "name" = $1`,
    params: [idOrName],
  });

  invariant(remote.rowCount === 1, 'Remote not found');
  const { type, parameters } = remote.rows[0];

  const params = Object.entries(parameters).reduce((acc, [key, value]) => {
    return [...acc, `${key}=${value}`];
  }, [] as string[]);
  const str = [type, ...params].join('');

  return [':', str, ':'].join('');
}
