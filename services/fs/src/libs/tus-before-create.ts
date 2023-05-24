import { Client } from 'pg';
import { invariant } from 'ts-invariant';

import { authExecuteSql } from './auth-execute-sql';

export type TusBeforeCreateOptions = {
  db: Client;
  authToken: string;
  id: string;
  metadata: {
    name?: string;
    parent_id?: string;
    display_name?: string;
    size?: number;
    mime_type?: string;
    sidecar_type?: boolean;
    skip_workflows?: boolean;
  };
};

export async function tusBeforeCreate(options: TusBeforeCreateOptions) {
  const { db, id, authToken } = options;
  const {
    parent_id,
    name,
    display_name,
    size,
    mime_type,
    sidecar_type,
    skip_workflows,
  } = options.metadata;

  console.log('upload create');

  invariant(display_name, 'metadata.display_name is required');
  invariant(mime_type, 'metadata.mime_type is required');

  console.log('before sql');

  const checkResult = await authExecuteSql({
    client: db,
    token: authToken,
    sql: `SELECT elwood.can_create_object($1) as can_create_object`,
    params: [parent_id],
  });

  invariant(checkResult.rows[0].can_create_object, 'Can not create object');

  const sql = `
    INSERT INTO elwood.object (
      state,
      name,
      display_name,
      parent_id,
      metadata,
      mime_type,
      size,
      sidecar_type,
      skip_workflows,
      remote_urn
    )
    VALUES (
      'PENDING', $1, $2, $3, $4, $5, $6, $7, $8, $9
    );
  `;

  const result = await authExecuteSql({
    client: db,
    token: authToken,
    sql,
    params: [
      name ?? display_name,
      display_name,
      parent_id,
      mime_type,
      size,
      {
        upload_id: id,
      },
      sidecar_type,
      !!skip_workflows,
      ['ern', 'local', `uploads/${id}`],
    ],
  });

  console.log('after sql', result);

  invariant(result.rowCount === 1, 'failed to create object');
}
