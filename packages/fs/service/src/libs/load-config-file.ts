import { stat, readFile } from 'node:fs/promises';

import type { JsonObject } from '@elwood-studio/types';

import { getEnv } from './get-env.ts';
import type { Config } from '@/types.ts';

const { configFilePath } = getEnv();

export async function loadConfigFile(): Promise<Config> {
  let config: Config = {};

  if (configFilePath) {
    try {
      await stat(configFilePath);
      config = {
        ...JSON.parse(await readFile(configFilePath, 'utf-8')),
      };
    } catch (_) {
      // nothing
    }
  }

  return replaceConfigValue(config);
}

export function replaceConfigValue(config: Config): Config {
  return Object.entries(config).reduce((acc, [key, value]) => {
    if (!value) {
      return acc;
    }

    if (typeof value === 'object' && value !== null) {
      return {
        ...acc,
        [key]: replaceConfigValue(value as Config),
      };
    }

    if (typeof value === 'string') {
      return {
        ...acc,
        [key]: replaceEnvValue(value),
      };
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {} as Config);
}

export function replaceEnvValue(str: string): string {
  const env = process.env as JsonObject;
  let _str = str;

  for (const [key, value] of Object.entries(env)) {
    _str = _str.replace(new RegExp(`\\$${key}`, 'g'), value);
  }

  return _str;
}
