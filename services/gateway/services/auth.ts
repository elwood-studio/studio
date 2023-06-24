const host = '$AUTH_HOST';

export const service = [
  {
    name: 'auth-v1-open',
    url: `http://${host}/verify`,
    routes: [
      {
        name: 'auth-v1-open',
        strip_path: true,
        paths: ['/auth/v1/verify'],
      },
    ],
    plugins: [
      {
        name: 'cors',
      },
    ],
  },
  {
    name: 'auth-v1-open-callback',
    url: `http://${host}/callback`,
    routes: [
      {
        name: 'auth-v1-open-callback',
        strip_path: true,
        paths: ['/auth/v1/callback'],
      },
    ],
    plugins: [
      {
        name: 'cors',
      },
    ],
  },
  {
    name: 'auth-v1-open-authorize',
    url: `http://${host}/authorize`,
    routes: [
      {
        name: 'auth-v1-open-authorize',
        strip_path: true,
        paths: ['/auth/v1/authorize'],
      },
    ],
    plugins: [
      {
        name: 'cors',
      },
    ],
  },
  {
    name: 'auth-v1',
    url: `http://${host}/`,
    routes: [
      {
        name: 'auth-v1-all',
        strip_path: true,
        paths: ['/auth/v1/'],
      },
    ],
    plugins: [
      {
        name: 'cors',
      },
      {
        name: 'key-auth',
        config: {
          hide_credentials: false,
        },
      },
      {
        name: 'acl',
        config: {
          hide_groups_header: true,
          allow: ['admin', 'anon'],
        },
      },
    ],
  },
];
