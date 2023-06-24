const host = '$FS_HOST';

export const service = [
  {
    name: 'fs-v1-open-track',
    url: `http://${host}/track`,
    routes: [
      {
        name: 'fs-v1-open-track',
        strip_path: true,
        paths: ['/fs/v1/track'],
      },
    ],
    plugins: [],
  },
  {
    name: 'fs-v1-open-ping',
    url: `http://${host}/ping`,
    routes: [
      {
        name: 'fs-v1-open-ping',
        strip_path: true,
        paths: ['/fs/v1/ping'],
      },
    ],
    plugins: [],
  },
  {
    name: 'fs-v1-all',
    url: `http://${host}/`,
    routes: [
      {
        name: 'fs-v1-all',
        strip_path: true,
        paths: ['/fs/v1'],
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
