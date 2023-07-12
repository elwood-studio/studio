import { invariant, FileSystemNodeState } from '@elwood/common';

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

  spin.text = 'Waiting for copy to complete...';

  let complete = false;
  let loop = 0;

  while (complete === false && loop < 20) {
    const { node } = await client.fileSystem.stat(r.id);

    switch (node.state) {
      case FileSystemNodeState.Failed: {
        complete = true;
        spin.fail(`Failed to copy to ${destination}!`);
        break;
      }

      case FileSystemNodeState.Ready: {
        complete = true;
        spin.succeed(`File copied to ${destination}!`);
        break;
      }

      default: {
        await sleep(1000 * 5);

        complete = false;
        loop++;
      }
    }
  }

  if (loop >= 20) {
    spin.fail(`Unable to get status of copy to ${destination}!`);
  }

  spin.stop();
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
