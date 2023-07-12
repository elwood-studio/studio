import type { ObjectModel, FileSystem } from '@elwood/types';
import { invariant } from '@elwood/common';

import {
  authExecuteSql,
  AuthExecuteSqlAuthOptions,
} from './auth-execute-sql.ts';
import { pathToObjectId } from './path-to-object-id.ts';

interface GetObjectInputBase {
  authSqlOptions: AuthExecuteSqlAuthOptions;
}

interface GetObjectInputWithPath extends GetObjectInputBase {
  path: string;
  id?: never;
}

interface GetObjectInputWithId extends GetObjectInputBase {
  id: string;
  path?: never;
}

export type GetObjectInput = GetObjectInputWithPath | GetObjectInputWithId;

export async function getObject(input: GetObjectInput): Promise<ObjectModel> {
  const { path, id, authSqlOptions } = input;

  if (id) {
    const sth = await authExecuteSql<ObjectModel>({
      ...authSqlOptions,
      sql: `SELECT * FROM elwood.object WHERE id = $1`,
      params: [id],
    });

    invariant(sth.rowCount !== 0, `Object "${path}" does not exists`);

    return sth.rows[0];
  }

  invariant(path, 'Either path or id must be provided');

  const parts = path.split('/');
  const name = parts.pop();
  const dir = parts.join('/');

  const parent_id = await pathToObjectId({
    path: dir,
    authSqlOptions,
  });

  const sth = await authExecuteSql<ObjectModel>({
    ...authSqlOptions,
    sql: parent_id
      ? `SELECT * FROM elwood.object WHERE parent_id = $1 AND name = $2`
      : `SELECT * FROM elwood.object WHERE parent_id is null AND name = $1`,
    params: parent_id ? [parent_id, name] : [name],
  });

  invariant(sth.rowCount !== 0, `Object "${path}" does not exists`);

  return sth.rows[0];
}

export function mapObjectModelToNode(obj: ObjectModel): FileSystem.Node {
  return {
    id: obj.id,
    name: obj.name,
    display_name: obj.display_name,
    mime_type: obj.mime_type ?? 'object',
    size: obj.size ?? 0,
    type: obj.type as FileSystem.NodeType,
    is_remote: false,
    metadata: obj.metadata ?? {},
    state: obj.state as FileSystem.NodeState,
  };
}
