import { join, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { FileStore } from '@tus/file-store';
import type { Upload } from '@tus/server';

import type { StorageProvider } from '@/types.ts';
import { getEnv } from '@/libs/get-env.ts';
import { AbstractStorage } from './abstract.ts';

export default class LocalStorage
  extends AbstractStorage
  implements StorageProvider
{
  async getTusDatastore() {
    const { dataDir } = getEnv();
    return new HotFixFileStore({ directory: join(dataDir) });
  }

  getAbsoluteFilepath(name: string) {
    return this.getFilepath(name);
  }
}

class HotFixFileStore extends FileStore {
  create(file: Upload): Promise<Upload> {
    mkdirSync(join(this.directory, dirname(file.id)), {
      mode: '0777',
      recursive: true,
    });
    return super.create(file);
  }
}
