import { getS3Env } from '@/libs/get-env.ts';
import { AbstractStorage } from './abstract.ts';

export default class S3StorageProvider extends AbstractStorage {
  async getTusDatastore() {
    const s3 = await import('@tus/s3-store');
    const env = getS3Env();

    return new s3.S3Store({
      partSize: 8 * 1024 * 1024,
      s3ClientConfig: {
        bucket: env.bucket,
        region: env.region,
        credentials: {
          accessKeyId: env.key,
          secretAccessKey: env.secret,
        },
      },
    });
  }

  getAbsoluteFilepath(name: string) {
    const { bucket } = getS3Env();
    return `${bucket}/${this.getFilepath(name)}`;
  }
}
