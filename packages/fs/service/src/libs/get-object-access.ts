import type { ObjectAccess } from '@elwood/types';
import { invariant } from '@elwood/common';

import type { Client, PossibleAuthToken } from '@/types.ts';
import { authExecuteSql } from './auth-execute-sql.ts';

export async function getObjectAccess(
  db: Client,
  authToken: PossibleAuthToken,
  object_id: string,
): Promise<ObjectAccess> {
  console.log('getObjectAccess', authToken);

  const checkResult = await authExecuteSql<ObjectAccess>({
    client: db,
    token: authToken,
    sql: `SELECT * FROM elwood.get_object_access($1)`,
    params: [object_id ?? null],
  });

  invariant(checkResult.rowCount > 0, 'Can not access object');
  invariant(checkResult.rows[0].has_access, 'Can not access object');

  return checkResult.rows[0];
}
