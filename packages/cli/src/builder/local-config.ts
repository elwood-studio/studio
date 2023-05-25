import type { LocalConfig } from '../types.ts';

export async function buildLocalConfig(): Promise<LocalConfig> {
  return {
    version: 0.1,
    fs: {
      mount: [['$root/data', '/data']],
    },
    workflow: {
      mount: [
        ['$root/workflows', '/var/workflows'],
        ['$root/actions', '/var/actions'],
        ['$root/data', '/data'],
      ],
    },
    gateway: {
      port: '8000',
      externalHost: 'localhost',
    },
    db: {
      host: 'db',
      name: 'postgres',
      user: 'postgres',
      port: '5432',
    },
    auth: {
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
  };
}
