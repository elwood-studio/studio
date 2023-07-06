import { decode, verify } from 'jsonwebtoken';
import * as authHeader from 'auth-header';
import { invariant } from '@elwood/common';
import type { AccessModel } from '@elwood/types';

import type { ObjectHandlerOptions } from '@/types.ts';
import { getEnv } from '@/libs/get-env.ts';
import { streamRCloneDownload } from '@/libs/stream-rclone.ts';

const { shareJwtSecret } = getEnv();

export default async function track(options: ObjectHandlerOptions) {
  const { params, req, res } = options;
  const { path } = params;

  invariant(verify(path, shareJwtSecret), 'Invalid token');

  const auth = getAuthHeader(req.headers.authorization);
  const { id, pw } = decode(path) as { id: string; pw: boolean };

  // if the token says we need a password and
  // one is not provided, return a 401
  if (pw && !auth) {
    res.header('WWW-Authenticate', authHeader.format('Basic'));
    res.status(401).send({
      error: 'Unauthorized',
    });
    return;
  }

  const sth = await options.db.query(
    `SELECT * FROM elwood.access WHERE "id" = $1`,
    [id],
  );

  invariant(sth.rowCount > 0, 'Object not found');

  const access = sth.rows[0] as AccessModel;

  if (access.share_password_secret_id) {
    invariant(auth, 'Password required');

    const sth = await options.db.query(
      `SELECT decrypted_secret FROM vault.decrypted_secrets WHERE "id" = $1`,
      [access.share_password_secret_id],
    );

    invariant(sth.rowCount > 0, 'Password not found');
    invariant(sth.rows[0].decrypted_secret === auth[1], 'Invalid password');
  }

  const object = await options.db.query(
    `SELECT remote_urn FROM elwood.objects WHERE "id" = $1`,
    [access.object_id],
  );

  invariant(object.rowCount > 0, 'Object not found');

  const [name, remotePath] = object.rows[0].remote_urn;

  await streamRCloneDownload({
    remote: name,
    fs: remotePath,
    res,
  });
}

function getAuthHeader(value: string | undefined): [string, string] | null {
  if (!value) {
    return null;
  }

  const { scheme, token } = authHeader.parse(value);

  if (scheme != 'Basic' || !token) {
    return null;
  }

  if (Array.isArray(token)) {
    return token as [string, string];
  }

  return Buffer.from(token, 'base64').toString().split(':', 2) as [
    string,
    string,
  ];
}
