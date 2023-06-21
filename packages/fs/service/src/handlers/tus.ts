import fp from 'fastify-plugin';
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import { type IncomingMessage } from 'http';
import { Client } from 'pg';

import type { Json } from '@elwood-studio/types';

import { tusBeforeCreate } from '@/libs/tus-before-create.ts';
import { tusAfterCreate } from '@/libs/tus-after-create.ts';
import { failUpload } from '@/libs/fail-upload.ts';

export type TusOptions = {
  db: Client;
  externalHost: string;
};

export default fp<TusOptions>(async (app, opts) => {
  const { db, externalHost } = opts;

  const tusServer = new Server({
    path: '/tus',
    respectForwardedHeaders: false,
    datastore: new FileStore({ directory: '/data/uploads' }),
    async onUploadCreate(req, res, upload) {
      try {
        await tusBeforeCreate({
          db,
          authToken: req.headers.authorization,
          id: upload.id,
          metadata: upload.metadata ?? {},
        });
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
      }

      return res;
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