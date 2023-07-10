import type { Ora } from 'ora';
import type {
  Argv as BaseArgv,
  ArgumentsCamelCase as BaseArguments,
} from 'yargs';
import type { DeepPartial, JsonObject } from '@elwood/types';
import type { ElwoodSdk } from '@elwood/sdk';

export type Argv = BaseArgv<Arguments>;

export type Arguments<Options = JsonObject> = BaseArguments<
  Options & {
    local?: boolean;
    rootDir?: string;
    context?: Context;
    apiUrl?: string;
    projectId?: string;
  }
>;

export type Settings = {
  version: string;
  apiUrl: string | null;
  project: string | null;
};

export type Context = {
  localEnv?: LocalEnv;
  localConfig?: LocalConfig;
  settings?: Settings;
  client?: ElwoodSdk;
  workingDir: ContextWorkingDir;
  spin: Ora;
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
  UNLOCK_KEY: string;
};

export type LocalConfigDocker = DeepPartial<{
  image: string;
  build: {
    context: string;
    dockerfile: string;
  };
}>;

export type LocalConfig = DeepPartial<{
  version: number;
  fs: LocalConfigDocker & {
    mount: Array<[string, string]>;
  };
  workflow: LocalConfigDocker & {
    mount: Array<[string, string]>;
  };
  actions: { mount: Array<[string, string]> };
  gateway: LocalConfigDocker & {
    port: number | string;
    host: string;
    externalHost: string;
  };
  db: LocalConfigDocker & {
    host: string;
    name: string;
    user: string;
    port: string;
  };
  auth: {
    disableSignup: boolean;
    externalUrl: string;
    email: {
      enabledSignup: boolean;
      enabledAutoconfirm: boolean;
    };
    phone: {
      enabledSignup: boolean;
      enabledAutoconfirm: boolean;
    };
  };
  smtp: {
    host: string;
    port: string;
    user: string;
    pass: string;
    sender: string;
  };
  rest: {
    schemas: string[];
  };
}>;

export type WorkflowOptions = WorkflowRunOptions &
  WorkflowReportOptions &
  WorkflowExecuteOptions &
  WorkflowSecretOptions & {
    command?: 'run' | 'report' | 'generate-unlock-key' | 'secret' | 'execute';
    arguments: string[];
  };

export type WorkflowRunOptions = {
  workflow?: string;
  input?: string[];
  force?: boolean;
  event?: string;
};

export type Output = 'table' | 'json' | 'json-pretty' | 'yaml';

export type WorkflowReportOptions = {
  trackingId?: string;
  output: Output;
};

export type WorkflowSecretOptions = {
  unlockKey?: string;
  keyName?: string;
  name?: string;
  value?: string;
};

export type WorkflowExecuteOptions = {
  wait?: boolean;
  input?: string[];
  workflow?: string;
  output?: WorkflowReportOptions['output'];
  force?: boolean;
  event?: string;
};

export type FsOptions = FsCopyOptions &
  FsListOptions &
  FsMkdirOptions &
  FsShareOptions &
  FsUploadOptions &
  FsSyncOptions & {
    command?: 'upload' | 'download' | 'copy';
    arguments: string[];
  };

export type FsCopyOptions = {
  source?: string;
  destination?: string;
  wait?: boolean;
};

export type FsUploadOptions = {
  source?: string;
  destination?: string;
};

export type FsSyncOptions = {
  source?: string;
  destination?: string;
};

export type FsMkdirOptions = {
  parents?: string;
  path?: string;
};

export type FsListOptions = {
  path?: string;
  output?: Output;
};

export type FsShareOptions = {
  path?: string;
  password?: string;
};

export type FsStatOptions = {
  path?: string;
};
