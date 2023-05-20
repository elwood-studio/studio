import { type FileSystemOperation } from './constants';

import type { UppyFile, FileRemoveReason, UploadResult } from '@uppy/core';

export namespace Upload {
  export type File = UppyFile;
  export type RemoveReason = FileRemoveReason;
  export type Result = UploadResult;
}

export type FileSystemListItem = {
  hashes: {
    [key: string]: string | undefined;
    'SHA-1'?: string;
    MD5?: string;
    dropboxHash?: string;
  } | null;
  id: string;
  origID: string;
  isBucket: boolean;
  isDir: boolean;
  mimeType: string;
  modTime: string;
  name: string;
  encrypted: string;
  encryptedPath: string;
  path: string;
  size: number;
  tier: string;
};

export type FileSystemListInput = {
  remote: string;
  path: string;
  options?: {
    recurse?: boolean; // - If set recurse directories
    noModTime?: boolean; // - If set return modification time
    showEncrypted?: boolean; // - If set show decrypted names
    showOrigIDs?: boolean; // - If set show the IDs for each item if known
    showHash?: boolean; // - If set return a dictionary of hashes
    noMimeType?: boolean; // - If set don't show mime types
    dirsOnly?: boolean; // - If set only show directories
    filesOnly?: boolean; // - If set only show files
    metadata?: boolean; // - If set return metadata of objects also
    hashTypes?: boolean; // - array of strings of hash types to show if showHash set
  };
};

export type FileSystemListOutput = {
  remote: string;
  list: FileSystemListItem[];
};

export type FileSystemStatInput = {
  remote: string;
  path: string;
  options?: FileSystemListInput['options'];
};

export type FileSystemStatOutput = { item: FileSystemListItem | null };

export type Fetch = typeof fetch;
export type FileSystemFetch = <Response extends any = any>(
  operation: FileSystemOperation,
  body: Record<string, unknown>,
) => Promise<Response>;
