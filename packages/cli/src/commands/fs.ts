import { basename, extname } from 'node:path';
import { createReadStream, statSync } from 'node:fs';
import { glob } from 'glob';
import isGlob from 'is-glob';
import { invariant } from 'ts-invariant';
import fs from 'fs-jetpack';
import mime from 'mime';
import ora from 'ora';

import type { Argv, Arguments } from '../types.ts';

type TopOptions = {
  command?: 'copy' | 'sync' | 'share';
  arguments: string[];
};

type CopyOptions = {
  source?: string;
  destination?: string;
  recursive?: boolean;
};

type SyncOptions = {
  source?: string;
};

export default async function register(cli: Argv) {
  cli.command<TopOptions>(
    'fs <command> [...arguments]',
    false,
    (y) => {},
    async (args: Arguments<TopOptions>) => {
      const commandArguments = args.arguments ?? [];

      switch (args.command) {
        case 'copy': {
          await copy({
            ...args,
            source: commandArguments[0],
            destination: commandArguments[1],
          });
        }
        case 'sync': {
          await sync({
            ...args,
            source: commandArguments[0],
          });
        }
      }
    },
  );

  cli.command<CopyOptions>(
    'fs:copy <source> <destination>',
    'copy a file to/from the server',
    (y) => {
      y.option('recursive', {
        alias: 'r',
        type: 'boolean',
        default: false,
      });
    },
    copy,
  );

  cli.command<SyncOptions>(
    'fs:sync',
    'sync a folder to/from the server',
    (y) => {},
    sync,
  );

  cli.command(
    'fs:share',
    'share a file',
    (y) => {},
    async (args: Arguments) => {},
  );

  cli.hide('fs');
}

export async function copy(args: Arguments<CopyOptions>) {
  const { source, destination, context } = args;

  invariant(source, 'source is required');
  invariant(destination, 'destination is required');

  const sources = source.split(',');
  const files: string[] = [];
  const spin = ora('Sending workflow...').start();

  spin.text = 'Resolving files...';

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

    await context?.localClient?.fileSystem.upload.add(createReadStream(file), {
      metadata: {
        name,
        display_name: name,
        mime_type: type,
        size: String(stat.size ?? 0),
      },
      uploadSize: stat.size,
    });
  }

  spin.text = 'Starting uploads...';

  context?.localClient?.fileSystem.upload.on('progress', (evt) => {
    spin.text = `Uploaded ${evt.bytesSent} of (${evt.bytesTotal}`;
  });

  context?.localClient?.fileSystem.upload.on('success', (evt) => {
    spin.succeed(`Uploaded ${evt.upload.options.metadata?.name} `);
  });

  context?.localClient?.fileSystem.upload.on('finished', (evt) => {
    spin.stop();
  });

  await context?.localClient?.fileSystem.upload.start();
}

export async function sync(args: Arguments<SyncOptions>) {}
