import { JsonObject } from './scalar';

export type FileSystemNodeType = 'tree' | 'blob';

export type FileSystemBreadcrumb = {
  id: string;
  name: string;
  display_name: string;
  parent_id: string;
  depth_from_parent: number;
};

export type FileSystemTreeNode = {
  id: string;
  name: string;
  display_name: string;
  type: FileSystemNodeType;
  size: number;
  mime_type: string;
  is_remote: boolean;
  metadata: JsonObject;
};

export type FileSystemTreeResult = {
  nodes: FileSystemTreeNode[];
  breadcrumbs: FileSystemBreadcrumb[];
};

export type FileSystemBlobResult = {
  node: FileSystemTreeNode;
  breadcrumbs: FileSystemBreadcrumb[];
};
