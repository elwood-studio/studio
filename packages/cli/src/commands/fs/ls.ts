import { invariant } from 'ts-invariant';
import type { Arguments, FsListOptions } from '../../types.ts';
import { outputTree } from '../../libs/output.ts';

export async function ls(args: Arguments<FsListOptions>) {
  invariant(args.path, 'Path is required');

  const result = await args.context?.client?.fileSystem.ls(args.path ?? '');

  invariant(result, 'Unable to output tree');

  outputTree(args.output ?? 'table', result);
}
