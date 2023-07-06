import { invariant } from '@elwood/common';

import type { AuthToken, Client } from '@/types.ts';
import { authExecuteSql } from './auth-execute-sql.ts';
import { JsonObject } from '@elwood/types';

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

  return createRemoteConfigString(type, parameters);
}

export function createRemoteConfigString(
  type: string,
  parameters: JsonObject = {},
): string {
  const params = Object.entries(parameters).reduce((acc, [key, value]) => {
    return [...acc, `${key}=${value}`];
  }, [] as string[]);
  const str = [type, ...params].join('');

  return [':', str, ':'].join('');
}
