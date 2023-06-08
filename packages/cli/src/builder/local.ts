import { invariant } from 'ts-invariant';

import type { Context } from '../types.ts';
import { buildDockerCompose } from './docker-compose.ts';
import { FilePaths } from '../constants.ts';

export type BuildLocalOptions = {
  context: Context;
};

export async function buildLocal(options: BuildLocalOptions): Promise<void> {
  const { workingDir, localEnv, localConfig } = options.context;

  invariant(localEnv, 'localEnv is required');

  await workingDir.ensure(FilePaths.WorkflowsDir);
  await workingDir.ensure(FilePaths.ActionsDir);
  await workingDir.ensure(FilePaths.LocalBuildDir);

  await workingDir.writeYaml(
    FilePaths.LocalBuildDockerCompose,
    await buildDockerCompose({
      context: options.context,
    }),
  );

  await workingDir.writeEnv(FilePaths.LocalBuildDotEnv, {
    POSTGRES_PASSWORD: localEnv.POSTGRES_PASSWORD,
    JWT_SECRET: localEnv.JWT_SECRET,
    ANON_KEY: localEnv.ANON_KEY,
    SERVICE_ROLE_KEY: localEnv.SERVICE_ROLE_KEY,
    POSTGRES_HOST: localConfig?.db?.host ?? 'db',
    POSTGRES_DB: localConfig?.db?.name ?? 'postgres',
    POSTGRES_USER: localConfig?.db?.user ?? 'postgres',
    POSTGRES_PORT: localConfig?.db?.port ?? '5432',
    KONG_HTTP_PORT: localConfig?.gateway?.port ?? 8000,
    KONG_HTTPS_PORT: 8443,
    PGRST_DB_SCHEMAS:
      localConfig?.rest?.schemas ??
      'public,storage,graphql_public,workflow,elwood',
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
