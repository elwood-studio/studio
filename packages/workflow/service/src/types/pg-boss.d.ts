declare module 'pg-boss/src/db' {
  interface Db {
    executeSql(
      text: string,
      values: any[],
    ): Promise<{ rows: any[]; rowCount: number }>;
  }

  interface DatabaseOptions {
    application_name?: string;
    database?: string;
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    schema?: string;
    ssl?: any;
    connectionString?: string;
    max?: number;
    db?: Db;
  }

  class PgDataBase implements Db {
    constructor(options: DatabaseOptions);
    executeSql(
      text: string,
      values: any[],
    ): Promise<{ rows: any[]; rowCount: number }>;
    open(): Promise<void>;
    close(): Promise<void>;
  }

  export default PgDataBase;
}
