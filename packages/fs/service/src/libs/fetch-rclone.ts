import type { ObjectModel, FileSystem } from '@elwood/types';

import type { RcloneListItem } from '@/types.ts';
import { getEnv } from './get-env.ts';
import { basename, dirname } from 'node:path';

const { rcloneHost } = getEnv();

export async function fetchRclone(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const response = await fetch(`http://${rcloneHost}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  return response;
}

export function mapObjectDataToRcloneRemote(_object: ObjectModel): string {
  return '';
}

export function mapObjectDataToRclonePath(
  _object: ObjectModel,
  _path: string,
): string {
  return '';
}

export function mapRcloneListItemToNode(item: RcloneListItem): FileSystem.Node {
  return {
    id: item.Hashes?.sha256 ?? item.Hashes?.md5,
    name: item.Name,
    display_name: item.Name,
    type: item.IsDir ? 'TREE' : 'BLOB',
    size: item.Size ?? 0,
    mime_type: item.MimeType,
    is_remote: true,
    metadata: {},
    state: 'READY',
  };
}

export async function fetchAndMapRcloneListToTree(
  remote: string,
  fs: string,
  filesOnly = false,
): Promise<FileSystem.Node[]> {
  const response = await fetchRclone('/operations/list', {
    body: JSON.stringify({
      remote,
      fs,
      opt: {
        showHash: true,
        filesOnly,
      },
    }),
  });

  const result = await response.json();
  const list = (result?.list ?? []) as RcloneListItem[];

  return list.map(mapRcloneListItemToNode);
}

export async function fetchAndMapRcloneStatToNode(
  remote: string,
  fs: string,
): Promise<FileSystem.Node | undefined> {
  const list = await fetchAndMapRcloneListToTree(remote, dirname(fs), false);

  return list.find((item) => basename(item.name) === basename(fs));
}
