import type { JsonObject } from '@elwood-studio/types';

export type Config = {
  remotes?: Record<
    string,
    {
      type: string;
      params: JsonObject;
    }
  >;
};
