import { invariant } from 'ts-invariant';
import type { Arguments, FsListOptions } from '../../types.ts';
import { outputTree } from '../../libs/output.ts';
import { printMessage } from '../../libs/print-message.ts';

export async function ls(args: Arguments<FsListOptions>) {
  invariant(args.path, 'Path is required');

  const result = await args.context?.client?.fileSystem.ls(args.path ?? '');

  invariant(result, 'Unable to output tree');

  if (result.children.length === 0 && args.output === 'table') {
    printMessage({
      message: `No files found in "${args.path}"`,
      type: 'warning',
    });
    return;
  }

  outputTree(args.output ?? 'table', result);
}
