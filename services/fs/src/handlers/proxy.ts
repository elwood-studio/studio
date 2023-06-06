import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import fp from 'fastify-plugin';
import { Client } from 'pg';
import staticPlugin from '@fastify/static';

const ignoreHeaders = ['authorization'];

export type ProxyOptions = {
  db: Client;
  rcloneHost: string;
  externalHost: string;
};

export default fp<ProxyOptions>(async (app, opts) => {
  const { rcloneHost } = opts;
  const streamPipeline = promisify(pipeline);

  app.register(staticPlugin, {
    root: `/data/local`,
  });

  app.get('/download/*', async (req, res) => {
    res.sendFile(req.url.replace('/download', ''));
  });

  app.post('*', async (req, res) => {
    const response = await fetch(`http://${rcloneHost}${req.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    for (const [key, value] of response.headers.entries()) {
      if (!ignoreHeaders.includes(key.toLocaleLowerCase())) {
        res.header(key, value);
      }
    }

    res.status(response.status);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await streamPipeline(response.body, res.raw);
  });
});
