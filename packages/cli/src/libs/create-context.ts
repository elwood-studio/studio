import { join, dirname } from 'node:path';
import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import * as yaml from 'yaml';
import * as toml from '@iarna/toml';
import fs from 'fs-jetpack';
import { invariant } from 'ts-invariant';
import { parse } from 'dotenv';
import ora from 'ora';
import { ElwoodSdk } from '@elwood/sdk';

import type {
  Context,
  Arguments,
  ContextWorkingDir,
  LocalEnv,
  Settings,
} from '../types.ts';
import { FilePaths } from '../constants.ts';
import { LocalConfig } from '../types.js';

export async function createContext(args: Arguments): Promise<Context> {
  const workingDir = createWorkingDirContext(args.rootDir ?? process.cwd());
  const spin = ora('');

  // if this is an init work flow
  // we don't need to load the local client
  if (args._.length === 0 || args._[0] === 'init') {
    return {
      spin,
      workingDir,
    };
  }

  // make sure we've initialized
  workingDir.require();

  const localEnv = parse<LocalEnv>(
    await readFile(workingDir.join(FilePaths.LocalDotEnv)),
  );

  let local = args.local ?? false;
  let localConfig: LocalConfig = {};
  let settings: Settings = {
    version: '0.0.0',
    apiUrl: args.apiUrl ?? null,
    project: args.projectId ?? null,
  };

  if (fs.exists(workingDir.join(FilePaths.LocalConfig))) {
    localConfig = toml.parse(
      (await readFile(workingDir.join(FilePaths.LocalConfig))).toString(),
    );
  }

  if (fs.exists(workingDir.join(FilePaths.Settings))) {
    settings = {
      ...settings,
      ...(toml.parse(
        (await readFile(workingDir.join(FilePaths.Settings))).toString(),
      ) as Settings),
    };
  }

  const localHost = localConfig.gateway?.host ?? '0.0.0.0';
  const localPort = localConfig.gateway?.port ?? 8000;

  const localClient = new ElwoodSdk(
    `http://${localHost}:${localPort}`,
    localEnv.SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${localEnv.SERVICE_ROLE_KEY}`,
        },
      },
    },
  );

  const remoteClient = new ElwoodSdk(
    args.apiUrl ?? `https://api.elwood.studio`,
    localEnv.SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  // if there's no project id, assume we're in local mode
  if (!settings.project && !local) {
    local = true;
  }

  return {
    spin,
    client: local ? localClient : remoteClient,
    settings,
    localEnv,
    workingDir,
    localConfig,
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
