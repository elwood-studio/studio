import { invariant } from '@elwood/common';

export type Env = {
  storageProvider: 'local' | 's3' | 'gcs';
  port: number;
  host: string;
  externalHost: string;
  dbUrl: string;
  dataDir: string;
  jwtSecret: string;
  rcloneHost: string;
  configFilePath?: string;
  shareJwtSecret: string;
  shareUrlTpl: string;
};

export function getEnv(): Env {
  try {
    const {
      STORAGE_PROVIDER = 'local',
      DATABASE_URL,
      PORT,
      HOST,
      EXTERNAL_HOST,
      JWT_SECRET,
      RCLONE_ADDR,
      DATA_DIR,
      CONFIG_FILE,
      SHARE_JWT_SECRET,
      SHARE_URL_TPL,
    } = process.env ?? {};

    invariant(STORAGE_PROVIDER, 'STORAGE_PROVIDER is required');
    invariant(DATABASE_URL, 'DATABASE_URL is required');
    invariant(JWT_SECRET, 'JWT_SECRET is required');
    invariant(RCLONE_ADDR, 'RCLONE_ADDR is required');
    invariant(SHARE_JWT_SECRET, 'SHARE_JWT_SECRET is required');

    const port = parseInt(PORT ?? '3000', 10);
    const host = HOST ?? '0.0.0.0';
    const externalHost = EXTERNAL_HOST ?? `${host}:${port}`;

    return {
      port,
      host,
      externalHost,
      storageProvider: (STORAGE_PROVIDER ?? 'local') as Env['storageProvider'],
      dbUrl: DATABASE_URL,
      rcloneHost: RCLONE_ADDR ?? 'http://rclone:5572',
      jwtSecret: JWT_SECRET,
      dataDir: DATA_DIR ?? '/data',
      configFilePath: CONFIG_FILE,
      shareJwtSecret: SHARE_JWT_SECRET,
      shareUrlTpl:
        SHARE_URL_TPL ?? `http://${externalHost}/fs/v1/track/{token}`,
    };
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
