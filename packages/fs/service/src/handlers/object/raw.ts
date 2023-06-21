import { basename } from 'node:path';

import type { ObjectHandlerOptions } from '@/types.ts';
import { streamRCloneDownload } from '@/libs/stream-rclone.ts';
import { invariant } from '@/libs/invariant.ts';

export default async function raw(options: ObjectHandlerOptions) {
  const { params, req, res, authToken } = options;
  const { dl } = req.query as {
    dl?: boolean;
  };

  invariant(authToken?.role !== 'anon', 'must provide a user token');

  if (dl !== undefined && dl) {
    res.header(
      'Content-Disposition',
      `attachment; filename="${basename(params.path)}"`,
    );
  }

  await streamRCloneDownload('name', params.path, res);
}
