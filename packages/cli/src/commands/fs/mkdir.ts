import { invariant } from '@elwood/common';
import type { Arguments, FsMkdirOptions } from '../../types.ts';
import { printSuccessMessage } from '../../libs/print-message.ts';

export async function mkdir(args: Arguments<FsMkdirOptions>) {
  invariant(args.path, 'Path is required');

  await args.context?.client?.fileSystem.mkdir(args.path, {
    parents: Boolean(args.parents) ?? false,
  });

  printSuccessMessage('Complete');

  return;
}
