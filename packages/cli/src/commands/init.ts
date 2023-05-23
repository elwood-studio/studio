import { randomBytes } from 'node:crypto';
import { invariant } from 'ts-invariant';
import { Argv, Arguments } from 'yargs';
import jwt from 'jsonwebtoken';
import boxen from 'boxen';

import {
  WorkingDirManager,
  workingDirManager,
} from '../libs/working-dir-manager.ts';
import { printSuccessMessage } from '../libs/print-message.ts';

export type Options = {
  force?: boolean;
};

export default async function register(cli: Argv) {
  cli.command<Options>(
    'init',
    'initialize a new project in the current directory',
    (y) => {
      y.option('force', {
        type: 'boolean',
        default: false,
      });
    },
    async (args: Arguments<Options>) => {
      await handler(workingDirManager(args), {
        force: args.force ?? false,
      });
    },
  );
}

export async function handler(
  wd: WorkingDirManager,
  options: Required<Options>,
) {
  if (options.force) {
    await wd.remove();
  }

  invariant(wd.exists() === false, `Directory ${wd.join('')} already exists.`);

  // make our dir
  await wd.ensure('local');
  await wd.ensure('workflows');
  await wd.ensure('actions');

  const ascii = boxen(
    [
      `███████ ██      ██     ██  ██████   ██████  ██████`,
      `██      ██      ██     ██ ██    ██ ██    ██ ██   ██`,
      `█████   ██      ██  █  ██ ██    ██ ██    ██ ██   ██`,
      `██      ██      ██ ███ ██ ██    ██ ██    ██ ██   ██`,
      `███████ ███████  ███ ███   ██████   ██████  ██████`,
    ].join('\n'),
    { padding: 1 },
  );

  await wd.write('workflows/readme.txt', [
    ascii,
    '',
    'This directory is for your workflows.',
    'For more information about workflows, visit',
    'https://elwood.studio/docs/workflows',
    '',
    'You can also check out our repository of workflows at',
    'https://github.com/elwood-studio/workflows',
    '',
    'Need Help?',
    'Email Us: hello@elwood.studio',
    'Join our Discord: https://elwood.studio/discord',
  ]);

  await wd.write('actions/readme.txt', [
    ascii,
    '',
    'This directory is for your workflow actions.',
    'For more information about actions, visit',
    'https://elwood.studio/docs/actions',
    '',
    'You can also check out our repository of actions at',
    'https://github.com/elwood-studio/actions',
    '',
    'Need Help?',
    'Email Us: hello@elwood.studio',
    'Join our Discord: https://elwood.studio/discord',
  ]);

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

  await wd.writeEnv('local/.env.local', {
    POSTGRES_PASSWORD: dbPassword,
    JWT_SECRET: jwtSecret,
    ANON_KEY: anonKey,
    SERVICE_ROLE_KEY: serviceKey,
  });

  await wd.writeToml('settings.toml', {
    version: 0.1,
  });

  await wd.writeToml('local/config.toml', {
    version: 0.1,
    fs: {
      a: false,
    },
    workflow: {
      a: false,
    },
    gateway: {
      port: '8000',
    },
    db: {
      host: 'db',
      name: 'postgres',
      user: 'postgres',
      port: '5432',
    },
    auth: {
      url: '',
      redirectUrls: '',
      disableSignup: false,
      externalUrl: '',
      email: {
        enabledSignup: false,
        enabledAutoconfirm: false,
      },
      phone: {
        enabledSignup: false,
        enabledAutoconfirm: false,
      },
    },
    smtp: {
      host: 'mail',
      port: '2500',
      user: '',
      pass: '',
      sender: '',
    },
    rest: {
      schemas: [],
    },
  });

  printSuccessMessage(`Initialized new project in ${wd.join('')}`);
}
