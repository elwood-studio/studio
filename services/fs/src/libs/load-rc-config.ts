import { join } from 'node:path';
import { stat, readFile } from 'node:fs/promises';

import type { JsonObject } from '@elwood-studio/types';

import { getConfig } from './get-config';
import { fetchRclone } from './fetch-rclone';

const { dataDir, rcloneConfig } = getConfig();

type RcloneConfig = {
  remotes?: JsonObject[];
};

export async function loadRcConfig(): Promise<void> {
  let config: RcloneConfig = {};
  const rcloneConfigFile = join(dataDir, 'rclone.json');

  try {
    await stat(rcloneConfig);
    config = {
      ...JSON.parse(await readFile(rcloneConfigFile, 'utf-8')),
    };
  } catch (_) {
    // nothing
  }

  try {
    if (rcloneConfig) {
      config = {
        ...JSON.parse(rcloneConfig),
      };
    }
  } catch (_) {
    // nothing
  }

  // loop through each remote and send it
  if (Array.isArray(config.remotes)) {
    for (const remote of config.remotes) {
      await fetchRclone('config/create', {
        body: JSON.stringify(remote),
      });
    }
  }
}
