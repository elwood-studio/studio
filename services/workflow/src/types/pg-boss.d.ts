declare module 'pg-boss/src/db' {
  import { Db, DatabaseOptions } from 'pg-boss';

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
