import type { ObjectModel, FileSystem } from '@elwood/types';
import { invariant } from '@elwood/common';

import type { ObjectHandlerOptions, AuthToken } from '@/types.ts';
import { authExecuteSql } from '@/libs/auth-execute-sql.ts';
import {
  fetchAndMapRcloneListToTree,
  fetchAndMapRcloneStatToNode,
} from '@/libs/fetch-rclone.ts';
import { getRemoteConfig } from '@/libs/rclone-remote.ts';
import { pathToObjectId } from '@/libs/path-to-object-id.ts';
import { createTreeFromPath } from '@/libs/create-tree.ts';

export async function tree(options: ObjectHandlerOptions): Promise<void> {
  switch (options.req.method) {
    case 'GET':
      return await list(options);
    case 'POST':
      return await create(options);
    default:
      throw new Error('Method Not Supported');
  }
}

export async function list(options: ObjectHandlerOptions): Promise<void> {
  const { res } = options;
  const { type, path } = options.params;
  const nodes: FileSystem.Node[] = [];
  let node: FileSystem.Node | undefined;

  res.header('Content-Type', 'application/json');

  switch (type) {
    case 'remote': {
      const [_node, _nodes] = await nodesFromRemote(options);
      node = _node;
      nodes.push(..._nodes);
      break;
    }

    case 'name': {
      const [_node, _nodes] = await treeForObjectId(
        options,
        await pathToObjectId(path, options.db, options.authToken),
      );

      node = _node;
      nodes.push(..._nodes);
      break;
    }

    case 'oid': {
      const [_node, _nodes] = await treeForObjectId(options, options.params.id);

      node = _node;
      nodes.push(..._nodes);
      break;
    }
  }

  const result: FileSystem.TreeResult = {
    node,
    children: nodes,
    breadcrumbs: [],
    access: {
      can_view_children: false,
      can_view_descendants: false,
      can_write_blob: false,
      can_write_tree: false,
      can_share: false,
      can_download: false,
      can_preview: false,
    },
  };

  res.send(result);
}

export async function nodesFromRemote(
  options: ObjectHandlerOptions,
): Promise<[FileSystem.Node, FileSystem.Node[]]> {
  invariant(options.params.id, 'remote is required');

  const path = options.params.path ?? '';
  const remoteStr = await getRemoteConfig(
    options.db,
    options.params.id,
    options.authToken as AuthToken,
  );
  const node = await fetchAndMapRcloneStatToNode(remoteStr, `/${path}`);

  invariant(node, 'remote not found');

  return [node, await fetchAndMapRcloneListToTree(remoteStr, `/${path}`)];
}

export function mapObjectToNode(item: ObjectModel): FileSystem.Node {
  return {
    id: item.id,
    name: item.name,
    display_name: item.display_name,
    type: item.type as FileSystem.NodeType,
    size: item.size ?? 0,
    mime_type: item.mime_type ?? 'application/octet-stream',
    is_remote: false,
    metadata: item.metadata,
  };
}

export async function treeForObjectId(
  options: ObjectHandlerOptions,
  id: string | null,
): Promise<[FileSystem.Node, FileSystem.Node[]]> {
  let node: FileSystem.Node | undefined = undefined;

  if (id) {
    const sth = await authExecuteSql<ObjectModel>({
      client: options.db,
      req: options.req,
      params: [id],
      sql: `SELECT * FROM elwood.object WHERE "id" = $1`,
    });

    invariant(sth.rows[0], 'Object not found');

    node = mapObjectToNode(sth.rows[0]);
  } else {
    node = {
      id: '<root>',
      name: '@',
      display_name: '@',
      type: 'TREE',
      size: 0,
      mime_type: 'inode/directory',
      is_remote: false,
      metadata: {},
    };
  }

  const childrenSth = await authExecuteSql<ObjectModel>({
    client: options.db,
    req: options.req,
    params: id ? [id] : [],
    sql: id
      ? `SELECT * FROM elwood.object WHERE "parent_id" = $1`
      : `SELECT * FROM elwood.object WHERE "parent_id" is null`,
  });

  return [node, (childrenSth.rows ?? []).map(mapObjectToNode)];
}

export async function create(options: ObjectHandlerOptions): Promise<void> {
  const { db, req, res } = options;
  const { type, path } = options.params;
  const { parents: createParents = false } = req.body as {
    parents?: boolean;
  };

  invariant(type === 'name', 'Only named paths are supported');

  const obj = await createTreeFromPath({
    path,
    createParents,
    authSqlOptions: {
      client: db,
      req,
    },
  });

  res.send({
    id: obj.id,
  });
}
