import type { FileSystem } from '@elwood/types';

export const FileSystemNodeState: Record<
  'Creating' | 'Pending' | 'Uploaded' | 'Processing' | 'Failed' | 'Ready',
  FileSystem.NodeState
> = {
  Creating: 'CREATING',
  Pending: 'PENDING',
  Uploaded: 'UPLOADED',
  Processing: 'PROCESSING',
  Failed: 'FAILED',
  Ready: 'READY',
};
