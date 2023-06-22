import EventEmitter from 'events';
import { Pool, QueryResult } from 'pg';

import type { Json } from '@elwood/types';

import { invariant } from './invariant.ts';

interface DatabaseOptions {
  application_name?: string;
  database?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  schema?: string;
  ssl?: Json;
  connectionString?: string;
  max?: number;
  db?: Db;
}

export default class Db extends EventEmitter {
  readonly config: DatabaseOptions;

  _pool: Pool | undefined = undefined;
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

  async open() {
    this._pool = new Pool(this.config);
    this.pool.on('error', (error) => this.emit('error', error));
    this.opened = true;
  }

  async close() {
    if (this.opened) {
      this.opened = false;
      await this.pool.end();
    }
  }

  async executeSql(text: string, values: Json[]): Promise<QueryResult<Json>> {
    invariant(this.opened, 'Database not opened');
    return await this.pool.query(text, values);
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
