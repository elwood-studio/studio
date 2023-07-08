import { join, basename, extname } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { createReadStream, statSync } from 'node:fs';
import { glob } from 'glob';
import isGlob from 'is-glob';
import { invariant } from '@elwood/common';
import fs from 'fs-jetpack';
import mime from 'mime';
import ora from 'ora';

import type { FsCopyOptions, Arguments } from '../../types.ts';

export async function upload(args: Arguments<FsCopyOptions>) {
  const { source, destination, context } = args;
  const spin = ora('Sending workflow...').start();
  const client = context?.client;

  invariant(client, 'client is required');
  invariant(source, 'source is required');
  invariant(destination, 'destination is required');

  context.spin.text = 'Resolving files...';

  for (const src of normalizeSources(source)) {
    const srcUrl = new URL(src);

    switch (srcUrl.protocol) {
      // file objects need to be uploaded
      case 'file:': {
        const file = fileURLToPath(srcUrl);
        const stat = statSync(file);
        const name = basename(file);
        const type = mime.getType(extname(file)) ?? 'application/octet-stream';

        await client.fileSystem.upload.add(createReadStream(file), {
          metadata: {
            name,
            display_name: name,
            mime_type: type,
            size: String(stat.size ?? 0),
            parent: destination,
          },
          uploadSize: stat.size,
        });
        break;
      }

      // anything else needs to be sent for copy
      default: {
        spin.text = 'Starting uploads...';

        const name = basename(srcUrl.pathname);
        await client.fileSystem.copy(
          srcUrl.toString(),
          join(destination, name),
        );
      }
    }
  }

  spin.text = 'Starting uploads...';

  client.fileSystem.upload.on('progress', (evt) => {
    spin.text = `Uploaded ${evt.bytesSent} of (${evt.bytesTotal}`;
  });

  client.fileSystem.upload.on('success', (evt) => {
    spin.succeed(`Uploaded ${evt.upload.options.metadata?.name} `);
  });

  client.fileSystem.upload.on('finished', () => {
    spin.stop();
  });

  client.fileSystem.upload.on('error', (evt) => {
    spin.fail(
      `Failed to upload ${evt.upload.options.metadata?.name}, because "${evt.message}"`,
    );
  });

  await client.fileSystem.upload.start();
}

export function normalizeSources(
  source: string,
  cwd = process.cwd(),
): string[] {
  const sources: string[] = [];

  for (const src of source.split(',')) {
    if (src.includes('://')) {
      sources.push(src);
      continue;
    }

    if (isGlob(src)) {
      sources.push(
        ...glob.sync(src).map((file) => `file://${join(cwd, file)}`),
      );
    } else {
      sources.push(`file://${join(cwd, src)}`);
    }
  }

  return sources;
}
