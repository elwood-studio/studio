import fp from 'fastify-plugin';
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import { type IncomingMessage } from 'http';
import { Client } from 'pg';

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
    async onUploadFinish(_req, res, upload) {
      console.log('upload finished', upload.id);

      // tell the database that this object has been uploaded
      // and where it is locally.
      // that should trigger the post upload jobs
      try {
        await db.query(
          `
        UPDATE elwood.object 
        SET 
          "state" = 'UPLOADED',
          "remote_urn" = $2
        WHERE 
          "id" = $1`,
          [upload.metadata.object_id, ['ern', 'local', `uploads/${upload.id}`]],
        );
      } catch (err) {
        console.log(err);
      }

      return res;
    },
  });

  function transformReqUrl(req: any): IncomingMessage {
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
