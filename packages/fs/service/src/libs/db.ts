import EventEmitter from 'events';
import { Pool, PoolClient, QueryResult, type QueryResultRow } from 'pg';

import type { Json } from '@elwood/types';
import { invariant } from '@elwood/common';

import type { Client, DatabaseOptions } from '@/types.ts';

export default class Db extends EventEmitter implements Client {
  readonly config: DatabaseOptions;

  _pool: Pool | undefined = undefined;
  _client: PoolClient | undefined = undefined;
  opened = false;

  constructor(config: DatabaseOptions) {
    super();

    config.application_name = config.application_name || 'pgboss';

    this.config = config;
  }

  get pool() {
    invariant(this._pool, 'Pool not initialized');
    return this._pool;
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: Json[] = [],
  ): Promise<QueryResult<T>> {
    return (await this._client?.query<T>(sql, params)) as QueryResult<T>;
  }

  async open() {
    this._pool = new Pool(this.config);
    this._client = await this._pool.connect();
  }

  async close() {
    if (this.opened) {
      this.opened = false;
      await this.pool.end();
    }
  }

  async executeSql(text: string, values: Json[]): Promise<QueryResult<Json>> {
    invariant(this._client, 'Database not opened');
    return await this._client.query(text, values);
  }

  static quotePostgresStr(str: string) {
    const delimiter = '$sanitize$';
    if (str.includes(delimiter)) {
      throw new Error(
        `Attempted to quote string that contains reserved Postgres delimiter: ${str}`,
      );
    }
    return `${delimiter}${str}${delimiter}`;
  }
}
