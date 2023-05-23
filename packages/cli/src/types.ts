import type {
  Argv as BaseArgv,
  ArgumentsCamelCase as BaseArguments,
} from 'yargs';
import type { JsonObject } from '@elwood-studio/types';
import type { ElwoodClient } from '@elwood-studio/js';

export type Argv = BaseArgv<Arguments>;

export type Arguments<Options = JsonObject> = BaseArguments<
  Options & {
    local?: boolean;
    rootDir?: string;
    context?: Context;
  }
>;

export type Context = {
  localClient?: ElwoodClient;
  workingDir: ContextWorkingDir;
};

export type ContextWorkingDir = {
  join(...paths: string[]): string;
  ensure(path?: string): Promise<void>;
  write(file: string, content: string | string[]): Promise<void>;
  writeEnv(file: string, data: JsonObject): Promise<void>;
  writeYaml(file: string, content: string | JsonObject): Promise<void>;
  writeToml(file: string, content: JsonObject): Promise<void>;
  require(): void;
  remove(path?: string): Promise<void>;
  exists(path?: string): boolean;
  open(path: string): Promise<NodeJS.WritableStream>;
};

export type LocalEnv = {
  POSTGRES_PASSWORD: string;
  JWT_SECRET: string;
  ANON_KEY: string;
  SERVICE_ROLE_KEY: string;
};
