import { rename, mkdir } from 'fs/promises';
import { Client } from 'pg';
import { sync as md5 } from 'md5-file';

import { invariant } from './invariant.ts';
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

  const content_hash = md5(`/data/uploads/${uploadId}`);
  const sql = `
    UPDATE elwood.object 
    SET 
      "state" = $3,
      "content_hash" = $2
    WHERE 
      "id" = $1
    `;

  const result = await authExecuteSql({
    client: db,
    token: authToken,
    sql,
    params: [id, content_hash, 'READY'],
  });

  invariant(result.rowCount === 1, 'Expected exactly one row to be updated');

  await mkdir(`/data/cache`, { recursive: true });
  await rename(`/data/uploads/${uploadId}`, `/data/cache/${id}`);
}
