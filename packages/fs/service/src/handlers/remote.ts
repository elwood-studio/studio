import fp from 'fastify-plugin';
import { invariant } from '@elwood/common';

import type { Client, Config } from '@/types.ts';
import { getAuthTokenFromRequest } from '@/libs/get-auth-token.ts';

export type ProxyOptions = {
  db: Client;
  config: Config;
};

export default fp<ProxyOptions>(async (app, opts) => {
  const { db } = opts;

  app.route({
    method: 'GET',
    url: '/remote',
    async handler(_req, res) {
      res.send([]);
    },
  });

  app.route({
    method: ['GET', 'DELETE'],
    url: '/remote/:name',
    async handler(_req, res) {
      res.send({});
    },
  });

  app.route({
    method: 'POST',
    url: '/remote',
    async handler(req, res) {
      const { role } = getAuthTokenFromRequest(req) ?? {};
      invariant(role === 'service_role', "role must be 'service_role'");

      const {
        name,
        type,
        options = {},
        parameters = {},
      } = req.body as {
        name: string;
        type: string;
        options: Record<string, unknown>;
        parameters: Record<string, unknown>;
      };

      const result = await db.query(
        ` 
        INSERT INTO "elwood"."remote" SET
        ("name", "type", "options", "parameters") VALUES
        ($1, $2, $3, $4)
        RETURNING "id"
      `,
        [name, type, options, parameters],
      );

      invariant(result.rowCount === 1, 'insert failed');

      res.send({
        id: result.rows[0].id,
      });
    },
  });
});
