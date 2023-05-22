import { join, dirname } from 'node:path';
import { open, type FileHandle } from 'node:fs/promises';
import * as yaml from 'yaml';
import * as toml from '@iarna/toml';
import fs from 'fs-jetpack';
import { invariant } from 'ts-invariant';

import type { JsonObject } from '@elwood-studio/types';
import type { CliArguments } from '../types.ts';

export type WorkingDirManager = {
  join(...paths: string[]): string;
  ensure(path?: string): Promise<void>;
  write(file: string, content: string | string[]): Promise<void>;
  writeEnv(file: string, data: JsonObject): Promise<void>;
  writeYaml(file: string, content: string | JsonObject): Promise<void>;
  writeToml(file: string, content: JsonObject): Promise<void>;
  require(): void;
  remove(path?: string): Promise<void>;
  exists(path?: string): boolean;
  open(path: string): Promise<FileHandle>;
};

export function workingDirManager(args: CliArguments): WorkingDirManager {
  const _join = (...paths: string[]) => join(args.rootDir!, 'elwood', ...paths);

  function ensureDir(path: string): string {
    fs.dir(dirname(_join(path)));
    return _join(path);
  }

  return {
    join: _join,
    require() {
      invariant(
        fs.exists(_join('')),
        'You have not created your root directory yet.\nRun `elwood-studio init` to create it.',
      );
      invariant(
        fs.exists(_join('settings.toml')),
        'You have not created your root directory yet.\nRun `elwood-studio init` to create it.',
      );
    },
    ensure: async (path = '') => {
      await fs.dirAsync(_join(path));
    },
    write: async (file, content) => {
      const data = Array.isArray(content) ? content.join('\n') : content;
      await fs.writeAsync(ensureDir(file), data);
    },
    async writeToml(file, content) {
      await fs.writeAsync(ensureDir(file), toml.stringify(content));
    },
    async writeYaml(file, content) {
      await fs.writeAsync(
        ensureDir(file),
        typeof content === 'string' ? content : yaml.stringify(content),
      );
    },
    async writeEnv(file, data) {
      await fs.writeAsync(
        ensureDir(file),
        Object.entries(data)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n'),
      );
    },
    async remove(path = '') {
      await fs.removeAsync(_join(path));
    },
    exists(path = '') {
      return fs.exists(_join(path)) !== false;
    },
    async open(path = '') {
      return await open(_join(path), 'a');
    },
  };
}
