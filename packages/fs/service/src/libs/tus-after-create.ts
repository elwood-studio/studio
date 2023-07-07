import { invariant } from '@elwood/common';

import type { Client } from '@/types.ts';
import { authExecuteSql } from './auth-execute-sql.ts';

export type TusAfterCreateOptions = {
  db: Client;
  authToken: string | undefined;
  id: string;
};

export async function tusAfterCreate(options: TusAfterCreateOptions) {
  const { db, id: uploadId, authToken } = options;

  const { rows } = await authExecuteSql({
    client: db,
    token: authToken,
    params: [uploadId],
    sql: `SELECT id FROM elwood.object WHERE metadata->>'upload_id' = $1`,
  });

  const id = rows[0]?.id;

  invariant(id, 'Expected to find an object with the given upload_id');

  const sql = `
    UPDATE elwood.object 
    SET 
      "state" = $3,
      "content_hash" = $2,
      "remote_urn" = $4
    WHERE 
      "id" = $1
    `;

  const result = await authExecuteSql({
    client: db,
    token: authToken,
    sql,
    params: [id, '', 'READY', ['storage', uploadId]],
  });

  invariant(result.rowCount === 1, 'Expected exactly one row to be updated');
}
