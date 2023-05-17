import type { StorageConfiguration } from '@elwood-studio/storage-types';

export type Configuration = {
  storage?: StorageConfiguration;
};

export async function loadConfiguration(): Promise<Configuration> {
  return {
    storage: {
      services: [],
    },
  };
}

export function loadConfigurationProvider(_path: string) {}
