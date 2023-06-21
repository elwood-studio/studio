import type {
  ObjectModel,
  FileSystemTreeNode,
  FileSystemTreeResult,
} from '@elwood-studio/types';

import type { ObjectHandlerOptions } from '@/types.ts';
import { authExecuteSql } from '@/libs/auth-execute-sql.ts';
import {
  fetchAndMapRcloneResultToTree,
  mapObjectDataToRclonePath,
  mapObjectDataToRcloneRemote,
} from '@/libs/fetch-rclone.ts';
import { invariant } from '@/libs/invariant.ts';

export default async function tree(
  options: ObjectHandlerOptions,
): Promise<void> {
  const { db, req, res } = options;
  const { type, id, path } = options.params;
  const nodes: FileSystemTreeNode[] = [];

  res.header('Content-Type', 'application/json');

  if (type === 'remote') {
    invariant(id, 'remote is required');

    nodes.push(...(await fetchAndMapRcloneResultToTree(id, path)));
  } else {
    let rows: ObjectModel[] = [];

    if (id) {
      const object = await authExecuteSql<ObjectModel>({
        client: db,
        req,
        params: [id],
        sql: `SELECT * FROM elwood.object WHERE "id" = $1`,
      });

      invariant(object.rows.length === 1, 'Object not found');

      if (object.rows[0].type === 'LINK') {
        nodes.push(
          ...(await fetchAndMapRcloneResultToTree(
            mapObjectDataToRcloneRemote(object.rows[0]),
            mapObjectDataToRclonePath(object.rows[0], path),
          )),
        );
      } else {
        const sth = await authExecuteSql<ObjectModel>({
          client: db,
          req,
          params: [id],
          sql: `SELECT * FROM elwood.object WHERE "parent_id" = $1`,
        });

        rows = sth.rows;
      }
    } else {
      const sth = await authExecuteSql<ObjectModel>({
        client: db,
        req,
        params: [],
        sql: `SELECT * FROM elwood.object WHERE "parent_id" is null`,
      });

      rows = sth.rows;
    }

    nodes.push(
      ...rows.map((item) => {
        return {
          id: item.id,
          name: item.name,
          display_name: item.display_name,
          type: item.type as FileSystemTreeNode['type'],
          size: item.size ?? 0,
          mime_type: item.mime_type ?? 'application/octet-stream',
          is_remote: false,
          metadata: item.metadata,
        };
      }),
    );
  }

  const result: FileSystemTreeResult = {
    nodes,
    breadcrumbs: [],
  };

  res.send(result);
}
