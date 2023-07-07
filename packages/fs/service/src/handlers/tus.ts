import { dirname, extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import fp from 'fastify-plugin';
import { Server, Upload, Metadata } from '@tus/server';
import { FileStore } from '@tus/file-store';
import type { GCSStore } from '@tus/gcs-store';
import type { S3Store } from '@tus/s3-store';
import { type IncomingMessage } from 'http';
import type { Json } from '@elwood/types';

import type { Client } from '@/types.ts';
import { tusBeforeCreate } from '@/libs/tus-before-create.ts';
import { tusAfterCreate } from '@/libs/tus-after-create.ts';
import { failUpload } from '@/libs/fail-upload.ts';
import { getEnv, getS3Env } from '@/libs/get-env.ts';
import { HttpError } from '@/libs/errors.ts';
import { createStorageFilepath } from '@/libs/storage-filepath.ts';

const { storageProvider, dataDir } = getEnv();

type Store = FileStore | GCSStore | S3Store;

export type TusOptions = {
  db: Client;
  externalHost: string;
};

export default fp<TusOptions>(async (app, opts) => {
  const { db, externalHost } = opts;

  const tusServer = new Server({
    path: '/tus',
    respectForwardedHeaders: false,
    datastore: await createTusDataStore(),
    namingFunction(req) {
      const { display_name = '' } = Metadata.parse(
        String(req.headers['upload-metadata'] ?? ''),
      );

      return createStorageFilepath(display_name ?? '');
    },
    async onUploadCreate(req, res, upload) {
      console.log('onUploadCreate');

      try {
        await tusBeforeCreate({
          db,
          authToken: req.headers.authorization,
          id: upload.id,
          metadata: upload.metadata ?? {},
        });

        return res;
      } catch (error) {
        const err = error as Error;

        await failUpload({
          db,
          authToken: req.headers.authorization,
          upload_id: upload.id,
          object_id: upload.metadata?.object_id,
        });

        console.log('Upload Create Failed');
        console.log(err.message);
        console.log(err.stack);

        res.setHeader('upload-error', 'Upload Create Failed');

        if (err.message.includes('duplicate key')) {
          res.statusCode = 409;
          res.setHeader(
            'upload-error',
            'File with provided name already exists in this folder',
          );
        } else if (err.message.includes('parent_id')) {
          res.statusCode = 404;
          res.setHeader(
            'upload-error',
            'Parent folder does not exist or you do not have access to it',
          );
        }

        throw new HttpError(res.statusCode ?? 500, 'Upload Create Failed');
      }
    },
    async onUploadFinish(req, res, upload) {
      try {
        await tusAfterCreate({
          db,
          authToken: req.headers.authorization,
          id: upload.id,
        });
      } catch (error) {
        const err = error as Error;
        await failUpload({
          db,
          authToken: req.headers.authorization,
          upload_id: upload.id,
          object_id: upload.metadata?.object_id,
        });

        console.log('Upload Finish Failed');
        console.log(err.message);
        console.log(err.stack);

        throw new Error('Upload Finish Failed');
      }

      return res;
    },
  });

  function transformReqUrl(req: Json): IncomingMessage {
    req.headers['host'] = externalHost;
    req.baseUrl = '/fs/v1';
    return req;
  }

  app.addContentTypeParser(
    'application/offset+octet-stream',
    (_request, _payload, done) => done(null),
  );
  app.all('/tus', (req, res) => {
    tusServer.handle(transformReqUrl(req.raw), res.raw);
  });
  app.all('/tus/*', (req, res) => {
    tusServer.handle(transformReqUrl(req.raw), res.raw);
  });
});

async function createTusDataStore(): Promise<Store> {
  console.log(`tus: storage provider "${storageProvider}"`);

  switch (storageProvider) {
    case 's3': {
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
    case 'gcs': {
      const gcs = await import('@tus/gcs-store');
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage({ keyFilename: 'key.json' });

      return new gcs.GCSStore({
        bucket: storage.bucket('tus-node-server-ci'),
      });
    }
    default: {
      return new HotFixFileStore({ directory: join(dataDir, '/uploads') });
    }
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
