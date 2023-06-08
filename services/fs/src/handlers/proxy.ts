import { type ServerResponse } from 'node:http';
import { pipeline, type PipelineSource } from 'node:stream';
import { promisify } from 'node:util';
import { URL } from 'node:url';
import fp from 'fastify-plugin';
import type { FastifyReply } from 'fastify';
import { Client } from 'pg';
import invariant from 'ts-invariant';

import type { Config } from '../types';
import { getAuthToken, getAuthTokenFromRequest } from '../libs/get-auth-token';
import { fetchRclone } from '../libs/fetch-rclone';
import { getEnv } from '../libs/get-env';
import { basename } from 'node:path';

const streamPipeline = promisify(pipeline);
const { rcloneHost } = getEnv();
const ignoreHeaders = ['authorization'];

export type ProxyOptions = {
  db: Client;
  externalHost: string;
  config: Config;
};

export default fp<ProxyOptions>(async (app, opts) => {
  const { config } = opts;

  app.get('/raw/:name/*', async (req, res) => {
    const { name: _name, '*': path } = req.params as {
      name: string;
      '*': string;
    };
    const { token, dl } = req.query as {
      token?: string;
      dl?: boolean;
    };

    invariant(token, 'token must be defined');
    const { role } = getAuthToken(token);
    invariant(role !== 'anon', 'must provide a user token');

    let name = _name;

    if (config.remotes && config.remotes[name]) {
      const c = config.remotes[name];
      const p = [
        c,
        ...Object.values(c.params).map(([key, value]) => `${key}=${value}`),
      ];

      name = `:${p.join(',')}:`;
    }

    if (dl !== undefined && dl) {
      res.header(
        'Content-Disposition',
        `attachment; filename="${basename(path)}"`,
      );
    }

    await streamRCloneDownload(name, path, res);
  });

  app.post('*', async (req, res) => {
    const { role } = getAuthTokenFromRequest(req);
    invariant(role === 'service_role', "role must be 'service_role'");

    const { pathname, searchParams } = new URL(
      `http://${rcloneHost}${req.url}`,
    );

    searchParams.delete('apikey');

    const body =
      typeof req.body === 'string'
        ? String(req.body)
        : JSON.stringify(req.body);

    await streamRcloneRequest(`${pathname}?${searchParams}`, body, res);
  });
});

export async function streamRcloneRequest(
  url: string,
  body: string,
  res: FastifyReply,
): Promise<void> {
  const response = await fetchRclone(url, { body });

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
}

export async function streamRCloneDownload(
  fs: string,
  remote: string,
  res: FastifyReply,
): Promise<void> {
  const response = await fetchRclone(`/operations/publiclink`, {
    body: JSON.stringify({
      fs,
      remote,
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
}
