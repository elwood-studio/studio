import type { FileSystemListInput, FileSystemStatInput } from '@/types';

import { type FileSystem } from './client';

export class FileSystemRemote {
  constructor(
    protected readonly name: string,
    protected readonly fs: FileSystem,
  ) {}

  async list(path: string, options: FileSystemListInput['options'] = {}) {
    return await this.fs.list({
      remote: this.name,
      path,
      options,
    });
  }

  async mkdir() {}

  async stat(path: string, options: FileSystemStatInput['options'] = {}) {
    return await this.fs.stat({
      remote: this.name,
      path,
      options,
    });
  }
}
