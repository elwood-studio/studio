import type { ArgumentsCamelCase } from 'yargs';
import type { JsonObject } from '@elwood-studio/types';

export type CliArguments<Options = JsonObject> = ArgumentsCamelCase<
  Options & {
    rootDir?: string;
  }
>;
