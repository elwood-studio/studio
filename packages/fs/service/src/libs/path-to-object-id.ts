import * as uuid from 'uuid';
import type { ObjectModel } from '@elwood/types';
import { invariant } from '@elwood/common';

import {
  authExecuteSql,
  AuthExecuteSqlAuthOptions,
} from '@/libs/auth-execute-sql.ts';

export type PathToObjectIdInput = {
  path: string;
  authSqlOptions: AuthExecuteSqlAuthOptions;
};

export async function pathToObjectId(
  input: PathToObjectIdInput,
): Promise<string | null> {
  const { path, authSqlOptions } = input;

  const parts = path
    .trim()
    .replace(/^\//, '')
    .split('/')
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return null;
  }

  let parent_id: string | null = null;

  for (const part of parts) {
    const col = uuid.validate(part) ? 'id' : 'name';
    const currentSth = await authExecuteSql<ObjectModel>({
      ...authSqlOptions,
      params: parent_id === null ? [part] : [part, parent_id],
      sql:
        parent_id === null
          ? `SELECT * FROM elwood.object WHERE "${col}" = $1  AND "parent_id" is null`
          : `SELECT * FROM elwood.object WHERE "${col}" = $1 AND "parent_id" = $2`,
    });

    invariant(currentSth.rowCount !== 0, `Folder "${part}" does not exists`);

    const row = currentSth.rows[0] as ObjectModel;
    parent_id = row.id;
  }

  return parent_id;
}
