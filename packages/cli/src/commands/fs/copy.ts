import { invariant } from '@elwood/common';
import fs from 'fs-jetpack';
import ora from 'ora';

import type { FsCopyOptions, Arguments } from '../../types.ts';
import { upload } from './upload.ts';

export async function copy(args: Arguments<FsCopyOptions>) {
  const { source, destination, wait, context } = args;
  const spin = ora('Starting copy...').start();
  const client = context?.client;

  invariant(client, 'client is required');
  invariant(source, 'source is required');
  invariant(destination, 'destination is required');

  // if it's a local file
  // send it to upload
  if (!source.includes('://')) {
    return await upload(args);
  }

  spin.text = 'Sending copy...';

  const r = await client.fileSystem.copy(source, destination);

  if (wait !== true) {
    spin.succeed(`File copy operation to ${destination} has been queued`);
    return;
  }

  let complete = false;

  while (complete === false) {
    const _ = await client.fileSystem.stat(r.id);

    complete = true;
  }

  spin.succeed(`File copied to ${destination}!`);
}
