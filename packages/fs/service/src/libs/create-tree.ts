import * as uuid from 'uuid';
import type { ObjectModel } from '@elwood/types';
import { invariant } from '@elwood/common';

import { ROOT_OBJECT } from '@/constants.ts';
import {
  authExecuteSql,
  AuthExecuteSqlAuthOptions,
} from './auth-execute-sql.ts';

export type CreateTreeInput = {
  name: string;
  parent_id: string | null;
  authSqlOptions: AuthExecuteSqlAuthOptions;
};

export async function createTree(input: CreateTreeInput): Promise<ObjectModel> {
  const { name, parent_id, authSqlOptions } = input;

  const sth = await authExecuteSql<ObjectModel>({
    ...authSqlOptions,
    params: parent_id ? [name, parent_id] : [name],
    sql: parent_id
      ? `INSERT INTO elwood.object ("name", "display_name", "type", "parent_id", "mime_type") VALUES ($1, $1, 'TREE'::elwood.object_type, $2, 'inode/directory') ON CONFLICT("name","parent_id") DO UPDATE set name = $1 RETURNING "id"`
      : `INSERT INTO elwood.object ("name", "display_name", "type", "parent_id", "mime_type") VALUES ($1, $1, 'TREE'::elwood.object_type, NULL, 'inode/directory') ON CONFLICT("name","parent_id") DO UPDATE set name = $1  RETURNING "id"`,
  });

  return sth.rows[0] as ObjectModel;
}

export type CreateTreeFromPathInput = {
  path: string;
  createParents?: boolean;
  authSqlOptions: AuthExecuteSqlAuthOptions;
};

export async function createTreeFromPath(
  input: CreateTreeFromPathInput,
): Promise<ObjectModel> {
  const { path, createParents, authSqlOptions } = input;

  // break apart the path
  const parts = path
    .trim()
    .replace(/^\//, '')
    .split('/')
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return ROOT_OBJECT;
  }

  const last = parts.pop() ?? '';
  const acc: string[] = [];
  let parent_id: string | null = null;

  for (const part of parts) {
    acc.push(part);

    const col = uuid.validate(part) ? 'id' : 'name';
    const currentSth = await authExecuteSql<ObjectModel>({
      ...authSqlOptions,
      params: parent_id === null ? [part] : [part, parent_id],
      sql:
        parent_id === null
          ? `SELECT * FROM elwood.object WHERE "${col}" = $1  AND "parent_id" is null`
          : `SELECT * FROM elwood.object WHERE "${col}" = $1 AND "parent_id" = $2`,
    });

    // if this folder already exists
    // we can skip to the next
    if (currentSth.rowCount !== 0) {
      const row = currentSth.rows[0] as ObjectModel;
      parent_id = row.id;
      continue;
    }

    invariant(
      createParents || parts.length === 1,
      `Folder "${part}" at path "${acc.join('/')}" does not exists`,
    );

    parent_id = (await createTree({ name: part, parent_id, authSqlOptions }))
      .id;
  }

  return await createTree({ name: last, parent_id, authSqlOptions });
}
