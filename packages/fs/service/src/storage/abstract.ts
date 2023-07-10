import { randomBytes } from 'node:crypto';
import { extname, join } from 'node:path';

import type { StorageProvider } from '@/types.ts';
import { getEnv } from '@/libs/get-env.ts';

const { storageProvider } = getEnv();

export abstract class AbstractStorage {
  static async createStorageProvider(): Promise<StorageProvider> {
    switch (storageProvider) {
      case 's3': {
        return new (await import('./s3.ts')).default();
      }

      case 'gcs': {
        return new (await import('./gcs.ts')).default();
      }

      default: {
        return new (await import('./local.ts')).default();
      }
    }
  }

  getFilepath(name: string): string {
    const d = new Date();

    return join(
      d.getFullYear().toString(),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getDate().toString().padStart(2, '0'),
      `${randomBytes(16).toString('hex')}/source${extname(name)}`,
    );
  }

  abstract getTusDatastore(): ReturnType<StorageProvider['getTusDatastore']>;
  abstract getAbsoluteFilepath(
    name: string,
  ): ReturnType<StorageProvider['getAbsoluteFilepath']>;
}
