import type {
  Argv,
  Arguments,
  FsOptions,
  FsCopyOptions,
  FsSyncOptions,
  FsListOptions,
  FsMkdirOptions,
} from '../../types.ts';

import { copy } from './copy.ts';
import { sync } from './sync.ts';
import { mkdir } from './mkdir.ts';
import { ls } from './ls.ts';

export async function register(cli: Argv) {
  cli.command<FsOptions>(
    'fs <command> [...arguments]',
    false,
    () => {
      return;
    },
    async (args: Arguments<FsOptions>) => {
      const commandArguments = args.arguments ?? [];

      switch (args.command) {
        case 'upload': {
          await copy({
            ...args,
            source: commandArguments[0],
            destination: commandArguments[1],
          });
          break;
        }
        case 'download': {
          await sync({
            ...args,
            source: commandArguments[0],
          });
          break;
        }
      }
    },
  );

  cli.command<FsCopyOptions>(
    'fs:upload <source> <destination>',
    'upload a file or folder',
    (y) => {
      y.option('recursive', {
        alias: 'r',
        type: 'boolean',
        default: false,
      });
    },
    copy,
  );

  cli.command<FsSyncOptions>(
    'fs:download <source>',
    'download a file or folder',
    () => {
      return;
    },
    sync,
  );

  cli.command(
    'fs:share',
    'share a file',
    () => {
      return;
    },
    async (_args: Arguments) => {
      return;
    },
  );

  cli.command<FsMkdirOptions>(
    'fs:mkdir <path>',
    'create a director',
    (y) => {
      y.option('parents', {
        alias: 'p',
        type: 'boolean',
        default: false,
      });
    },
    mkdir,
  );

  cli.command<FsListOptions>(
    'fs:ls [path]',
    'list a director',
    (y) => {
      y.option('output', {
        alias: 'o',
        type: 'string',
        describe: 'Output format',
        choices: ['json', 'json-pretty', 'yaml', 'table'],
        default: 'table',
      });
    },
    ls,
  );

  cli.hide('fs');
}
