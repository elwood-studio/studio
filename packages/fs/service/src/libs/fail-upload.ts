import type { Client } from '@/types.ts';
import { authExecuteSql } from './auth-execute-sql.ts';

export type FailUploadOptions = {
  db: Client;
  authToken: string | undefined;
  object_id?: string | undefined | null;
  upload_id?: string | undefined | null;
};

export async function failUpload(options: FailUploadOptions) {
  const { db, authToken, object_id, upload_id } = options;

  try {
    if (object_id) {
      await authExecuteSql({
        client: db,
        token: authToken,
        params: [object_id],
        sql: `UPDATE elwood.object SET state = 'FAILED' WHERE id = $1`,
      });
    }

    if (upload_id) {
      await authExecuteSql({
        client: db,
        token: authToken,
        params: [upload_id],
        sql: `UPDATE elwood.object SET state = 'FAILED' WHERE metadata->>'upload_id' = $1`,
      });
    }
  } catch (_) {
    console.log('failed updating object state');
  }
}
