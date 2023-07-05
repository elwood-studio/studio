import { invariant } from 'ts-invariant';
import type { Arguments, FsListOptions } from '../../types.ts';
import { outputTree } from '../../libs/output.ts';
import { printErrorMessage, printMessage } from '../../libs/print-message.ts';

export async function ls(args: Arguments<FsListOptions>) {
  invariant(args.path, 'Path is required');

  try {
    const result = await args.context?.client?.fileSystem.ls(args.path ?? '');

    result?.children.sort((a, b) => {
      return a.type === 'TREE'
        ? a.name.toLowerCase() > b.name.toLowerCase()
          ? 1
          : -1
        : 1;
    });

    invariant(result, 'Unable to output tree');

    if (result.children.length === 0 && args.output === 'table') {
      printMessage({
        message: `No files found in "${args.path}"`,
        type: 'warning',
      });
      return;
    }

    outputTree(args.output ?? 'table', result);
  } catch (err) {
    printErrorMessage(err as Error);
    return;
  }
}
