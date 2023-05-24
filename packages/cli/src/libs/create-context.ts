import { join, dirname } from 'node:path';
import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import * as yaml from 'yaml';
import * as toml from '@iarna/toml';
import fs from 'fs-jetpack';
import { invariant } from 'ts-invariant';
import { parse } from 'dotenv';
import { ElwoodClient } from '@elwood-studio/js';

import type {
  Context,
  Arguments,
  ContextWorkingDir,
  LocalEnv,
} from '../types.ts';
import { FilePaths } from '../constants.ts';

export async function createContext(args: Arguments): Promise<Context> {
  const workingDir = createWorkingDirContext(args.rootDir ?? process.cwd());

  // if this is an init work flow
  // we don't need to load the local client
  if (args._.length === 0 || args._[0] === 'init') {
    return {
      workingDir,
    };
  }

  // make sure we've initialized
  workingDir.require();

  const localEnv = parse<LocalEnv>(
    await readFile(workingDir.join(FilePaths.LocalDotEnv)),
  );

  return {
    localEnv,
    localClient: new ElwoodClient(
      `http://0.0.0.0:8000`,
      localEnv.SERVICE_ROLE_KEY,
    ),
    workingDir,
  };
}

export function createWorkingDirContext(rootDir: string): ContextWorkingDir {
  const _join = (...paths: string[]) => join(rootDir, 'elwood', ...paths);

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
      return createWriteStream(_join(path));
    },
  };
}
