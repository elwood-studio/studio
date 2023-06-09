import type { Json, JsonObject } from '@elwood/types';

import type { LocalConfigDocker, Context } from '../types.ts';

export type BuildDockerComposeOptions = {
  context: Context;
};

export async function buildDockerCompose(
  options: BuildDockerComposeOptions,
): Promise<JsonObject> {
  const { context } = options;
  const rootDir = context.workingDir.join('');

  function mapMounts(dirs: [string, string]): string {
    return [String(dirs[0]), String(dirs[1])].join(':');
  }

  const config = context.localConfig ?? {};

  return replaceRootDir(rootDir, {
    version: '3.8',
    services: {
      fs: {
        container_name: 'fs',
        ...getImageOrBuild(config.fs, 'ghcr.io/elwood-studio/fs:latest'),
        restart: 'unless-stopped',
        depends_on: ['db'],
        environment: {
          JWT_SECRET: '${JWT_SECRET}',
          DATABASE_URL:
            'postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?search_path=elwood',
          EXTERNAL_HOST: 'localhost:8000',
        },
        volumes: (config.fs?.mount ?? []).map((item) => {
          return item && mapMounts([item[0] as string, item[1] as string]);
        }),
      },
      workflow: {
        container_name: 'workflow',
        ...getImageOrBuild(
          config.workflow,
          'ghcr.io/elwood-studio/workflow:latest',
        ),
        volumes: (context.localConfig?.workflow?.mount ?? []).map((item) => {
          return item && mapMounts([item[0] as string, item[1] as string]);
        }),
        restart: 'unless-stopped',
        environment: {
          JWT_SECRET: '${JWT_SECRET}',
          DATABASE_URL:
            'postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}',
          GATEWAY_URL: 'http://localhost:8000',
          UNLOCK_KEY: '${UNLOCK_KEY}',
        },
      },
      gateway: {
        container_name: 'api',
        ...getImageOrBuild(
          config.gateway,
          'ghcr.io/elwood-studio/gateway:latest',
        ),
        restart: 'unless-stopped',
        ports: ['${KONG_HTTP_PORT}:8000/tcp'],
        environment: {
          YML_ANON_CRED: '${ANON_KEY}',
          YML_SR_KEY: '${SERVICE_ROLE_KEY}',
          FS_HOST: 'fs',
          AUTH_HOST: 'auth',
          REST_HOST: 'rest',
          REALTIME_HOST: 'realtime',
          WORKFLOW_HOST: 'workflow',
        },
      },
      db: {
        container_name: 'db',
        ...getImageOrBuild(config.db, 'ghcr.io/elwood-studio/db:latest'),
        restart: 'unless-stopped',
        ports: ['${POSTGRES_PORT}:${POSTGRES_PORT}'],
        environment: {
          POSTGRES_HOST: '/var/run/postgresql',
          PGPORT: '${POSTGRES_PORT}',
          POSTGRES_PORT: '${POSTGRES_PORT}',
          PGPASSWORD: '${POSTGRES_PASSWORD}',
          POSTGRES_PASSWORD: '${POSTGRES_PASSWORD}',
          PGDATABASE: '${POSTGRES_DB}',
          POSTGRES_DB: '${POSTGRES_DB}',
        },
      },
      auth: {
        container_name: 'auth',
        image: 'supabase/gotrue:v2.10.0',
        depends_on: ['db'],
        restart: 'unless-stopped',
        environment: {
          GOTRUE_API_HOST: '0.0.0.0',
          GOTRUE_API_PORT: 9999,
          API_EXTERNAL_URL: '${API_EXTERNAL_URL}',
          GOTRUE_DB_DRIVER: 'postgres',
          GOTRUE_DB_DATABASE_URL:
            'postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?search_path=auth',
          GOTRUE_SITE_URL: '${SITE_URL}',
          GOTRUE_URI_ALLOW_LIST: '${ADDITIONAL_REDIRECT_URLS}',
          GOTRUE_DISABLE_SIGNUP: '${DISABLE_SIGNUP}',
          GOTRUE_JWT_ADMIN_ROLES: 'service_role',
          GOTRUE_JWT_AUD: 'authenticated',
          GOTRUE_JWT_DEFAULT_GROUP_NAME: 'authenticated',
          GOTRUE_JWT_EXP: '${JWT_EXPIRY}',
          GOTRUE_JWT_SECRET: '${JWT_SECRET}',
          GOTRUE_EXTERNAL_EMAIL_ENABLED: '${ENABLE_EMAIL_SIGNUP}',
          GOTRUE_MAILER_AUTOCONFIRM: '${ENABLE_EMAIL_AUTOCONFIRM}',
          GOTRUE_SMTP_ADMIN_EMAIL: '${SMTP_ADMIN_EMAIL}',
          GOTRUE_SMTP_HOST: '${SMTP_HOST}',
          GOTRUE_SMTP_PORT: '${SMTP_PORT}',
          GOTRUE_SMTP_USER: '${SMTP_USER}',
          GOTRUE_SMTP_PASS: '${SMTP_PASS}',
          GOTRUE_SMTP_SENDER_NAME: '${SMTP_SENDER_NAME}',
          GOTRUE_MAILER_URLPATHS_INVITE: '${MAILER_URLPATHS_INVITE}',
          GOTRUE_MAILER_URLPATHS_CONFIRMATION:
            '${MAILER_URLPATHS_CONFIRMATION}',
          GOTRUE_MAILER_URLPATHS_RECOVERY: '${MAILER_URLPATHS_RECOVERY}',
          GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE:
            '${MAILER_URLPATHS_EMAIL_CHANGE}',
          GOTRUE_EXTERNAL_PHONE_ENABLED: '${ENABLE_PHONE_SIGNUP}',
          GOTRUE_SMS_AUTOCONFIRM: '${ENABLE_PHONE_AUTOCONFIRM}',
        },
      },
      rest: {
        container_name: 'rest',
        image: 'postgrest/postgrest:v9.0.1',
        depends_on: ['db'],
        restart: 'unless-stopped',
        environment: {
          PGRST_DB_URI:
            'postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}',
          PGRST_DB_SCHEMAS: '${PGRST_DB_SCHEMAS}',
          PGRST_DB_ANON_ROLE: 'anon',
          PGRST_JWT_SECRET: '${JWT_SECRET}',
          PGRST_DB_USE_LEGACY_GUCS: 'false',
        },
      },
    },
  });
}

export function replaceRootDir(rootDir: string, obj: Json): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceRootDir(rootDir, item));
  }

  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        return [key, replaceRootDir(rootDir, value)];
      }),
    );
  }

  if (typeof obj === 'string') {
    return obj.replace(/\$root/g, rootDir);
  }

  return obj;
}

export function getImageOrBuild(
  config: LocalConfigDocker = {},
  defaultImage: string,
): LocalConfigDocker {
  if (config.build) {
    return {
      build: config.build,
    };
  }

  return {
    image: config.image ?? defaultImage,
  };
}
