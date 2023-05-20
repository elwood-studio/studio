import { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

type Database = any;

import { invariant } from './libs/invariant';
import { FileSystem } from './file-system/client';

export class Client extends SupabaseClient<Database, 'elwood'> {
  protected readonly _fs: FileSystem;

  constructor(
    url: string,
    key: string,
    opts: SupabaseClientOptions<'elwood'> = {},
  ) {
    invariant(url, 'Must provide API URL');
    invariant(key, 'Must provide API key');
    super(url, key, { ...opts, db: { schema: 'elwood' } });

    this._fs = new FileSystem({
      url,
      key,
      fetch: this.fetch!,
    });
  }

  get fileSystem() {
    return this._fs;
  }

  fs(name: string) {
    return this._fs.remote(name);
  }
}
