import { JsonObject } from './scalar';

export type NodeType = 'TREE' | 'BLOB' | 'LINK';

export type Breadcrumb = {
  id: string;
  name: string;
  display_name: string;
  parent_id: string;
  depth_from_parent: number;
};

export type Node = {
  id: string;
  name: string;
  display_name: string;
  type: NodeType;
  size: number;
  mime_type: string;
  is_remote: boolean;
  metadata: JsonObject;
  state: string;
};

export type TreeResult = {
  node: Node;
  children: Node[];
  breadcrumbs: Breadcrumb[];
  access: NodeAccess;
};

export type BlobResult = {
  node: Node;
  sidecarNodes: Node[];
  breadcrumbs: Breadcrumb[];
};

export type NodeAccess = {
  can_view_children: boolean;
  can_view_descendants: boolean;
  can_write_blob: boolean;
  can_write_tree: boolean;
  can_share: boolean;
  can_download: boolean;
  can_preview: boolean;
};

export type ShareInput = {
  can_view_children?: boolean;
  can_view_descendants?: boolean;
  can_write_blob?: boolean;
  can_write_tree?: boolean;
  can_share?: boolean;
  can_download?: boolean;
  can_preview?: boolean;
  is_public?: boolean;
  password?: string;
  description?: string;
};

export type ShareResult = {
  id: string;
  url: string;
  token: string;
};

export type CopyResult = {
  id: string;
};
