import SupabaseClientPkg, {
  SupabaseClientOptions,
} from '@supabase/supabase-js';

type Database = any;

import { invariant } from './libs/invariant';
import { FileSystemClient } from './file-system';
import { WorkflowClient } from './workflow';

const { SupabaseClient } = SupabaseClientPkg;

export class Client extends SupabaseClient<Database, 'elwood'> {
  protected readonly _fs: FileSystemClient;
  protected readonly _workflow: WorkflowClient;

  constructor(
    url: string,
    key: string,
    opts: SupabaseClientOptions<'elwood'> = {},
  ) {
    invariant(url, 'Must provide API URL');
    invariant(key, 'Must provide API key');
    super(url, key, { ...opts, db: { schema: 'elwood' } });

    this._fs = new FileSystemClient({
      url,
      key,
      fetch: this.fetch!,
      getAuthenticationToken: this._getAuthenticationToken,
    });

    this._workflow = new WorkflowClient({
      url,
      key,
      fetch: this.fetch!,
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
