import { invariant } from 'ts-invariant';

export type Config = {
  port: number;
  host: string;
  externalHost: string;
  dbUrl: string;
  dataDir: string;
  jwtSecret: string;
  rcloneHost: string;
  rcloneConfig: string;
};

export function getConfig(): Config {
  try {
    const {
      DATABASE_URL,
      PORT,
      HOST,
      EXTERNAL_HOST,
      JWT_SECRET,
      RCLONE_ADDR,
      DATA_DIR,
      RCLONE_CONFIG,
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
      rcloneConfig: RCLONE_CONFIG ?? '',
    };
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
