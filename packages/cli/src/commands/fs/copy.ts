import { basename, extname } from 'node:path';
import { createReadStream, statSync } from 'node:fs';
import { glob } from 'glob';
import isGlob from 'is-glob';
import { invariant } from 'ts-invariant';
import fs from 'fs-jetpack';
import mime from 'mime';
import ora from 'ora';

import type { FsCopyOptions, Arguments } from '../../types.ts';

export async function copy(args: Arguments<FsCopyOptions>) {
  const { source, destination, context } = args;

  invariant(source, 'source is required');
  invariant(destination, 'destination is required');

  const sources = source.split(',');
  const files: string[] = [];
  const spin = ora('Sending workflow...').start();
  const client = context?.client;

  invariant(client, 'client is required');

  context.spin.text = 'Resolving files...';

  for (const src of sources) {
    if (isGlob(src)) {
      files.push(...glob.sync(src));
    } else {
      invariant(await fs.existsAsync(src), `Source "${src}" does not exist`);
      files.push(src);
    }
  }

  // filter our our directories
  const finalFiles = files.filter((file) => fs.inspect(file)?.type === 'file');

  spin.text = `Found ${finalFiles.length} files, uploading...`;

  for (const file of finalFiles) {
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
