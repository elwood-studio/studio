import { ServerResponse } from 'node:http';
import { pipeline, type PipelineSource } from 'node:stream';
import { promisify } from 'node:util';
import { URL } from 'node:url';
import fp from 'fastify-plugin';
import { Client } from 'pg';
import staticPlugin from '@fastify/static';
import invariant from 'ts-invariant';

import { getAuthToken, getAuthTokenFromRequest } from '../libs/get-auth-token';
import { fetchRclone } from '../libs/fetch-rclone';

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

  app.get('/download/:name/*', async (req, res) => {
    const { name, '*': path } = req.params as { name: string; '*': string };
    const { token } = req.query as {
      token?: string;
    };

    invariant(token, 'token must be defined');
    const { role } = getAuthToken(token);
    invariant(role !== 'anon', 'must provide a user token');

    const response = await fetchRclone(`/operations/publiclink`, {
      body: JSON.stringify({
        fs: `${name}:`,
        remote: path,
      }),
    });

    const { url } = (await response.json()) as { url: string };

    invariant(url, 'url must be defined');

    const fileResponse = await fetch(url);

    res.status(fileResponse.status);

    await streamPipeline<PipelineSource<ReadableStream>, ServerResponse>(
      fileResponse.body as unknown as PipelineSource<ReadableStream>,
      res.raw,
    );
  });

  app.post('*', async (req, res) => {
    const { role } = getAuthTokenFromRequest(req);
    invariant(role === 'service_role', "role must be 'service_role'");

    const { pathname, searchParams } = new URL(
      `http://${rcloneHost}${req.url}`,
    );

    searchParams.delete('apikey');

    const response = await fetchRclone(`${pathname}?${searchParams}`, {
      body:
        typeof req.body === 'string'
          ? String(req.body)
          : JSON.stringify(req.body),
    });

    for (const [key, value] of response.headers.entries()) {
      if (!ignoreHeaders.includes(key.toLocaleLowerCase())) {
        res.header(key, value);
      }
    }

    res.status(response.status);

    await streamPipeline<PipelineSource<ReadableStream>, ServerResponse>(
      response.body as unknown as PipelineSource<ReadableStream>,
      res.raw,
    );
  });
});
