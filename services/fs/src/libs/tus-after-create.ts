import { Client } from 'pg';
import { invariant } from 'ts-invariant';

import { authExecuteSql } from './auth-execute-sql';

export type TusBeforeCreateOptions = {
  db: Client;
  authToken: string;
  id: string;
};

export async function tusAfterCreate(options: TusBeforeCreateOptions) {
  const { db, id, authToken } = options;

  const sql = `
    UPDATE elwood.object 
    SET 
      "state" = 'READY'
    WHERE 
      metadata->>'upload_id' = $1
    `;

  const result = await authExecuteSql({
    client: db,
    token: authToken,
    sql,
    params: [id],
  });

  invariant(result.rowCount === 1, 'Expected exactly one row to be updated');
}
