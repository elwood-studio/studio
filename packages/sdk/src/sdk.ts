import supa from '@supabase/supabase-js';
import type { SupabaseClientOptions } from '@supabase/supabase-js';
import { ElwoodFileSystemSdk } from '@elwood/fs-sdk';
import { ElwoodWorkflowSdk } from '@elwood/workflow-sdk';

import type { Database } from './types.ts';
import { invariant } from './libs/invariant.ts';

const { SupabaseClient } = supa;

export class ElwoodSdk extends SupabaseClient<Database, 'elwood'> {
  protected readonly _fs: ElwoodFileSystemSdk;
  protected readonly _workflow: ElwoodWorkflowSdk;

  constructor(
    url: string,
    key: string,
    opts: SupabaseClientOptions<'elwood'> = {},
  ) {
    invariant(url, 'Must provide API URL');
    invariant(key, 'Must provide API key');
    super(url, key, { ...opts, db: { schema: 'elwood' } });

    invariant(this.fetch, 'Must provide fetch method');

    this._fs = new ElwoodFileSystemSdk({
      url,
      key,
      fetch: this.fetch,
      getAuthenticationToken: this._getAuthenticationToken,
    });

    this._workflow = new ElwoodWorkflowSdk({
      url,
      key,
      fetch: this.fetch,
    });
  }

  protected _getAuthenticationToken = async () => {
    return (await this.auth.getSession()).data.session?.access_token;
  };

  get fileSystem() {
    return this._fs;
  }

  get workflow() {
    return this._workflow;
  }
}
