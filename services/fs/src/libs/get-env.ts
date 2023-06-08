import { invariant } from 'ts-invariant';

export type Env = {
  port: number;
  host: string;
  externalHost: string;
  dbUrl: string;
  dataDir: string;
  jwtSecret: string;
  rcloneHost: string;
  configFilePath?: string;
};

export function getEnv(): Env {
  try {
    const {
      DATABASE_URL,
      PORT,
      HOST,
      EXTERNAL_HOST,
      JWT_SECRET,
      RCLONE_ADDR,
      DATA_DIR,
      CONFIG_FILE,
    } = process.env ?? {};

    invariant(DATABASE_URL, 'DATABASE_URL is required');
    invariant(JWT_SECRET, 'JWT_SECRET is required');
    invariant(RCLONE_ADDR, 'RCLONE_ADDR is required');

    const port = parseInt(PORT ?? '3000', 10);
    const host = HOST ?? '0.0.0.0';
    const externalHost = EXTERNAL_HOST ?? `${host}:${port}`;

    return {
      port,
      host,
      externalHost,
      dbUrl: DATABASE_URL,
      rcloneHost: RCLONE_ADDR ?? 'http://rclone:5572',
      jwtSecret: JWT_SECRET,
      dataDir: DATA_DIR ?? '/data',
      configFilePath: CONFIG_FILE,
    };
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
