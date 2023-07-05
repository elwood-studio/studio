import type { ObjectModel, FileSystem } from '@elwood/types';
import * as uuid from 'uuid';

import type { ObjectHandlerOptions, AuthToken } from '@/types.ts';
import { authExecuteSql } from '@/libs/auth-execute-sql.ts';
import {
  fetchAndMapRcloneListToTree,
  fetchAndMapRcloneStatToNode,
} from '@/libs/fetch-rclone.ts';
import { invariant } from '@/libs/invariant.ts';
import { getRemoteConfig } from '@/libs/rclone-remote.ts';

export default async function tree(
  options: ObjectHandlerOptions,
): Promise<void> {
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
        await pathToParentId(options, path),
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

function mapObjectToNode(item: ObjectModel): FileSystem.Node {
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
      mime_type: 'application/octet-stream',
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

  // break apart the path
  const parts = path
    .trim()
    .replace(/^\//, '')
    .split('/')
    .filter((part) => part.length > 0);

  invariant(parts.length > 0, 'Path must be at least one part');

  const last = parts.pop() ?? '';
  const acc: string[] = [];
  let parent_id: string | null = null;

  for (const part of parts) {
    acc.push(part);

    const col = uuid.validate(part) ? 'id' : 'name';
    const currentSth = await authExecuteSql<ObjectModel>({
      client: db,
      req,
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

    parent_id = (await createTree(options, part, parent_id)).id;
  }

  const obj = await createTree(options, last, parent_id);

  res.send({
    id: obj.id,
  });
}

async function createTree(
  options: ObjectHandlerOptions,
  name: string,
  parent_id: string | null,
): Promise<ObjectModel> {
  const sth = await authExecuteSql<ObjectModel>({
    client: options.db,
    req: options.req,
    params: parent_id ? [name, parent_id] : [name],
    sql: parent_id
      ? `INSERT INTO elwood.object ("name", "display_name", "type", "parent_id") VALUES ($1, $1, 'TREE'::elwood.object_type, $2) ON CONFLICT("name","parent_id") DO UPDATE set name = $1 RETURNING "id"`
      : `INSERT INTO elwood.object ("name", "display_name", "type", "parent_id") VALUES ($1, $1, 'TREE'::elwood.object_type, NULL) ON CONFLICT("name","parent_id") DO UPDATE set name = $1  RETURNING "id"`,
  });

  return sth.rows[0] as ObjectModel;
}

export async function pathToParentId(
  options: ObjectHandlerOptions,
  path: string,
): Promise<string | null> {
  const { db, req } = options;

  // break apart the path
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
      client: db,
      req,
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
