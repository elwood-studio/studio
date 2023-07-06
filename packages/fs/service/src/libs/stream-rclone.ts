import { type ServerResponse } from 'node:http';
import { pipeline, type PipelineSource } from 'node:stream';
import { promisify } from 'node:util';
import { invariant } from '@elwood/common';

import type { FastifyReply } from '@/types.ts';
import { fetchRclone } from './fetch-rclone.ts';

const streamPipeline = promisify(pipeline);
const ignoreHeaders = ['authorization'];

export type StreamRcloneDownloadOptions = {
  fs: string;
  remote: string;
  res: FastifyReply;
};

export async function streamRCloneDownload(
  options: StreamRcloneDownloadOptions,
): Promise<void> {
  const { fs, remote, res } = options;

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
