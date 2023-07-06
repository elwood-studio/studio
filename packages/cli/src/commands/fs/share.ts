import { invariant } from 'ts-invariant';
import type { Arguments, FsShareOptions } from '../../types.ts';
import { printSuccessMessage } from '../../libs/print-message.ts';

export async function share(args: Arguments<FsShareOptions>) {
  invariant(args.path, 'Path is required');

  const result = await args.context?.client?.fileSystem.share(args.path, {
    password: args.password,
  });

  printSuccessMessage(`Share URL: ${result?.url}`, 'Complete');
}
