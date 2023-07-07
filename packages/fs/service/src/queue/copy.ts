import { basename } from 'node:path';
import { invariant } from '@elwood/common';

import type { PgBoss, Client } from '@/types.ts';
import { fetchRclone } from '@/libs/fetch-rclone.ts';
import { createStorageRemoteConfig } from '@/libs/rclone-remote.ts';
import { createStorageFilepath } from '@/libs/storage-filepath.ts';
import { getS3Env } from '@/libs/get-env.ts';

type Data = {
  source: string;
  object_id: string;
};

type Output =
  | { ok: true }
  | {
      error: true;
      message: string;
    };

const { bucket } = getS3Env();

export default async function register(
  boss: PgBoss,
  db: Client,
): Promise<void> {
  await boss.work<Data, Output>('fs:copy', async (job) => {
    console.log('fs:copy', job.data);

    try {
      const url = job.data.source;
      const uploadId = createStorageFilepath(basename(url));

      console.log({
        fs: createStorageRemoteConfig(),
        remote: `${bucket}/${uploadId}`,
        url,
        autoFilename: false,
      });

      const response = await fetchRclone('/operations/copyurl', {
        body: JSON.stringify({
          fs: createStorageRemoteConfig(),
          remote: `${bucket}/${uploadId}`,
          url,
          autoFilename: false,
        }),
      });

      invariant(response.ok, 'Failed to copy file');

      const sql = `
        UPDATE elwood.object 
        SET 
          "state" = $3,
          "content_hash" = $2,
          "remote_urn" = $4
        WHERE 
          "id" = $1
      `;

      await db.query(sql, [
        job.data.object_id,
        '',
        'READY',
        ['storage', uploadId],
      ]);

      return { ok: true };
    } catch (error) {
      const message = (error as Error).message;
      await db.query(
        `
          UPDATE elwood.object 
          SET 
            "state" = "FAILED"::elwood.object_state, 
            "data" = jsonb_set("data", '{job_error}', '"${message}"') 
          WHERE 
            "id" = $1
        `,
        [job.data.object_id],
      );

      return {
        error: true,
        message,
      };
    }
  });
}
