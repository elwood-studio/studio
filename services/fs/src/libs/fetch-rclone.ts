import type { ObjectModel, FileSystemTreeNode } from '@elwood-studio/types';

import { getEnv } from './get-env';

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

export function mapObjectDataToRcloneRemote(object: ObjectModel): string {
  return '';
}

export function mapObjectDataToRclonePath(
  object: ObjectModel,
  path: string,
): string {
  return '';
}

export async function fetchAndMapRcloneResultToTree(
  remote: string,
  fs: string,
): Promise<FileSystemTreeNode[]> {
  await fetchRclone('/operations/list', {
    body: JSON.stringify({
      remote,
      fs,
    }),
  });

  return [];
}
