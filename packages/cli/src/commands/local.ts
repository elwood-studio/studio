import { Argv, Arguments } from 'yargs';
import { spawn } from 'node:child_process';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

import {
  workingDirManager,
  WorkingDirManager,
} from '../libs/working-dir-manager.ts';
import { buildDockerCompose } from '../libs/build-docker-compose.ts';

export type Options = {};

export default async function register(cli: Argv) {
  cli.command<Options>(
    'start',
    'start the server using docker-compose',
    (y) => {},
    async (args: Arguments<Options>) => {
      await start(workingDirManager(args), {});
    },
  );

  cli.command<Options>(
    'stop',
    'stop the server',
    (y) => {},
    async (args: Arguments<Options>) => {
      await stop(workingDirManager(args), {});
    },
  );
}

export async function stop(workingDir: WorkingDirManager, options: Options) {
  await new Promise<number>((resolve, reject) => {
    const proc = spawn('docker-compose', [
      '--project-name',
      'elwood',
      '-f',
      workingDir.join('local/docker-compose-local.yml'),
      '--env-file',
      workingDir.join('local/.env.local'),
      'down',
    ]);

    proc.on('exit', (code) => {
      setTimeout(() => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(code);
        }
      }, 500);
    });
  });
}

export async function start(workingDir: WorkingDirManager, options: Options) {
  try {
    workingDir.require();
    await workingDir.ensure('workflows');

    await workingDir.writeYaml(
      'local/docker-compose-local.yml',
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

    await workingDir.writeEnv('local/.env.local', {
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

    const stdout = await workingDir.open('local/stdout.log');
    const stderr = await workingDir.open('local/stderr.log');

    const code = await new Promise<number>((resolve, reject) => {
      const proc = spawn('docker-compose', [
        '--project-name',
        'elwood',
        '-f',
        workingDir.join('local/docker-compose-local.yml'),
        '--env-file',
        workingDir.join('local/.env.local'),
        'up',
        '--detach',
      ]);

      proc.stdout.on('data', (chunk) => {
        stdout.write(chunk);
      });

      proc.stderr.on('data', (chunk) => {
        stderr.write(chunk);
      });

      proc.on('exit', (code) => {
        setTimeout(() => {
          if (code === 0) {
            resolve(code);
          } else {
            reject(code);
          }
        }, 500);
      });
    });

    await stdout.close();
    await stderr.close();

    console.log(code);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  // await docker.upAll({
  //   cwd: workingDir.join('local'),
  //   config: [
  //     workingDir.join('docker-compose.yml'),
  //     workingDir.join('local/docker-compose-local.yml'),
  //   ],
  //   commandOptions: [`--env-file ${workingDir.join('local/.env.local')})}`],
  //   callback(chunk, streamSource) {
  //     if (streamSource === 'stdout') {
  //       stdout.write(chunk);
  //     } else if (streamSource === 'stderr') {
  //       stderr.write(chunk);
  //     }
  //   },
  // });
}
