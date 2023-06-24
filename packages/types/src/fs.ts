import { JsonObject } from './scalar';

export type NodeType = 'tree' | 'blob';

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
};

export type TreeResult = {
  node: Node;
  children: Node[];
  breadcrumbs: Breadcrumb[];
};

export type BlobResult = {
  node: Node;
  sidecarNodes: Node[];
  breadcrumbs: Breadcrumb[];
};
