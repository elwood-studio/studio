import { invariant } from '@elwood/common';
import type { FileSystem } from '@elwood/types';

import type { Arguments, FsListOptions } from '../../types.ts';
import { outputTree } from '../../libs/output.ts';
import { printErrorMessage, printMessage } from '../../libs/print-message.ts';

export async function ls(args: Arguments<FsListOptions>) {
  invariant(args.path, 'Path is required');

  try {
    const result = await args.context?.client?.fileSystem.ls(args.path ?? '');

    invariant(result, 'Unable to output tree');

    const tree =
      result?.children.filter((child) => child.type === 'TREE') ??
      ([] as FileSystem.Node[]);
    const blobs =
      result?.children.filter((child) => child.type === 'BLOB') ??
      ([] as FileSystem.Node[]);

    tree.sort((a, b) => {
      return a.display_name.localeCompare(b.display_name);
    });

    blobs.sort((a, b) => {
      return a.display_name.localeCompare(b.display_name);
    });

    const children = [...tree, ...blobs];

    if (children.length === 0 && args.output === 'table') {
      printMessage({
        message: `No files found in "${args.path}"`,
        type: 'warning',
      });
      return;
    }

    outputTree(args.output ?? 'table', { ...result, children });
  } catch (err) {
    printErrorMessage(err as Error);
    return;
  }
}
