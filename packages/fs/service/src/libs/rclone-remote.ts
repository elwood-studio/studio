import { invariant } from '@elwood/common';
import type { JsonObject } from '@elwood/types';

import type { AuthToken, Client } from '@/types.ts';
import { authExecuteSql } from './auth-execute-sql.ts';
import { getS3Env, getEnv } from './get-env.ts';

const { storageProvider } = getEnv();

export async function getRemoteConfig(
  db: Client,
  idOrName: string,
  token: string | AuthToken,
): Promise<string> {
  // local is always local
  if (idOrName === 'local') {
    return '';
  }

  // storage points to the storage system setting
  if (idOrName === 'storage') {
    return createStorageRemoteConfig();
  }

  // otherwise look in the database
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

export function createStorageRemoteConfig(): string {
  switch (storageProvider) {
    case 's3': {
      const s3 = getS3Env();
      return createRemoteConfigString('s3', {
        access_key_id: s3.key,
        secret_access_key: s3.secret,
        region: s3.region,
      });
    }
    default: {
      return createRemoteConfigString('local');
    }
  }
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
