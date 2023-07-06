import { sign } from 'jsonwebtoken';

import { invariant } from '@elwood/common';
import type { AccessModel, FileSystem } from '@elwood/types';
import type { ObjectHandlerOptions } from '@/types.ts';
import { pathToObjectId } from '@/libs/path-to-object-id.ts';
import { getObjectAccess } from '@/libs/get-object-access.ts';
import { authExecuteSql } from '@/libs/auth-execute-sql.ts';
import { getEnv } from '@/libs/get-env.ts';

const { shareUrlTpl, shareJwtSecret } = getEnv();

export default async function share(options: ObjectHandlerOptions) {
  const { req, res } = options;

  switch (req.method) {
    case 'POST':
      return await create(options);
    default:
      res.status(405).send({ error: 'Method not allowed' });
  }
}

async function create(options: ObjectHandlerOptions): Promise<void> {
  invariant(options.req.body, 'Missing body');

  const object_id = await pathToObjectId(
    options.params.path,
    options.db,
    options.authToken,
  );

  invariant(object_id, 'Object not found');

  const access = await getObjectAccess(
    options.db,
    options.authToken,
    object_id,
  );

  console.log(access);

  invariant(access.can_share, 'Can not share object');

  const body = options.req.body as FileSystem.ShareInput;

  const sql = `
    INSERT INTO elwood.access
      (
        "type",    
        "state",
        "user_id", -- 1
        "object_id",        
        "can_view_children",
        "can_view_descendants",
        "can_write_blob",
        "can_write_tree",
        "can_share",
        "can_download",
        "can_preview",
        "block_pattern",
        "allow_pattern",
        "added_by_user_id",
        "description",
        "is_public",
        "share_password_secret_id" -- 15
      ) VALUES
      (
        'LINK'::elwood.access_type,
        'ACTIVE'::elwood.access_state,
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
    RETURNING "id"
  `;

  let password_secret_id: string | null = null;

  if (body.password) {
    const secretResult = await options.db.query(
      `INSERT INTO vault.secrets ("secret") VALUES ($1) RETURNING "id"`,
      [body.password],
    );
    invariant(secretResult.rowCount > 0, 'Failed to create secret');
    password_secret_id = secretResult.rows[0].id;
  }

  const result = await authExecuteSql<AccessModel>({
    client: options.db,
    token: options.authToken,
    params: [
      // user_id
      null,
      // object_id
      object_id,
      // can_view_children
      body.can_view_children ?? false,
      // can_view_descendants
      body.can_view_descendants ?? false,
      // can_write_blob
      body.can_write_blob ?? false,
      // can_write_tree
      body.can_write_tree ?? false,
      // can_share
      body.can_share ?? false,
      // can_download
      body.can_download ?? false,
      // can_preview
      body.can_preview ?? false,
      // block_pattern
      null,
      // allow_pattern
      null,
      // added_by_user_id
      null,
      // description
      body.description ?? null,
      // is_public
      body.is_public ?? false,
      // share_password_secret_id -- 15
      password_secret_id,
    ],
    sql,
  });

  invariant(result.rowCount > 0, 'Failed to create access');

  const id = result.rows[0].id;
  const token = sign(
    {
      id,
      pw: password_secret_id !== null,
    },
    shareJwtSecret,
  );
  const url = shareUrlTpl.replace('{token}', token);

  options.res.header('Location', url);
  options.res.status(201).send({
    id,
    token,
    url,
  } as FileSystem.ShareResult);
}
