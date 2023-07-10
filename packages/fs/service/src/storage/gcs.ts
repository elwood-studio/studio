import { AbstractStorage } from './abstract.ts';

export default class GcsStorageProvider extends AbstractStorage {
  async getTusDatastore() {
    const gcs = await import('@tus/gcs-store');
    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage({ keyFilename: 'key.json' });

    return new gcs.GCSStore({
      bucket: storage.bucket('tus-node-server-ci'),
    });
  }

  getAbsoluteFilepath(name: string) {
    return this.getFilepath(name);
  }
}
