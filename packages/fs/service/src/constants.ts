import type { ObjectModel } from '@elwood/types';

export const ROOT_OBJECT_ID = '<root>';

export const ROOT_OBJECT: ObjectModel = {
  id: ROOT_OBJECT_ID,
  name: '@root',
  display_name: 'ROOT',
  type: 'TREE',
  parent_id: null,
  mime_type: 'inode/directory',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  content_hash: '',
  state: 'READY',
  size: 0,
  created_by_user_id: '',
  current_version: 0,
  data: {},
  last_accessed_at: new Date().toISOString(),
  metadata: null,
  remote_urn: null,
  root_user_id: null,
  sidecar_type: null,
};

export function isRootObject(obj: ObjectModel): boolean {
  return obj.id === ROOT_OBJECT_ID;
}

export function getParentId(obj: ObjectModel): string | null {
  return isRootObject(obj) ? null : obj.parent_id;
}
