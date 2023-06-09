import { URL } from 'node:url';
import fp from 'fastify-plugin';
import { invariant } from '@elwood/common';

import type { Client, Config } from '@/types.ts';
import { getAuthTokenFromRequest } from '@/libs/get-auth-token.ts';
import { getEnv } from '@/libs/get-env.ts';
import { streamRcloneRequest } from '@/libs/stream-rclone.ts';

const { rcloneHost } = getEnv();

export type ProxyOptions = {
  db: Client;
  externalHost: string;
  config: Config;
};

export default fp<ProxyOptions>(async (app, _opts) => {
  app.post('*', async (req, res) => {
    const { role } = getAuthTokenFromRequest(req) ?? {};
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
