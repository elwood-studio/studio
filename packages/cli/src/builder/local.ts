import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

import type { WorkingDirManager } from '../libs/working-dir-manager.ts';
import { buildDockerCompose } from './docker-compose.ts';

export type BuildLocalOptions = {
  workingDir: WorkingDirManager;
};

export async function buildLocal(options: BuildLocalOptions): Promise<void> {
  const { workingDir } = options;

  await workingDir.ensure('workflows');
  await workingDir.ensure('actions');
  await workingDir.ensure('local/.build');

  await workingDir.writeYaml(
    'local/.build/docker-compose-local.yml',
    await buildDockerCompose(),
  );

  const iat = new Date().getTime() / 1000;
  const exp = 1799535600;
  const jwtSecret = randomBytes(62).toString('hex');
  const dbPassword = randomBytes(12).toString('hex');
  const anonKey = jwt.sign(
    {
      role: 'anon',
      iss: 'elwood',
      iat,
      exp,
    },
    jwtSecret,
  );
  const serviceKey = jwt.sign(
    {
      role: 'service_role',
      iss: 'elwood',
      iat,
      exp,
    },
    jwtSecret,
  );

  await workingDir.writeEnv('local/.build/.env.local', {
    POSTGRES_PASSWORD: dbPassword,
    JWT_SECRET: jwtSecret,
    ANON_KEY: anonKey,
    SERVICE_ROLE_KEY: serviceKey,
    POSTGRES_HOST: 'db',
    POSTGRES_DB: 'postgres',
    POSTGRES_USER: 'postgres',
    POSTGRES_PORT: '5432',
    KONG_HTTP_PORT: 8000,
    KONG_HTTPS_PORT: 8443,
    PGRST_DB_SCHEMAS: 'public,storage,graphql_public,workflow,elwood',
    SITE_URL: 'http://localhost:3000',
    ADDITIONAL_REDIRECT_URLS: '',
    JWT_EXPIRY: 3600,
    DISABLE_SIGNUP: false,
    API_EXTERNAL_URL: 'http://localhost:8000',
    MAILER_URLPATHS_CONFIRMATION: '/auth/v1/verify',
    MAILER_URLPATHS_INVITE: '/auth/v1/verify',
    MAILER_URLPATHS_RECOVERY: '/auth/v1/verify',
    MAILER_URLPATHS_EMAIL_CHANGE: '/auth/v1/verify',
    ENABLE_EMAIL_SIGNUP: true,
    ENABLE_EMAIL_AUTOCONFIRM: true,
    SMTP_ADMIN_EMAIL: 'admin@example.com',
    SMTP_HOST: 'mail',
    SMTP_PORT: 2500,
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_SENDER_NAME: 'fake_sender',
    ENABLE_PHONE_SIGNUP: true,
    ENABLE_PHONE_AUTOCONFIRM: true,
  });

  await workingDir.remove('local/stdout.log');
  await workingDir.remove('local/stderr.log');
}