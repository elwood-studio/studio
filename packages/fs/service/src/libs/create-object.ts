import type { ObjectModel, JsonObject } from '@elwood/types';
import { invariant } from '@elwood/common';

import {
  authExecuteSql,
  type AuthExecuteSqlAuthOptions,
} from './auth-execute-sql.ts';
import { createTreeFromPath } from './create-tree.ts';
import { getParentId } from '@/constants.ts';

export type CreateObjectInput = {
  object: {
    parent_id?: string | null;
    path?: string;
    name?: string;
    display_name?: string;
    metadata?: JsonObject;
    mime_type?: string;
    size?: number;
    sidecar_type?: string;
    data?: JsonObject;
  };
  parents?: boolean;
  authSqlOptions: AuthExecuteSqlAuthOptions;
};

export async function createObject(
  input: CreateObjectInput,
): Promise<ObjectModel> {
  const { object, parents: createParents = false, authSqlOptions } = input;

  invariant(
    !(object.path && object.parent_id),
    'Can not provided both parent_id and path',
  );
  invariant(object.path || object.parent_id, 'parent or parent_id is required');

  let _parent_id = object.parent_id;
  let _name = object.name;

  if (object.path) {
    const parts = object.path.split('/');
    _name = parts.pop();
    const dir = parts.join('/');

    const tree = await createTreeFromPath({
      path: dir,
      createParents,
      authSqlOptions,
    });
    _parent_id = getParentId(tree);
  }

  const checkResult = await authExecuteSql({
    ...authSqlOptions,
    sql: `SELECT elwood.can_create_object($1) as can_create_object`,
    params: [_parent_id ?? null],
  });

  invariant(
    checkResult.rows[0].can_create_object === true,
    'Can not create object',
  );

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
      data
    )
    VALUES (
      'PENDING', $1, $2, $3, $4, $5, $6, $7, $8
    )
    RETURNING *
  `;

  const result = await authExecuteSql<ObjectModel>({
    ...authSqlOptions,
    sql,
    params: [
      _name ?? object.display_name,
      object.display_name ?? _name,
      _parent_id,
      object.metadata ?? {},
      object.mime_type,
      object.size,
      object.sidecar_type,
      object.data,
    ],
  });

  invariant(result.rowCount > 0, 'failed to create object');

  return result.rows[0];
}
