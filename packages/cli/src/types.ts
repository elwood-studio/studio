import { Arguments, ArgumentsCamelCase } from 'yargs';

export type CliArguments<Options = {}> = ArgumentsCamelCase<
  Options & {
    rootDir?: string;
  }
>;
