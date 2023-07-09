import { invariant } from '@elwood/common';

import type { Client } from '@/types.ts';
import { authExecuteSql } from './auth-execute-sql.ts';
import { pathToObjectId } from './path-to-object-id.ts';
import { ParentFolderDoesNotExist } from './errors.ts';

export type TusBeforeCreateOptions = {
  db: Client;
  authToken: string | undefined;
  id: string;
  metadata: {
    object_id?: string;
    name?: string;
    parent_id?: string;
    parent?: string;
    display_name?: string;
    size?: number;
    mime_type?: string;
    sidecar_type?: boolean;
  };
};

export async function tusBeforeCreate(options: TusBeforeCreateOptions) {
  const { db, id, authToken } = options;
  const {
    object_id,
    parent,
    parent_id,
    name,
    display_name,
    size,
    mime_type,
    sidecar_type,
  } = options.metadata;

  // if there's already an object
  // we should make sure we can access it
  // then update with the upload id
  if (object_id) {
    const checkResult = await authExecuteSql({
      client: db,
      token: authToken,
      sql: `SELECT has_access FROM elwood.get_object_access($1)`,
      params: [object_id ?? null],
    });

    invariant(checkResult.rows[0].has_access === true, 'Can not access object');

    const result = await authExecuteSql({
      client: db,
      token: authToken,
      sql: `
        UPDATE 
          elwood.object
        SET 
          state = 'PENDING',
          metadata = $1
        WHERE 
          id = $2
      `,
      params: [
        {
          upload_id: id,
        },
        object_id,
      ],
    });

    invariant(result.rowCount === 1, 'failed to create object');

    return;
  }

  invariant(display_name, 'metadata.display_name is required');
  invariant(mime_type, 'metadata.mime_type is required');

  const checkResult = await authExecuteSql({
    client: db,
    token: authToken,
    sql: `SELECT elwood.can_create_object($1) as can_create_object`,
    params: [parent_id ?? null],
  });

  invariant(
    checkResult.rows[0].can_create_object === true,
    'Can not create object',
  );

  invariant(
    parent || parent_id,
    'parent or parent_id is required',
    ParentFolderDoesNotExist,
  );

  const _parent_id =
    parent_id ??
    (await pathToObjectId({
      path: String(parent),
      authSqlOptions: { client: db, token: authToken },
    }));

  const sql = `
    INSERT INTO elwood.object (
      state,
      name,
      display_name,
      parent_id,
      metadata,
      mime_type,
      size,
      sidecar_type
    )
    VALUES (
      'PENDING', $1, $2, $3, $4, $5, $6, $7
    );
  `;

  const result = await authExecuteSql({
    client: db,
    token: authToken,
    sql,
    params: [
      name ?? display_name,
      display_name,
      _parent_id,
      {
        upload_id: id,
      },
      mime_type,
      size,
      sidecar_type,
    ],
  });

  invariant(result.rowCount === 1, 'failed to create object');
}
