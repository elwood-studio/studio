import fp from 'fastify-plugin';
import { Server, Metadata } from '@tus/server';
import { type IncomingMessage } from 'http';
import type { Json } from '@elwood/types';

import type { Client, StorageProvider } from '@/types.ts';
import { tusBeforeCreate } from '@/libs/tus-before-create.ts';
import { tusAfterCreate } from '@/libs/tus-after-create.ts';
import { failUpload } from '@/libs/fail-upload.ts';
import { HttpError } from '@/libs/errors.ts';

export type TusOptions = {
  db: Client;
  externalHost: string;
  storageProvider: StorageProvider;
};

export default fp<TusOptions>(async (app, opts) => {
  const { db, storageProvider, externalHost } = opts;

  const tusServer = new Server({
    path: '/tus',
    respectForwardedHeaders: false,
    datastore: await storageProvider.getTusDatastore(),
    namingFunction(req) {
      const { display_name = '' } = Metadata.parse(
        String(req.headers['upload-metadata'] ?? ''),
      );

      return storageProvider.getFilepath(display_name ?? '');
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
