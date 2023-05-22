import { join, dirname } from 'node:path';
import * as yaml from 'yaml';
import * as toml from '@iarna/toml';
import { writeAsync, dir } from 'fs-jetpack';

import type { JsonObject } from '@elwood-studio/types';
import type { CliArguments } from '@/types';

export type WorkingDirManager = {
  join(...paths: string[]): string;
  write(file: string, content: string | string[]): Promise<void>;
  writeEnv(file: string, data: JsonObject): Promise<void>;
  writeYaml(file: string, content: JsonObject): Promise<void>;
  writeToml(file: string, content: JsonObject): Promise<void>;
};

export function workingDirManager(args: CliArguments): WorkingDirManager {
  const _join = (...paths: string[]) => join(args.rootDir!, 'elwood', ...paths);

  function ensureDir(path: string): string {
    dir(dirname(_join(path)));
    return _join(path);
  }

  return {
    join: _join,
    write: async (file, content) => {
      const data = Array.isArray(content) ? content.join('\n') : content;
      await writeAsync(ensureDir(file), data);
    },
    async writeToml(file, content) {
      await writeAsync(ensureDir(file), toml.stringify(content));
    },
    async writeYaml(file, content) {
      await writeAsync(ensureDir(file), yaml.stringify(content));
    },
    async writeEnv(file, data) {
      await writeAsync(
        ensureDir(file),
        Object.entries(data)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n'),
      );
    },
  };
}
